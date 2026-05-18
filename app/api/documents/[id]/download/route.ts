import { RoleKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { requirePermission } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";
import { readDocumentFile } from "@/src/lib/storage";

export const runtime = "nodejs";

const externalPrivateRestrictedRoles = new Set<RoleKey>([
	RoleKey.CLIENT_VIEWER,
	RoleKey.SUBCONTRACTOR,
]);

const MAX_CACHE_AGE_SEC = 300;

function encodeFileName(fileName: string) {
	const clean = fileName.replace(/[\r\n"]/g, "_").trim() || "document";
	const encoded = encodeURIComponent(clean);
	return `filename="${clean}"; filename*=UTF-8''${encoded}`;
}

function parseRangeHeader(
	range: string,
	fileSize: number,
): { start: number; end: number } | null {
	const match = /^bytes=(\d+)-(\d*)$/.exec(range);
	if (!match) return null;
	const start = parseInt(match[1], 10);
	const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
	if (start >= fileSize || end >= fileSize || start > end) return null;
	return { start, end };
}

export async function GET(
	request: Request,
	context: RouteContext<"/api/documents/[id]/download">,
) {
	try {
		const currentUser = await requirePermission("DOCUMENTS", "VIEW");
		const { id } = await context.params;

		const scope = await resolveAccessScope(currentUser);
		const scopedProjectIds =
			scope.projectIds && scope.projectIds.length > 0
				? scope.projectIds
				: ["__none__"];

		const document = await prisma.document.findFirst({
			where: {
				id,
				...(scope.projectIds === null
					? {}
					: {
							OR: [
								{ projectId: { in: scopedProjectIds } },
								{ workOrder: { projectId: { in: scopedProjectIds } } },
								{ projectId: null, uploadedById: currentUser.id },
							],
						}),
			},
			select: {
				id: true,
				fileName: true,
				mimeType: true,
				storagePath: true,
				isPrivate: true,
				uploadedById: true,
			},
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document inexistent.", code: "NOT_FOUND" },
				{ status: 404 },
			);
		}

		const hasExternalRole = currentUser.roleKeys.some((role) =>
			externalPrivateRestrictedRoles.has(role as RoleKey),
		);
		if (
			document.isPrivate &&
			hasExternalRole &&
			document.uploadedById !== currentUser.id
		) {
			return NextResponse.json(
				{ error: "Nu ai acces la acest document privat.", code: "FORBIDDEN" },
				{ status: 403 },
			);
		}

		const url = new URL(request.url);
		const downloadMode = url.searchParams.get("download") === "1";
		const rangeHeader = request.headers.get("range");

		// Without fileSize in DB, we can't do true Range responses efficiently.
		// Load the file and handle Range after the fact for basic support.
		const bytes = await readDocumentFile(document.storagePath);
		const fileSize = bytes.byteLength;

		if (rangeHeader && fileSize > 0) {
			const parsed = parseRangeHeader(rangeHeader, fileSize);
			if (!parsed) {
				return new NextResponse(null, {
					status: 416,
					headers: {
						"Content-Range": `bytes */${fileSize}`,
					},
				});
			}

			const chunk = bytes.subarray(parsed.start, parsed.end + 1);

			return new NextResponse(chunk, {
				status: 206,
				headers: {
					"Content-Type": document.mimeType || "application/octet-stream",
					"Content-Length": String(chunk.byteLength),
					"Content-Range": `bytes ${parsed.start}-${parsed.end}/${fileSize}`,
					"Content-Disposition": `${downloadMode ? "attachment" : "inline"}; ${encodeFileName(document.fileName)}`,
					"Cache-Control": `private, max-age=${MAX_CACHE_AGE_SEC}`,
					"X-Content-Type-Options": "nosniff",
					"Accept-Ranges": "bytes",
				},
			});
		}

		return new NextResponse(bytes, {
			status: 200,
			headers: {
				"Content-Type": document.mimeType || "application/octet-stream",
				"Content-Length": String(bytes.byteLength),
				"Content-Disposition": `${downloadMode ? "attachment" : "inline"}; ${encodeFileName(document.fileName)}`,
				"Cache-Control": `private, max-age=${MAX_CACHE_AGE_SEC}`,
				"X-Content-Type-Options": "nosniff",
				"Accept-Ranges": "bytes",
			},
		});
	} catch (error) {
		if (
			(error instanceof Error && error.message.includes("nu exista")) ||
			(error instanceof Error && error.message.includes("ENOENT"))
		) {
			return NextResponse.json(
				{ error: "Fisierul nu mai exista pe disk.", code: "FILE_MISSING" },
				{ status: 404 },
			);
		}

		const message =
			error instanceof Error ? error.message : "Eroare la descarcare document";
		const status = /permisiunea|Sesiune invalida|acces/i.test(message)
			? 403
			: 500;
		return NextResponse.json(
			{ error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
			{ status },
		);
	}
}
