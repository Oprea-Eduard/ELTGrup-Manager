import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/src/lib/permissions";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { toCsv } from "@/src/lib/csv";
import { prisma } from "@/src/lib/prisma";

const querySchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requirePermission("INVOICES", "EXPORT");

    const { searchParams } = request.nextUrl;
    const query = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Parametri de interogare invalizi.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const scope = await resolveAccessScope(currentUser);

    const where: Record<string, unknown> =
      scope.projectIds === null
        ? {}
        : { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } };

    if (query.data.status) {
      where.status = query.data.status;
    }
    if (query.data.startDate) {
      where.issueDate = { ...((where.issueDate as object) || {}), gte: new Date(query.data.startDate) };
    }
    if (query.data.endDate) {
      where.issueDate = { ...((where.issueDate as object) || {}), lte: new Date(query.data.endDate) };
    }

    const invoices = await prisma.invoice.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      include: { project: true, client: true },
      orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    });

    const data = invoices.map((invoice) => ({
      Factura: invoice.invoiceNumber,
      Proiect: invoice.project.title,
      Client: invoice.client.name,
      Total: invoice.totalAmount.toString(),
      Achitat: invoice.paidAmount.toString(),
      Rest: (Number(invoice.totalAmount) - Number(invoice.paidAmount)).toFixed(2),
      Status: invoice.status,
      Scadenta: invoice.dueDate.toLocaleDateString("ro-RO"),
    }));

    const csv = toCsv(data);
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=financiar-${timestamp}.csv`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Eroare la export financiar";
    const status = /permisiunea|Sesiune invalida|acces/i.test(message) ? 403 : 500;
    return NextResponse.json(
      { error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
      { status, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
