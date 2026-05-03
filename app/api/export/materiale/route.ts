import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/src/lib/permissions";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { toCsv } from "@/src/lib/csv";
import { prisma } from "@/src/lib/prisma";

const querySchema = z.object({
  category: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requirePermission("MATERIALS", "EXPORT");

    const { searchParams } = request.nextUrl;
    const query = querySchema.safeParse({
      category: searchParams.get("category") || undefined,
      lowStock: searchParams.get("lowStock") || undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Parametri de interogare invalizi.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const scope = await resolveAccessScope(currentUser);

    const materials = await prisma.material.findMany({
      where: {
        ...(scope.projectIds === null
          ? {}
          : {
              stockMovements: {
                some: { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } },
              },
            }),
        ...(query.data.category ? { category: query.data.category } : {}),
      },
      include: {
        stockMovements:
          scope.projectIds === null
            ? true
            : {
                where: { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } },
              },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    const data = materials
      .map((material) => {
        const stock = material.stockMovements.reduce((sum, move) => {
          if (move.type === "OUT" || move.type === "WASTE") return sum - Number(move.quantity);
          return sum + Number(move.quantity);
        }, 0);
        return {
          Cod: material.code,
          Material: material.name,
          UM: material.unitOfMeasure,
          StocCurent: stock.toFixed(2),
          CostIntern: material.internalCost?.toString() || "0",
          PragMinim: material.minStockLevel?.toString() || "0",
          _stock: stock,
          _minLevel: Number(material.minStockLevel ?? 0),
        };
      })
      .filter((item) => {
        if (query.data.lowStock) return item._stock <= item._minLevel;
        return true;
      })
      .map(({ _stock, _minLevel, ...rest }) => rest);

    const csv = toCsv(data);
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=materiale-${timestamp}.csv`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Eroare la export materiale";
    const status = /permisiunea|Sesiune invalida|acces/i.test(message) ? 403 : 500;
    return NextResponse.json(
      { error: message, code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR" },
      { status, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
