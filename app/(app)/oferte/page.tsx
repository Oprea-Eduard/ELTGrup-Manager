import Link from "next/link";
import { OfferStatus, Prisma } from "@prisma/client";
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
import { formatCurrency, formatDate } from "@/src/lib/utils";
import {
  buildListHref,
  parseEnumParam,
  parsePositiveIntParam,
  resolvePagination,
} from "@/src/lib/query-params";
import { prisma } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { archiveOffer, updateOfferStatus, convertOfferToProject } from "./actions";
import { OfferCreateForm } from "./offer-create-form";

const offerStatusMeta: Record<
  OfferStatus,
  { label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
  DRAFT: { label: "Ciorna", tone: "neutral" },
  SENT: { label: "Trimisa", tone: "info" },
  ACCEPTED: { label: "Acceptata", tone: "success" },
  REJECTED: { label: "Respinsa", tone: "danger" },
  EXPIRED: { label: "Expirata", tone: "warning" },
};

const offerStatusOptions = Object.values(OfferStatus);

function buildOferteHref({
  page,
  q,
  status,
  clientId,
}: {
  page?: number;
  q?: string;
  status?: OfferStatus | null;
  clientId?: string;
}) {
  return buildListHref("/oferte", {
    page,
    q,
    status: status || undefined,
    clientId: clientId || undefined,
  });
}

export default async function OfertePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    clientId?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const statusFilter = parseEnumParam(params.status, offerStatusOptions);
  const clientIdFilter = params.clientId?.trim() || "";
  const page = parsePositiveIntParam(params.page);
  const pageSize = 15;

  const session = await auth();
  const roleKeys = session?.user?.roleKeys || [];
  const userEmail = session?.user?.email || null;
  const canCreate = hasPermission(roleKeys, "OFFERS", "CREATE", userEmail);
  const canUpdate = hasPermission(roleKeys, "OFFERS", "UPDATE", userEmail);
  const canDelete = hasPermission(roleKeys, "OFFERS", "DELETE", userEmail);

  // Build where clause
  const where: Prisma.OfferWhereInput = { deletedAt: null };
  const andFilters: Prisma.OfferWhereInput[] = [];

  if (statusFilter) {
    andFilters.push({ status: statusFilter });
  }
  if (clientIdFilter) {
    andFilters.push({ clientId: clientIdFilter });
  }
  if (query) {
    andFilters.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { client: { name: { contains: query, mode: "insensitive" } } },
      ],
    });
  }
  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // Parallel data fetching
  const [totalOffers, statusBreakdown, clients] = await Promise.all([
    prisma.offer.count({ where }),
    prisma.offer.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const { totalPages, currentPage, skip, take } = resolvePagination({
    page,
    totalItems: totalOffers,
    pageSize,
  });

  const offers = await prisma.offer.findMany({
    where,
    include: {
      client: { select: { name: true } },
      items: { select: { id: true } },
      project: { select: { code: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip,
    take,
  });

  // KPI calculations
  const statusMap = new Map(
    statusBreakdown.map((s) => [s.status, s]),
  );
  const totalValue = statusBreakdown.reduce(
    (sum, s) => sum + Number(s._sum.totalAmount || 0),
    0,
  );
  const activeCount = statusMap.get(OfferStatus.SENT)?._count._all || 0;
  const acceptedCount = statusMap.get(OfferStatus.ACCEPTED)?._count._all || 0;
  const totalCount = statusBreakdown.reduce((sum, s) => sum + s._count._all, 0);
  const successRate =
    totalCount > 0 ? ((acceptedCount / totalCount) * 100).toFixed(0) : "0";

  const hasFilters = Boolean(query || statusFilter || clientIdFilter);
  const prevHref =
    currentPage > 1
      ? buildOferteHref({
          page: currentPage - 1,
          q: query,
          status: statusFilter,
          clientId: clientIdFilter,
        })
      : null;
  const nextHref =
    currentPage < totalPages
      ? buildOferteHref({
          page: currentPage + 1,
          q: query,
          status: statusFilter,
          clientId: clientIdFilter,
        })
      : null;

  return (
    <PermissionGuard resource="OFFERS" action="VIEW">
      <div className="page-stack">
        <PageHeader
          title="Oferte tehnice"
          subtitle="Gestiunea pipeline-ului comercial — filtrare, paginare si conversie in proiecte"
          actions={
            canCreate && (
              <FormModal
                triggerLabel="Oferta noua"
                title="Creare oferta tehnica"
              >
                <OfferCreateForm clients={clients} />
              </FormModal>
            )
          }
        />

        <section className="page-kpis">
          <KpiCard
            label="Oferte active"
            value={String(activeCount)}
            helper="trimise clientilor"
            severity="pending"
          />
          <KpiCard
            label="Valoare totala"
            value={formatCurrency(totalValue)}
            helper="potential comercial"
            severity="info"
          />
          <KpiCard
            label="Acceptate"
            value={String(acceptedCount)}
            helper="convertite/de convertit"
            severity="active"
          />
          <KpiCard
            label="Rata succes"
            value={`${successRate}%`}
            helper="din total oferte"
            severity="done"
          />
        </section>

        {/* Status quick-filters */}
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{totalOffers} oferte gasite</Badge>
            {hasFilters ? (
              <Badge tone="info">Filtru activ</Badge>
            ) : (
              <Badge tone="success">Fara filtre</Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {offerStatusOptions.map((status) => {
              const count = statusMap.get(status)?._count._all || 0;
              const isActive = statusFilter === status;
              return (
                <Link
                  key={status}
                  href={buildOferteHref({
                    page: 1,
                    q: query,
                    status: isActive ? null : status,
                    clientId: clientIdFilter,
                  })}
                  className={`rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {offerStatusMeta[status].label} ({count})
                </Link>
              );
            })}
          </div>
          <form
            className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_auto_auto]"
          >
            <input type="hidden" name="page" value="1" />
            {statusFilter && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            <Input
              name="q"
              defaultValue={query}
              placeholder="Cauta dupa titlu, cod, note sau client"
            />
            <select
              name="clientId"
              defaultValue={clientIdFilter}
              className="h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm text-[var(--foreground)]"
            >
              <option value="">Toti clientii</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" className="w-full lg:w-auto">
              Filtreaza
            </Button>
            {hasFilters && (
              <Link href="/oferte">
                <Button type="button" variant="ghost" className="w-full lg:w-auto">
                  Reseteaza
                </Button>
              </Link>
            )}
          </form>
        </Card>

        {offers.length === 0 ? (
          <EmptyState
            title={
              hasFilters
                ? "Nu exista oferte care sa corespunda filtrelor"
                : "Nicio oferta inregistrata"
            }
            description={
              hasFilters
                ? "Sterge filtrele sau ajusteaza cautarea pentru a vedea alte rezultate."
                : "Creeaza prima oferta tehnica pentru un client. Pipeline-ul comercial porneste aici."
            }
          />
        ) : (
          <Card className="flush">
            <Table>
              <thead>
                <tr>
                  <TH>Cod</TH>
                  <TH>Titlu</TH>
                  <TH>Client</TH>
                  <TH>Status</TH>
                  <TH className="text-center">Pozitii</TH>
                  <TH className="text-right">Valoare</TH>
                  <TH>Valabilitate</TH>
                  <TH>Proiect</TH>
                  <TH className="text-right">Actiuni</TH>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const meta = offerStatusMeta[offer.status];
                  return (
                    <tr key={offer.id} className="group">
                      <TD className="font-mono text-[10px] text-[var(--muted-strong)]">
                        <Link
                          href={`/oferte/${offer.id}`}
                          className="hover:text-[var(--accent)] hover:underline"
                        >
                          {offer.code}
                        </Link>
                      </TD>
                      <TD className="font-medium">
                        <Link
                          href={`/oferte/${offer.id}`}
                          className="hover:underline"
                        >
                          {offer.title}
                        </Link>
                      </TD>
                      <TD className="text-[var(--muted)]">
                        {offer.client?.name}
                      </TD>
                      <TD>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </TD>
                      <TD className="text-center">{offer.items.length}</TD>
                      <TD className="text-right font-semibold tabular-nums">
                        {formatCurrency(Number(offer.totalAmount))}
                      </TD>
                      <TD className="text-[var(--muted)]">
                        {formatDate(offer.validUntil)}
                      </TD>
                      <TD>
                        {offer.project ? (
                          <Link
                            href={`/proiecte/${offer.projectId}`}
                            className="text-xs text-[var(--accent)] hover:underline"
                          >
                            {offer.project.code}
                          </Link>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">
                            —
                          </span>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                          <Link href={`/oferte/${offer.id}`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              Detalii
                            </Button>
                          </Link>
                          {canUpdate &&
                            offer.status !== OfferStatus.ACCEPTED && (
                              <form action={updateOfferStatus}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={offer.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="SENT"
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                >
                                  Trimite
                                </Button>
                              </form>
                            )}
                          {canUpdate &&
                            offer.status === OfferStatus.SENT && (
                              <form action={updateOfferStatus}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={offer.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="ACCEPTED"
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-[var(--success)]"
                                >
                                  Accepta
                                </Button>
                              </form>
                            )}
                          {canUpdate &&
                            offer.status === OfferStatus.ACCEPTED &&
                            !offer.projectId && (
                              <form action={convertOfferToProject}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={offer.id}
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-[var(--accent)]"
                                >
                                  → Proiect
                                </Button>
                              </form>
                            )}
                          {canDelete && (
                            <form action={archiveOffer}>
                              <input
                                type="hidden"
                                name="id"
                                value={offer.id}
                              />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-[var(--danger)]"
                              >
                                Arhivare
                              </Button>
                            </form>
                          )}
                        </div>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span>
            Pagina{" "}
            <span className="font-medium text-[var(--foreground)]">
              {currentPage}
            </span>{" "}
            din{" "}
            <span className="font-medium text-[var(--foreground)]">
              {totalPages}
            </span>
          </span>
          <div className="flex gap-2">
            {prevHref && (
              <Link
                href={prevHref}
                className="flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--surface-2)]"
              >
                Anterior
              </Link>
            )}
            {nextHref && (
              <Link
                href={nextHref}
                className="flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--surface-2)]"
              >
                Urmator
              </Link>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
