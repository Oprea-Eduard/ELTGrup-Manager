import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { toCsv } from "@/src/lib/csv";
import { requirePermission } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";

const querySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	projectId: z.string().optional(),
});

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
	try {
		const currentUser = await requirePermission("REPORTS", "EXPORT");

		const { searchParams } = request.nextUrl;
		const query = querySchema.safeParse({
			startDate: searchParams.get("startDate") || undefined,
			endDate: searchParams.get("endDate") || undefined,
			projectId: searchParams.get("projectId") || undefined,
		});

		if (!query.success) {
			return NextResponse.json(
				{
					error: "Parametri de interogare invalizi.",
					code: "VALIDATION_ERROR",
				},
				{ status: 400, headers: corsHeaders },
			);
		}

		const scope = await resolveAccessScope(currentUser);

		const where: Record<string, unknown> =
			scope.projectIds === null
				? {}
				: {
						projectId: {
							in: scope.projectIds.length ? scope.projectIds : ["__none__"],
						},
					};

		if (query.data.startDate) {
			where.reportDate = {
				...((where.reportDate as object) || {}),
				gte: new Date(query.data.startDate),
			};
		}
		if (query.data.endDate) {
			where.reportDate = {
				...((where.reportDate as object) || {}),
				lte: new Date(query.data.endDate),
			};
		}
		if (query.data.projectId) {
			where.projectId = query.data.projectId;
		}

		const reports = await prisma.dailySiteReport.findMany({
			where: where as Prisma.DailySiteReportWhereInput,
			include: { project: true, createdBy: true },
			orderBy: [{ reportDate: "desc" }, { id: "asc" }],
		});

		const data = reports.map((report) => ({
			Data: report.reportDate.toLocaleDateString("ro-RO"),
			Proiect: report.project.title,
			Vreme: report.weather || "-",
			Muncitori: report.workersCount,
			Blocaje: report.blockers || "-",
			SSM: report.safetyIncidents || "-",
			Autor: report.createdBy
				? `${report.createdBy.firstName} ${report.createdBy.lastName}`
				: "-",
		}));

		const csv = toCsv(data);
		const timestamp = new Date().toISOString().slice(0, 10);

		return new NextResponse(csv, {
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename=rapoarte-zilnice-${timestamp}.csv`,
				...corsHeaders,
			},
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Eroare la export rapoarte";
		const status = /permisiunea|Sesiune invalida|acces/i.test(message)
			? 403
			: 500;
		return NextResponse.json(
			{ error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
			{ status, headers: corsHeaders },
		);
	}
}
