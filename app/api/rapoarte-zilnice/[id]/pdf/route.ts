import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { z } from "zod";
import { assertProjectAccess } from "@/src/lib/access-scope";
import { requirePermission } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";

const paramsSchema = z.object({
	id: z.string().min(1, "ID-ul raportului este obligatoriu."),
});

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json(null, { headers: corsHeaders });
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const currentUser = await requirePermission("REPORTS", "VIEW");

		const { id } = await params;
		const parsed = paramsSchema.safeParse({ id });
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "ID raport invalid.", code: "VALIDATION_ERROR" },
				{ status: 400, headers: corsHeaders },
			);
		}

		const report = await prisma.dailySiteReport.findUnique({
			where: { id },
			include: { project: true, workOrder: true },
		});

		if (!report) {
			return NextResponse.json(
				{ error: "Raport inexistent" },
				{ status: 404, headers: corsHeaders },
			);
		}

		try {
			await assertProjectAccess(currentUser, report.projectId);
		} catch {
			return NextResponse.json(
				{ error: "Neautorizat" },
				{ status: 403, headers: corsHeaders },
			);
		}

		const pdf = await PDFDocument.create();
		const page = pdf.addPage([595, 842]);
		const font = await pdf.embedFont(StandardFonts.Helvetica);

		page.drawText("ELTGRUP Manager - Raport zilnic santier", {
			x: 40,
			y: 800,
			size: 16,
			font,
			color: rgb(0.07, 0.36, 0.22),
		});

		const lines = [
			`Proiect: ${report.project.title}`,
			`Data raport: ${new Date(report.reportDate).toLocaleDateString("ro-RO")}`,
			`Vreme: ${report.weather || "-"}`,
			`Numar muncitori: ${report.workersCount}`,
			`Subcontractori prezenti: ${report.subcontractorsPresent || "-"}`,
			`Lucrari executate: ${report.workCompleted}`,
			`Blocaje: ${report.blockers || "-"}`,
			`Incidente SSM: ${report.safetyIncidents || "-"}`,
			`Materiale primite: ${report.materialsReceived || "-"}`,
			`Echipamente utilizate: ${report.equipmentUsed || "-"}`,
			`Semnaturi: ${report.signatures || "-"}`,
		];

		let y = 760;
		for (const line of lines) {
			page.drawText(line.slice(0, 110), {
				x: 40,
				y,
				size: 11,
				font,
				color: rgb(0.1, 0.15, 0.12),
			});
			y -= 24;
		}

		const bytes = await pdf.save();

		return new NextResponse(Buffer.from(bytes), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename=raport-zilnic-${id}.pdf`,
				...corsHeaders,
			},
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Eroare la generarea PDF-ului";
		const status = /permisiunea|Sesiune invalida|acces/i.test(message)
			? 403
			: 500;
		return NextResponse.json(
			{ error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
			{ status, headers: corsHeaders },
		);
	}
}
