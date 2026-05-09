import { MaterialRequestStatus, RoleKey, StockMovementType, EquipmentStatus } from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Input } from "@/src/components/ui/input";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { TD, TH, Table } from "@/src/components/ui/table";
import { FormModal } from "@/src/components/forms/form-modal";
import { auth } from "@/src/lib/auth";
import { parsePositiveIntParam } from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { prisma } from "@/src/lib/prisma";
import {
  approveMaterialRequest,
  archiveMaterial,
} from "./actions";
import { MaterialCreateForm, MaterialRequestForm, StockMovementForm } from "./material-forms";
import { EquipmentCreateForm } from "../echipamente/equipment-create-form";
import { updateEquipmentStatus, archiveEquipment } from "../echipamente/actions";

const requestStatusLabels: Record<MaterialRequestStatus, string> = {
  PENDING: "In asteptare",
  APPROVED: "Aprobata",
  REJECTED: "Respinsa",
  ISSUED: "Emisa din stoc",
  PARTIAL: "Partial emisa",
};

const movementLabels: Record<StockMovementType, string> = {
  IN: "Intrare",
  OUT: "Iesire",
  TRANSFER: "Transfer",
  RETURN: "Returnare",
  WASTE: "Casare",
  ADJUSTMENT: "Ajustare",
};

const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  AVAILABLE: "Disponibil",
  IN_USE: "In utilizare",
  SERVICE: "In service",
  LOST: "Pierdut",
};

export default async function MaterialePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
    tab?: string;
    warehouseId?: string;
  }>;
}) {
  const params = await searchParams;
  const currentTab = params.tab || "stoc";
  const query = params.q || "";
  const category = params.category || "";

  const session = await auth();
  const roleKeys = session?.user?.roleKeys || [];
  const userEmail = session?.user?.email || null;

  const canCreate = hasPermission(roleKeys, "MATERIALS", "CREATE", userEmail);
  const canUpdate = hasPermission(roleKeys, "MATERIALS", "UPDATE", userEmail);
  const canDelete = hasPermission(roleKeys, "MATERIALS", "DELETE", userEmail);

  // Fetch common data
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, code: true, title: true },
    orderBy: { code: "desc" },
    take: 50,
  });

  const allMaterials = await prisma.material.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  // Tab-specific data fetching
  let tabContent = null;
  let tabActions = null;

  if (currentTab === "stoc") {
    const materials = await prisma.material.findMany({
      where: {
        deletedAt: null,
        ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { code: { contains: query, mode: "insensitive" } }] } : {}),
        ...(category ? { category } : {}),
      },
      include: {
        stockMovements: { select: { quantity: true, type: true } },
      },
      orderBy: { name: "asc" },
    });

    const lowStockMaterials = materials.filter(m => {
      const stock = m.stockMovements.reduce((acc, mov) => acc + (mov.type === "IN" ? Number(mov.quantity) : -Number(mov.quantity)), 0);
      return m.minStockLevel && stock < Number(m.minStockLevel);
    });

    tabActions = (
      <>
        {canCreate && (
          <div className="flex items-center gap-2">
            <FormModal triggerLabel="Adauga material" title="Creare material nou">
              <MaterialCreateForm />
            </FormModal>
            <FormModal triggerLabel="Miscare stoc" title="Inregistrare miscare stoc">
              <StockMovementForm 
                projects={projects.map(p => ({ id: p.id, label: `${p.code} - ${p.title}` }))}
                materials={allMaterials.map(m => ({ id: m.id, label: `${m.code} - ${m.name}` }))}
                warehouses={warehouses.map(w => ({ id: w.id, label: w.name }))}
              />
            </FormModal>
          </div>
        )}
      </>
    );

    tabContent = (
      <>
        <section className="page-kpis">
          <KpiCard label="Total materiale" value={String(materials.length)} severity="info" />
          <KpiCard label="Sub prag minim" value={String(lowStockMaterials.length)} severity={lowStockMaterials.length > 0 ? "blocked" : "done"} />
          <KpiCard label="Depozite active" value={String(warehouses.length)} severity="active" />
        </section>

        <Card className="flush">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-3">
            <div className="flex-1 min-w-[200px]">
              <Input 
                name="q" 
                placeholder="Cauta dupa nume sau cod..." 
                defaultValue={query} 
                className="h-9" 
                aria-label="Cauta materiale"
              />
            </div>
            <select 
              name="category" 
              defaultValue={category} 
              className="h-9 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none"
              aria-label="Filtreaza dupa categorie"
            >
              <option value="">Toate categoriile</option>
              {Array.from(new Set(materials.map(m => m.category).filter(Boolean))).map(cat => (
                <option key={cat} value={cat!}>{cat}</option>
              ))}
            </select>
          </div>
          <Table>
            <thead>
              <tr>
                <TH>Cod</TH>
                <TH>Denumire</TH>
                <TH>Categorie</TH>
                <TH className="text-right">Stoc curent</TH>
                <TH>U.M.</TH>
                <TH className="text-right">Prag</TH>
                <TH className="text-right">Actiuni</TH>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => {
                const stock = m.stockMovements.reduce((acc, mov) => acc + (mov.type === "IN" ? Number(mov.quantity) : -Number(mov.quantity)), 0);
                const isLow = m.minStockLevel && stock < Number(m.minStockLevel);
                return (
                  <tr key={m.id} className="group">
                    <TD className="font-mono text-[10px] text-[var(--muted-strong)]">{m.code}</TD>
                    <TD className="font-medium">{m.name}</TD>
                    <TD className="text-[var(--muted)]">{m.category || "—"}</TD>
                    <TD className={`text-right font-bold tabular-nums ${isLow ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                      {stock.toFixed(2)}
                    </TD>
                    <TD className="text-[var(--muted)]">{m.unitOfMeasure}</TD>
                    <TD className="text-right text-[var(--muted)]">{m.minStockLevel ? Number(m.minStockLevel).toFixed(2) : "—"}</TD>
                    <TD className="text-right">
                       {canDelete && (
                         <form action={archiveMaterial} className="opacity-0 group-hover:opacity-100">
                           <input type="hidden" name="id" value={m.id} />
                           <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-[var(--danger)]" aria-label={`Arhiveaza ${m.name}`}>Arhiva</Button>
                         </form>
                       )}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </>
    );
  }

  if (currentTab === "cereri") {
    const requests = await prisma.materialRequest.findMany({
      include: {
        material: { select: { name: true, code: true, unitOfMeasure: true } },
        project: { select: { code: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    tabActions = (
      canCreate && (
        <FormModal triggerLabel="Cere material" title="Creare cerere de materiale">
          <MaterialRequestForm 
            projects={projects.map(p => ({ id: p.id, label: `${p.code} - ${p.title}` }))}
            materials={allMaterials.map(m => ({ id: m.id, label: `${m.code} - ${m.name}` }))}
          />
        </FormModal>
      )
    );

    tabContent = (
      <>
        <section className="page-kpis">
          <KpiCard label="Cereri in asteptare" value={String(requests.filter(r => r.status === "PENDING").length)} severity="pending" />
          <KpiCard label="Aprobate azi" value={String(requests.filter(r => r.status === "APPROVED" && r.updatedAt > new Date(new Date().setHours(0,0,0,0))).length)} severity="active" />
        </section>

        <Card className="flush">
          <Table>
            <thead>
              <tr>
                <TH>Data</TH>
                <TH>Proiect</TH>
                <TH>Material</TH>
                <TH className="text-right">Cantitate</TH>
                <TH>Status</TH>
                <TH>Solicitant</TH>
                <TH className="text-right">Actiuni</TH>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="group">
                  <TD className="text-[var(--muted)]">{r.createdAt.toLocaleDateString("ro-RO")}</TD>
                  <TD className="font-mono text-xs">{r.project.code}</TD>
                  <TD>
                    <div className="font-medium">{r.material.name}</div>
                    <div className="text-[10px] text-[var(--muted)]">{r.material.code}</div>
                  </TD>
                  <TD className="text-right font-semibold tabular-nums">{Number(r.quantity).toFixed(2)} {r.material.unitOfMeasure}</TD>
                  <TD><Badge tone={r.status === "PENDING" ? "warning" : r.status === "APPROVED" ? "success" : "neutral"}>{requestStatusLabels[r.status]}</Badge></TD>
                  <TD className="text-xs">{r.requestedBy.firstName} {r.requestedBy.lastName}</TD>
                  <TD className="text-right">
                    {r.status === "PENDING" && canUpdate && (
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <form action={approveMaterialRequest}>
                          <input type="hidden" name="id" value={r.id} />
                          <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-[var(--success)]" aria-label={`Aproba cererea pentru ${r.material.name}`}>Aproba</Button>
                        </form>
                      </div>
                    )}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </>
    );
  }

  if (currentTab === "miscari") {
    const movements = await prisma.stockMovement.findMany({
      include: {
        material: { select: { name: true, code: true, unitOfMeasure: true } },
        warehouse: { select: { name: true } },
        project: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    tabContent = (
      <Card className="flush">
        <Table>
          <thead>
            <tr>
              <TH>Data</TH>
              <TH>Tip</TH>
              <TH>Material</TH>
              <TH className="text-right">Cantitate</TH>
              <TH>Depozit</TH>
              <TH>Proiect</TH>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <TD className="text-[var(--muted)]">{m.createdAt.toLocaleDateString("ro-RO")}</TD>
                <TD><Badge tone={m.type === "IN" ? "info" : m.type === "OUT" ? "warning" : "neutral"}>{movementLabels[m.type]}</Badge></TD>
                <TD>
                  <div className="font-medium">{m.material.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">{m.material.code}</div>
                </TD>
                <TD className={`text-right font-bold tabular-nums ${m.type === "IN" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {m.type === "IN" ? "+" : "-"}{Number(m.quantity).toFixed(2)}
                </TD>
                <TD className="text-xs">{m.warehouse.name}</TD>
                <TD className="font-mono text-[10px]">{m.project?.code || "—"}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  }

  if (currentTab === "echipamente") {
    const equipment = await prisma.equipment.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    tabActions = (
      canCreate && (
        <FormModal triggerLabel="Echipament nou" title="Adaugare echipament/scula">
          <EquipmentCreateForm />
        </FormModal>
      )
    );

    tabContent = (
      <>
        <section className="page-kpis">
          <KpiCard label="Total echipamente" value={String(equipment.length)} severity="info" />
          <KpiCard label="In service" value={String(equipment.filter(e => e.status === EquipmentStatus.SERVICE).length)} severity="blocked" />
          <KpiCard label="Disponibile" value={String(equipment.filter(e => e.status === EquipmentStatus.AVAILABLE).length)} severity="active" />
        </section>

        <Card className="flush">
          <Table>
            <thead>
              <tr>
                <TH>Cod</TH>
                <TH>Denumire</TH>
                <TH>Serie</TH>
                <TH>Categorie</TH>
                <TH>Status</TH>
                <TH>Mentenanta</TH>
                <TH className="text-right">Actiuni</TH>
              </tr>
            </thead>
            <tbody>
              {equipment.map(e => (
                <tr key={e.id} className="group">
                  <TD className="font-mono text-xs">{e.code}</TD>
                  <TD className="font-medium">{e.name}</TD>
                  <TD className="text-xs text-[var(--muted)]">{e.serialNumber || "—"}</TD>
                  <TD className="text-xs">{e.category || "—"}</TD>
                  <TD>
                    <Badge tone={e.status === EquipmentStatus.AVAILABLE ? "success" : e.status === EquipmentStatus.IN_USE ? "info" : "neutral"}>
                      {equipmentStatusLabels[e.status]}
                    </Badge>
                  </TD>
                  <TD className="text-xs">{e.maintenanceDueAt ? e.maintenanceDueAt.toLocaleDateString("ro-RO") : "—"}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                      <form action={updateEquipmentStatus}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="status" value={EquipmentStatus.SERVICE} />
                        <Button type="submit" variant="ghost" size="sm" className="h-7 px-2" aria-label={`Trimite in service ${e.name}`}>Service</Button>
                      </form>
                      {canDelete && (
                         <form action={archiveEquipment}>
                           <input type="hidden" name="id" value={e.id} />
                           <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-[var(--danger)]" aria-label={`Arhiveaza echipamentul ${e.name}`}>Arhiva</Button>
                         </form>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </>
    );
  }

  return (
    <PermissionGuard resource="MATERIALS" action="VIEW">
      <div className="page-stack">
        <PageHeader 
          title="Gestiune Materiale & Echipamente" 
          subtitle="Stocuri, cereri de materiale si inventar scule"
          actions={tabActions}
        />

        <nav className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] pb-px" aria-label="Sectiuni gestiune">
          {[
            { id: "stoc", label: "Stoc Materiale" },
            { id: "cereri", label: "Cereri" },
            { id: "miscari", label: "Miscari" },
            { id: "echipamente", label: "Echipamente" },
          ].map(tab => (
            <Link
              key={tab.id}
              href={`/materiale?tab=${tab.id}`}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? "border-b-2 border-[var(--accent)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              aria-current={currentTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {tabContent}
      </div>
    </PermissionGuard>
  );
}
