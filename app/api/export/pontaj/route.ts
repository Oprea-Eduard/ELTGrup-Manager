import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/src/lib/permissions";
import { resolveAccessScope, timeEntryScopeWhere } from "@/src/lib/access-scope";
import { toCsv } from "@/src/lib/csv";
import { prisma } from "@/src/lib/prisma";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).default(new Date().getMonth() + 1),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).default(new Date().getFullYear()),
  userId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requirePermission("TIME_TRACKING", "EXPORT");

    const { searchParams } = request.nextUrl;
    const query = querySchema.safeParse({
      month: searchParams.get("month") || undefined,
      year: searchParams.get("year") || undefined,
      userId: searchParams.get("userId") || undefined,
      projectId: searchParams.get("projectId") || undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: query.data ? "Parametri de interogare invalizi." : "Parametri month si year sunt obligatorii.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { month, year, userId, projectId } = query.data;
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);

    const scope = await resolveAccessScope(currentUser);

    const where: Record<string, unknown> = {
      startAt: { gte: from, lte: to },
      ...timeEntryScopeWhere(currentUser, scope),
    };
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;

    const rows = await prisma.timeEntry.findMany({
      where: where as any,
      include: { user: true, project: true, workOrder: true },
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });

    const data = rows.map((entry) => ({
      Data: new Date(entry.startAt).toLocaleDateString("ro-RO"),
      Angajat: `${entry.user.firstName} ${entry.user.lastName}`,
      Proiect: entry.project.title,
      Lucrare: entry.workOrder?.title || "-",
      DurataOre: (entry.durationMinutes / 60).toFixed(2),
      PauzaMinute: entry.breakMinutes,
      OvertimeMinute: entry.overtimeMinutes,
      Status: entry.status,
    }));

    const body = toCsv(data);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=pontaj-${year}-${String(month).padStart(2, "0")}.csv`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Eroare la export pontaj";
    const status = /permisiunea|Sesiune invalida|acces/i.test(message) ? 403 : 500;
    return NextResponse.json(
      { error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
      { status, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
