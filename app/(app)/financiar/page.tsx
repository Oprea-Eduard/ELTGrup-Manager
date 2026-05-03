import { InvoiceStatus } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { ListItemSlim } from "@/src/components/ui/list-item";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FormModal } from "@/src/components/forms/form-modal";
import { PageHeader } from "@/src/components/ui/page-header";
import { ProfitabilityChart } from "@/src/components/dashboard/profitability-chart";
import { FgoStatusBadge } from "@/src/components/invoices/fgo-status-badge";
import { FgoSummaryCard } from "@/src/components/invoices/fgo-widget";
import { auth } from "@/src/lib/auth";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { buildListHref, parseEnumParam, parsePositiveIntParam, resolvePagination } from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatCurrency } from "@/src/lib/utils";
import { prisma } from "@/src/lib/prisma";
import { deleteCostEntry, deleteInvoice, updateInvoiceStatus } from "./actions";
import { sendInvoiceToFgo } from "../facturi/actions";
import { CostEntryForm } from "./cost-entry-form";

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Trimisa",
  PARTIAL_PAID: "Partial achitata",
  PAID: "Achitata",
  OVERDUE: "Restanta",
  CANCELED: "Anulata",
};

const invoiceWorkflowOrder: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
  InvoiceStatus.PARTIAL_PAID,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.PAID,
  InvoiceStatus.CANCELED,
];

function buildFinanciarHref({
  page,
  status,
  projectId,
}: {
  page?: number;
  status?: InvoiceStatus | null;
  projectId?: string;
}) {
  return buildListHref("/financiar", {
    page,
    status: status || undefined,
    projectId,
  });
}

export default async function FinanciarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; projectId?: string }>;
}) {
  const params = await searchParams;
  const page = parsePositiveIntParam(params.page);
  const statusFilter = parseEnumParam(params.status, Object.values(InvoiceStatus));
  const pageSize = 15;
  const session = await auth();
  const scope = session?.user
    ? await resolveAccessScope({
        id: session.user.id,
        email: session.user.email,
        roleKeys: session.user.roleKeys || [],
      })
    : { projectIds: null, teamId: null };
  const roleKeys = session?.user?.roleKeys || [];
  const userEmail = session?.user?.email || null;
  const canCreateCost = hasPermission(roleKeys, "INVOICES", "CREATE", userEmail);
  const canUpdateInvoice = hasPermission(roleKeys, "INVOICES", "UPDATE", userEmail);
  const canDeleteFinancial = hasPermission(roleKeys, "INVOICES", "DELETE", userEmail);
  const canExportInvoices = hasPermission(roleKeys, "INVOICES", "EXPORT", userEmail);
  const scopedProjectFilter = scope.projectIds === null ? undefined : { in: scope.projectIds.length ? scope.projectIds : ["__none__"] };
  const invoiceScopeWhere = {
    ...(scope.projectIds === null ? {} : { projectId: scopedProjectFilter! }),
    ...(params.projectId
      ? { projectId: scope.projectIds === null || scope.projectIds.includes(params.projectId) ? params.projectId : "__none__" }
      : {}),
  };
  const invoiceWhere = {
    ...invoiceScopeWhere,
    status: statusFilter,
  };

  const [totalInvoices, costs, projects, invoiceStatusSummary, recentCostEntries, fgoStatusSummary] = await Promise.all([
    prisma.invoice.count({ where: invoiceWhere }),
    prisma.costEntry.groupBy({
      by: ["type"],
      where: scope.projectIds === null ? undefined : { projectId: scopedProjectFilter! },
      _sum: { amount: true },
    }),
    prisma.project.findMany({
      where: { deletedAt: null, ...(scope.projectIds === null ? {} : { id: scopedProjectFilter! }) },
      select: { id: true, title: true },
      orderBy: [{ title: "asc" }, { id: "asc" }],
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: invoiceScopeWhere,
      _count: { _all: true },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.costEntry.findMany({
      where: scope.projectIds === null ? undefined : { projectId: scopedProjectFilter! },
      select: {
        id: true,
        type: true,
        description: true,
        amount: true,
        occurredAt: true,
        project: { select: { title: true } },
      },
      orderBy: [{ occurredAt: "desc" }, { id: "asc" }],
      take: 20,
    }),
    prisma.invoice.groupBy({
      by: ["fgoStatus"],
      where: { ...invoiceScopeWhere, fgoStatus: { not: null } },
      _count: { _all: true },
    }),
  ]);
  const { totalPages, currentPage, skip, take } = resolvePagination({
    page,
    totalItems: totalInvoices,
    pageSize,
  });
  const invoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    select: {
      id: true,
      invoiceNumber: true,
      totalAmount: true,
      dueDate: true,
      issueDate: true,
      fgoSentAt: true,
      fgoStatus: true,
      fgoTrackingId: true,
      paidAt: true,
      status: true,
      project: { select: { id: true, title: true } },
      client: { select: { name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    skip,
    take,
  });
  const [projectCostSums, projectInvoiceSums] = await Promise.all([
    prisma.costEntry.groupBy({
      by: ["projectId"],
      where: scope.projectIds === null ? undefined : { projectId: scopedProjectFilter! },
      _sum: { amount: true },
    }),
    prisma.invoice.groupBy({
      by: ["projectId"],
      where: scope.projectIds === null ? undefined : { projectId: scopedProjectFilter! },
      _sum: { totalAmount: true },
    }),
  ]);
  const costByProject = new Map(projectCostSums.map((item) => [item.projectId, Number(item._sum.amount || 0)]));
  const invoicedByProject = new Map(projectInvoiceSums.map((item) => [item.projectId, Number(item._sum.totalAmount || 0)]));
  const statusSummaryMap = new Map(invoiceStatusSummary.map((item) => [item.status, item]));
  
  const chartData = projects.map(project => ({
    name: project.title.length > 20 ? project.title.substring(0, 20) + "..." : project.title,
    revenue: invoicedByProject.get(project.id) || 0,
    costs: costByProject.get(project.id) || 0,
    profit: (invoicedByProject.get(project.id) || 0) - (costByProject.get(project.id) || 0)
  })).filter(p => p.revenue > 0 || p.costs > 0);

  const outstandingAmount = invoiceStatusSummary
    .filter((item) => item.status !== InvoiceStatus.PAID && item.status !== InvoiceStatus.CANCELED)
    .reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0);
  const paidAmount = invoiceStatusSummary
    .filter((item) => item.status === InvoiceStatus.PAID)
    .reduce((sum, item) => sum + Number(item._sum.paidAmount || 0), 0);
  const totalInvoiced = invoiceStatusSummary.reduce((sum, s) => sum + Number(s._sum.totalAmount || 0), 0);
  const totalCosts = costs.reduce((sum, c) => sum + Number(c._sum.amount || 0), 0);
  const netProfit = totalInvoiced - totalCosts;

  return (
    <PermissionGuard resource="INVOICES" action="VIEW">
      <div className="space-y-6">
        <PageHeader title="Financiar operational" subtitle="Buget proiect, costuri reale, TVA, creante, status facturi, marja estimata" />
        
        <section className="grid gap-3 md:grid-cols-3">
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Total facturat</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalInvoiced)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">suma totala facturi emise</p>
          </Card>
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Total costuri</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalCosts)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">costuri operationale inregistrate</p>
          </Card>
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Profit net</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(netProfit)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">marja estimata ({totalInvoiced > 0 ? ((netProfit / totalInvoiced) * 100).toFixed(1) : "0.0"}%)</p>
          </Card>
        </section>

        {chartData.length > 0 && (
          <ProfitabilityChart data={chartData} />
        )}

        {canExportInvoices ? (
          <div className="flex justify-end">
            <Link href="/api/export/financiar">
              <Button variant="secondary">Export CSV Financiar</Button>
            </Link>
          </div>
        ) : null}
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Total facturi filtrate</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{totalInvoices}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">in registrul curent</p>
          </Card>
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Valoare restanta</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(outstandingAmount)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">facturi emise/restante neincasate</p>
          </Card>
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Incasat</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(paidAmount)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">facturi marcate PAID</p>
          </Card>
          <Card>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Workflow activ</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {invoiceWorkflowOrder.map((status) => {
                const count = statusSummaryMap.get(status)?._count._all || 0;
                return (
                  <Link
                    key={status}
                    href={buildFinanciarHref({
                      page: 1,
                      status,
                      projectId: params.projectId,
                    })}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
                  >
                    {invoiceStatusLabels[status]} ({count})
                  </Link>
                );
              })}
            </div>
          </Card>
        </section>

        {fgoStatusSummary.length > 0 ? (
          <FgoSummaryCard
            stats={{
              sent: fgoStatusSummary
                .filter((s) => ["SUBMITTED_OK", "SENT_TO_ANAF", "SIGNED"].includes(s.fgoStatus ?? ""))
                .reduce((a, s) => a + s._count._all, 0),
              pending: fgoStatusSummary
                .filter((s) => ["DRAFT_UPLOADED", "PENDING_VALIDATION", "VALIDATION_OK"].includes(s.fgoStatus ?? ""))
                .reduce((a, s) => a + s._count._all, 0),
              errors: fgoStatusSummary
                .filter((s) => ["VALIDATION_ERRORS", "SUBMITTED_ERRORS", "REJECTED"].includes(s.fgoStatus ?? ""))
                .reduce((a, s) => a + s._count._all, 0),
            }}
          />
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {costs.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Costuri</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Nu exista costuri inregistrate in aria ta pentru filtrul curent.</p>
            </Card>
          ) : null}
          {costs.map((cost) => (
            <Card key={cost.type}>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Cost {cost.type}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(cost._sum.amount?.toString() || 0)}</p>
            </Card>
          ))}
        </section>

        {canCreateCost ? (
          <Card>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Costuri</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Adauga cost operational</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Introdu costurile din dialog pentru a mentine vizibilitatea asupra facturilor si marjelor.
            </p>
            <div className="mt-3">
              <FormModal
                triggerLabel="Adauga cost"
                title="Cost operational nou"
                description="Asociaza costul unui proiect si unei categorii."
              >
                <CostEntryForm projects={projects.map((project) => ({ id: project.id, label: project.title }))} />
              </FormModal>
            </div>
          </Card>
        ) : null}

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Facturi</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Facturi si incasari</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {"Flux recomandat: Draft -> Trimisa -> Partial achitata / Restanta -> Achitata."}
          </p>
          <form className="mt-3 grid gap-3 md:grid-cols-3">
            <input type="hidden" name="page" value="1" />
            <select name="status" defaultValue={statusFilter || ""}>
              <option value="">Toate statusurile</option>
              {Object.values(InvoiceStatus).map((status) => (
                <option key={status} value={status}>{invoiceStatusLabels[status]}</option>
              ))}
            </select>
            <select name="projectId" defaultValue={params.projectId || ""}>
              <option value="">Toate proiectele</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <Button type="submit" variant="secondary">Filtreaza</Button>
          </form>
          {invoices.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">Nu exista facturi pentru filtrele curente.</p>
          ) : (
            <div className="mt-3 space-y-1">
              {invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{invoice.invoiceNumber} • {invoice.project.title} • {invoice.client.name}</span>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Scadenta {new Intl.DateTimeFormat("ro-RO").format(invoice.dueDate)}
                        {invoice.issueDate ? ` • Emisa ${new Intl.DateTimeFormat("ro-RO").format(invoice.issueDate)}` : ""}
                        {invoice.paidAt ? ` • Incasata ${new Intl.DateTimeFormat("ro-RO").format(invoice.paidAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <FgoStatusBadge status={invoice.fgoStatus} />
                      <span className="font-semibold text-[var(--foreground)]">{formatCurrency(invoice.totalAmount.toString())}</span>
                      <Badge tone={invoice.status === "OVERDUE" ? "danger" : invoice.status === "PAID" ? "success" : "warning"}>
                        {invoiceStatusLabels[invoice.status]}
                      </Badge>
                    </div>
                  </div>
                  {canUpdateInvoice || canDeleteFinancial ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {canUpdateInvoice ? (
                        <form action={updateInvoiceStatus} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={invoice.id} />
                          <select name="status" defaultValue={invoice.status} className="h-9 rounded-md px-2 text-xs">
                            {Object.values(InvoiceStatus).map((status) => (
                              <option key={status} value={status}>{invoiceStatusLabels[status]}</option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="secondary">Actualizeaza</Button>
                        </form>
                      ) : null}
                      {canUpdateInvoice && !invoice.fgoStatus ? (
                        <form action={sendInvoiceToFgo} className="inline">
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <Button size="sm" variant="secondary">Trimite FGO</Button>
                        </form>
                      ) : null}
                      {canUpdateInvoice && invoice.fgoStatus && invoice.fgoStatus !== "SUBMITTED_OK" && invoice.fgoStatus !== "SENT_TO_ANAF" && invoice.fgoStatus !== "SIGNED" ? (
                        <form action={sendInvoiceToFgo} className="inline">
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <Button size="sm" variant="secondary">Retrimite FGO</Button>
                        </form>
                      ) : null}
                      {canDeleteFinancial ? (
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <ConfirmSubmitButton
                            text="Sterge"
                            variant="destructive"
                            confirmMessage={`Confirmi stergerea definitiva a facturii ${invoice.invoiceNumber}?`}
                          />
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted)]">
            <span>Pagina {currentPage} din {totalPages}</span>
            <div className="flex gap-2">
              {currentPage > 1 ? <Link href={buildFinanciarHref({ page: currentPage - 1, status: statusFilter, projectId: params.projectId })} className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-[var(--border-strong)]">Anterior</Link> : null}
              {currentPage < totalPages ? <Link href={buildFinanciarHref({ page: currentPage + 1, status: statusFilter, projectId: params.projectId })} className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-[var(--border-strong)]">Urmator</Link> : null}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Costuri</p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Costuri recente</h2>
            </div>
            <Badge tone={recentCostEntries.length > 0 ? "info" : "neutral"}>{recentCostEntries.length} inregistrari</Badge>
          </div>
          <div className="mt-3 space-y-2">
            {recentCostEntries.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nu exista costuri recente in aria ta.</p>
            ) : (
              recentCostEntries.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{entry.description}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {entry.project.title} • {entry.type} • {new Intl.DateTimeFormat("ro-RO").format(entry.occurredAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--foreground)]">{formatCurrency(entry.amount.toString())}</p>
                      {canDeleteFinancial ? (
                        <form action={deleteCostEntry} className="mt-2">
                          <input type="hidden" name="id" value={entry.id} />
                          <ConfirmSubmitButton
                            text="Sterge cost"
                            variant="destructive"
                            confirmMessage="Confirmi stergerea definitiva a acestui cost?"
                          />
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Marje</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Cashflow si marja estimata pe proiect</h2>
          <div className="mt-3 space-y-1">
            {projects.length === 0 ? (
              <ListItemSlim className="text-[var(--muted)]">
                Nu exista proiecte in aria ta pentru calculul de marja.
              </ListItemSlim>
            ) : null}
            {projects.map((project) => {
              const costTotal = costByProject.get(project.id) || 0;
              const invoiced = invoicedByProject.get(project.id) || 0;
              const margin = invoiced - costTotal;
              return (
                <div key={project.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]">
                  <p className="font-semibold text-[var(--foreground)]">{project.title}</p>
                  <p className="text-xs text-[var(--muted)]">Cost: {formatCurrency(costTotal)} • Facturat: {formatCurrency(invoiced)} • Marja: {formatCurrency(margin)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PermissionGuard>
  );
}
