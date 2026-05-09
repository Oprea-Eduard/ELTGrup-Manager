import { PermissionGuard } from "@/src/components/auth/permission-guard";
import Link from "next/link";
import { TimeEntryStatus } from "@prisma/client";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Input } from "@/src/components/ui/input";
import { PageHeader } from "@/src/components/ui/page-header";
import { Table, TD, TH } from "@/src/components/ui/table";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FormModal } from "@/src/components/forms/form-modal";
import { auth } from "@/src/lib/auth";
import { resolveAccessScope, timeEntryScopeWhere } from "@/src/lib/access-scope";
import { buildListHref, parseDateParam, parseEnumParam, parsePositiveIntParam, resolvePagination } from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatDate, formatDateTime } from "@/src/lib/utils";
import { prisma } from "@/src/lib/prisma";
import { approveTimeEntry, bulkTimeEntriesAction } from "./actions";
import { PontajCreateForm } from "./pontaj-create-form";

const timeEntryStatusMeta: Record<TimeEntryStatus, { label: string; tone: "success" | "danger" | "warning" | "neutral"; description: string }> = {
  DRAFT: { label: "Draft", tone: "neutral", description: "Inregistrare nefinalizata" },
  SUBMITTED: { label: "Asteapta aprobare", tone: "warning", description: "Trimis la verificare" },
  APPROVED: { label: "Aprobat", tone: "success", description: "Validat pentru salarizare" },
  REJECTED: { label: "Respins", tone: "danger", description: "Cerere respinsa" },
};

function getTimeEntryStatusMeta(status: TimeEntryStatus) {
  return timeEntryStatusMeta[status];
}

function buildPontajHref(page: number, params: { status?: string; projectId?: string; from?: string; to?: string }) {
  return buildListHref("/pontaj", {
    page,
    status: params.status,
    projectId: params.projectId,
    from: params.from,
    to: params.to,
  });
}

export default async function PontajPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; projectId?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const page = parsePositiveIntParam(params.page);
  const statusFilter = parseEnumParam(params.status, Object.values(TimeEntryStatus));
  const fromDate = parseDateParam(params.from);
  const toDate = params.to ? parseDateParam(`${params.to}T23:59:59`) : undefined;
  const startAtFilter = fromDate || toDate ? { gte: fromDate, lte: toDate } : undefined;
  const pageSize = 20;
  const session = await auth();
  const scope = session?.user
    ? await resolveAccessScope({
        id: session.user.id,
        email: session.user.email,
        roleKeys: session.user.roleKeys || [],
      })
    : { projectIds: null, teamId: null };
  const userContext = session?.user
    ? { id: session.user.id, email: session.user.email, roleKeys: session.user.roleKeys || [] }
    : { id: "", email: null, roleKeys: [] };
  const roleKeys = userContext.roleKeys || [];
  const canManageTeamPontaj = userContext.roleKeys.some((role) =>
    ["SUPER_ADMIN", "ADMINISTRATOR", "PROJECT_MANAGER", "SITE_MANAGER", "BACKOFFICE"].includes(role),
  );
  const canCreate = hasPermission(roleKeys, "TIME_TRACKING", "CREATE", userContext.email);
  const canApprove = hasPermission(roleKeys, "TIME_TRACKING", "APPROVE", userContext.email);
  const canExport = hasPermission(roleKeys, "TIME_TRACKING", "EXPORT", userContext.email);
  const where = {
    ...timeEntryScopeWhere(userContext, scope),
    projectId:
      params.projectId && (scope.projectIds === null || scope.projectIds.includes(params.projectId))
        ? params.projectId
        : undefined,
    status: statusFilter,
    startAt: startAtFilter,
  };

  const selectClass = "h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] sm:h-11";

  const [projects, workOrders, users, total] = await Promise.all([
    prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(scope.projectIds === null ? {} : { id: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } }),
      },
      select: { id: true, title: true },
      orderBy: [{ title: "asc" }, { id: "asc" }],
    }),
    prisma.workOrder.findMany({
      where: {
        deletedAt: null,
        ...(scope.projectIds === null ? {} : { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } }),
      },
      select: { id: true, title: true, projectId: true },
      orderBy: [{ title: "asc" }, { id: "asc" }],
      take: 100,
    }),
    prisma.user.findMany({
      where: canManageTeamPontaj
        ? { isActive: true, deletedAt: null }
        : { id: userContext.id, isActive: true, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { id: "asc" }],
    }),
    prisma.timeEntry.count({ where }),
  ]);
  const { totalPages, currentPage, skip, take } = resolvePagination({
    page,
    totalItems: total,
    pageSize,
  });
  const entries = await prisma.timeEntry.findMany({
    where,
    select: {
      id: true,
      startAt: true,
      endAt: true,
      durationMinutes: true,
      breakMinutes: true,
      status: true,
      approvedAt: true,
      user: { select: { firstName: true, lastName: true } },
      project: { select: { title: true } },
      workOrder: { select: { title: true } },
    },
    orderBy: [{ startAt: "desc" }, { id: "asc" }],
    skip,
    take,
  });
  const submittedEntries = entries.filter((item) => item.status === TimeEntryStatus.SUBMITTED);

  return (
    <PermissionGuard resource="TIME_TRACKING" action="VIEW">
      <div className="page-stack">
        <PageHeader
          title="Pontaj"
          subtitle="Inregistrare timp, aprobari si export salarizare"
          actions={
            <div className="flex gap-2">
              {canExport && (
                <Link href="/api/export/pontaj">
                  <Button variant="secondary">Export CSV</Button>
                </Link>
              )}
              {canCreate && (
                <FormModal
                  triggerLabel="Adauga pontaj"
                  title="Inregistrare pontaj"
                  description="Selecteaza proiectul, utilizatorul si intervalul orar."
                >
                  <PontajCreateForm
                    projects={projects.map((project) => ({ id: project.id, label: project.title }))}
                    workOrders={workOrders.map((item) => ({ id: item.id, label: item.title, projectId: item.projectId }))}
                    users={users.map((user) => ({ id: user.id, label: `${user.firstName} ${user.lastName}` }))}
                    canSelectUser={canManageTeamPontaj}
                  />
                </FormModal>
              )}
            </div>
          }
        />

        {/* Inline filters */}
        <form className="grid gap-2 sm:grid-cols-[auto_auto_auto_auto_auto]" method="get">
          <input type="hidden" name="page" value="1" />
          <select name="projectId" defaultValue={params.projectId || ""} className={selectClass}>
            <option value="">Toate proiectele</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select name="status" defaultValue={statusFilter || ""} className={selectClass}>
            <option value="">Toate statusurile</option>
            {Object.values(TimeEntryStatus).map((status) => (
              <option key={status} value={status}>{getTimeEntryStatusMeta(status).label}</option>
            ))}
          </select>
          <Input type="date" name="from" defaultValue={params.from || ""} />
          <Input type="date" name="to" defaultValue={params.to || ""} />
          <Button type="submit" variant="secondary">Filtreaza</Button>
        </form>

        {/* Bulk approval */}
        {canApprove && submittedEntries.length > 0 && (
          <Card rail="alert">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
                {submittedEntries.length} pontaje asteapta aprobare
              </summary>
              <form action={bulkTimeEntriesAction} className="mt-3 space-y-3">
                <div className="grid gap-2 md:grid-cols-3">
                  <select name="operation" defaultValue="APPROVE" className={selectClass}>
                    <option value="APPROVE">Aproba selectie</option>
                    <option value="REJECT">Respinge selectie</option>
                  </select>
                  <div className="hidden md:block" />
                  <ConfirmSubmitButton text="Executa" confirmMessage="Confirmi actiunea bulk pentru pontajele selectate?" />
                </div>
                <div className="max-h-36 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <div className="grid gap-1 md:grid-cols-2">
                    {submittedEntries.map((entry) => (
                      <label key={entry.id} className="flex items-center gap-2 text-sm text-[var(--muted-strong)]">
                        <input type="checkbox" name="ids" value={entry.id} className="h-4 w-4 accent-[var(--accent)]" />
                        <span>{entry.user.firstName} {entry.user.lastName} — {entry.project.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </details>
          </Card>
        )}

        {/* Time entries list */}
        {entries.length === 0 ? (
          <EmptyState title="Nu exista pontaj" description="Adauga prima inregistrare de timp sau schimba filtrele." />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 lg:hidden">
              {entries.map((entry) => {
                const meta = getTimeEntryStatusMeta(entry.status);
                return (
                  <Card key={entry.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)]">
                          {entry.user.firstName} {entry.user.lastName}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{entry.project.title}</p>
                      </div>
                      <Badge tone={meta.tone} className="shrink-0">{meta.label}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted)]">
                      <span className="font-medium tabular-nums text-[var(--foreground)]">{Math.round(entry.durationMinutes / 60)}h</span>
                      <span>{formatDateTime(entry.startAt)}</span>
                      <span>→</span>
                      <span>{entry.endAt ? formatDateTime(entry.endAt) : "In curs"}</span>
                    </div>
                    {entry.status === TimeEntryStatus.SUBMITTED && canApprove && (
                      <form action={approveTimeEntry} className="mt-2">
                        <input type="hidden" name="id" value={entry.id} />
                        <Button type="submit" className="w-full">Aproba</Button>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Desktop table */}
            <Card flush className="hidden lg:block">
              <Table aria-label="Pontaj">
                <thead>
                  <tr>
                    <TH>Data</TH>
                    <TH>Angajat</TH>
                    <TH>Proiect</TH>
                    <TH>Lucrare</TH>
                    <TH>Durata</TH>
                    <TH>Pauza</TH>
                    <TH>Status</TH>
                    <TH>Aprobare</TH>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const meta = getTimeEntryStatusMeta(entry.status);
                    return (
                      <tr key={entry.id}>
                        <TD>
                          <p>{formatDateTime(entry.startAt)}</p>
                          <p className="text-xs text-[var(--muted)]">{entry.endAt ? `→ ${formatDateTime(entry.endAt)}` : "Tura deschisa"}</p>
                        </TD>
                        <TD>{entry.user.firstName} {entry.user.lastName}</TD>
                        <TD>{entry.project.title}</TD>
                        <TD>{entry.workOrder?.title || "—"}</TD>
                        <TD><span className="tabular-nums">{Math.round(entry.durationMinutes / 60)}h</span></TD>
                        <TD><span className="tabular-nums">{entry.breakMinutes}m</span></TD>
                        <TD><Badge tone={meta.tone}>{meta.label}</Badge></TD>
                        <TD>
                          {entry.status === TimeEntryStatus.SUBMITTED && canApprove ? (
                            <form action={approveTimeEntry}>
                              <input type="hidden" name="id" value={entry.id} />
                              <Button type="submit" size="sm">Aproba</Button>
                            </form>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">{entry.approvedAt ? formatDate(entry.approvedAt) : "—"}</span>
                          )}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span>
            Pagina <span className="font-medium text-[var(--foreground)]">{currentPage}</span> din <span className="font-medium text-[var(--foreground)]">{totalPages}</span>
            {" · "}{total} inregistrari
          </span>
          <div className="flex w-full gap-2 sm:w-auto">
            {currentPage > 1 && (
              <Link
                className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] sm:flex-none"
                href={buildPontajHref(currentPage - 1, { status: statusFilter || undefined, projectId: params.projectId, from: params.from, to: params.to })}
              >
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] sm:flex-none"
                href={buildPontajHref(currentPage + 1, { status: statusFilter || undefined, projectId: params.projectId, from: params.from, to: params.to })}
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
