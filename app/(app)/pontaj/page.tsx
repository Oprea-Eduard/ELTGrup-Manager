import { TimeEntryStatus } from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FormModal } from "@/src/components/forms/form-modal";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Input } from "@/src/components/ui/input";
import { PageHeader } from "@/src/components/ui/page-header";
import { Table, TD, TH } from "@/src/components/ui/table";
import {
	resolveAccessScope,
	timeEntryScopeWhere,
} from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
	buildListHref,
	parseDateParam,
	parseEnumParam,
	parsePositiveIntParam,
	resolvePagination,
} from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatDate, formatDateTime } from "@/src/lib/utils";
import { approveTimeEntry, bulkTimeEntriesAction } from "./actions";
import { PontajCreateForm } from "./pontaj-create-form";

const timeEntryStatusMeta: Record<
	TimeEntryStatus,
	{ label: string; tone: "success" | "danger" | "warning" | "neutral"; description: string }
> = {
	DRAFT: { label: "DRAFT", tone: "neutral", description: "INREGISTRARE NEFINALIZATA" },
	SUBMITTED: { label: "ASTEAPTA APROBARE", tone: "warning", description: "TRIMIS LA VERIFICARE" },
	APPROVED: { label: "APROBAT", tone: "success", description: "VALIDAT PENTRU SALARIZARE" },
	REJECTED: { label: "RESPINS", tone: "danger", description: "CERERE RESPINSA" },
};

function getTimeEntryStatusMeta(status: TimeEntryStatus) {
	return timeEntryStatusMeta[status];
}

function buildPontajHref(
	page: number,
	params: { status?: string; projectId?: string; from?: string; to?: string },
) {
	return buildListHref("/pontaj", { page, status: params.status, projectId: params.projectId, from: params.from, to: params.to });
}

export default async function PontajPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; projectId?: string; from?: string; to?: string }> }) {
	const sp = await searchParams;
	const page = parsePositiveIntParam(sp.page);
	const statusFilter = parseEnumParam(sp.status, Object.values(TimeEntryStatus));
	const fromDate = parseDateParam(sp.from);
	const toDate = sp.to ? parseDateParam(`${sp.to}T23:59:59`) : undefined;
	const startAtFilter = fromDate || toDate ? { gte: fromDate, lte: toDate } : undefined;
	const pageSize = 20;
	const session = await auth();
	const scope = session?.user ? await resolveAccessScope({ id: session.user.id, email: session.user.email, roleKeys: session.user.roleKeys || [] }) : { projectIds: null, teamId: null };
	const userContext = session?.user ? { id: session.user.id, email: session.user.email, roleKeys: session.user.roleKeys || [] } : { id: "", email: null, roleKeys: [] };
	const roleKeys = userContext.roleKeys || [];
	const canManageTeamPontaj = userContext.roleKeys.some((role) => ["SUPER_ADMIN", "ADMINISTRATOR", "PROJECT_MANAGER", "SITE_MANAGER", "BACKOFFICE"].includes(role));
	const canCreate = hasPermission(roleKeys, "TIME_TRACKING", "CREATE", userContext.email);
	const canApprove = hasPermission(roleKeys, "TIME_TRACKING", "APPROVE", userContext.email);
	const canExport = hasPermission(roleKeys, "TIME_TRACKING", "EXPORT", userContext.email);
	const filterParams = { status: sp.status, projectId: sp.projectId, from: sp.from, to: sp.to };
	const where = {
		...timeEntryScopeWhere(userContext, scope),
		projectId: sp.projectId && (scope.projectIds === null || scope.projectIds.includes(sp.projectId)) ? sp.projectId : undefined,
		status: statusFilter,
		startAt: startAtFilter,
	};

	const selectClass = "h-9 border border-[var(--b1)] bg-[var(--s1)] px-3 font-mono text-[10px] text-[var(--t2)] outline-none focus:border-[var(--amber)]";

	const [projects, workOrders, users, total] = await Promise.all([
		prisma.project.findMany({ where: { deletedAt: null, ...(scope.projectIds === null ? {} : { id: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } }) }, select: { id: true, title: true }, orderBy: [{ title: "asc" }, { id: "asc" }] }),
		prisma.workOrder.findMany({ where: { deletedAt: null, ...(scope.projectIds === null ? {} : { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } }) }, select: { id: true, title: true, projectId: true }, orderBy: [{ title: "asc" }, { id: "asc" }] }),
		canManageTeamPontaj ? prisma.user.findMany({ where: { deletedAt: null, isActive: true }, select: { id: true, firstName: true, lastName: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }) : [],
		prisma.timeEntry.count({ where }),
	]);

	const pagination = resolvePagination({ page, totalItems: total, pageSize });
	const entries = await prisma.timeEntry.findMany({
		where, orderBy: [{ startAt: "desc" }, { id: "desc" }],
		include: { user: { select: { id: true, firstName: true, lastName: true } }, project: { select: { id: true, title: true } }, workOrder: { select: { id: true, title: true } } },
		skip: pagination.skip, take: pageSize,
	});

	return (
		<PermissionGuard resource="TIME_TRACKING" action="VIEW">
			<div className="flex flex-col gap-3">
				<PageHeader title="PONTAJ" subtitle="URMARIRE TIMP SI GESTIUNE ORE" />

				{/* Filters */}
				<div className="flex flex-wrap items-center gap-2 border border-[var(--b1)] bg-[var(--s1)] p-2 sm:p-3">
					<select className={selectClass}>
						<option value="">TOATE PROIECTELE</option>
						{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
					</select>
					<select className={selectClass}>
						<option value="">TOATE STATUSURILE</option>
						{Object.values(TimeEntryStatus).map((s) => <option key={s} value={s}>{s}</option>)}
					</select>
					<Input type="date" className="h-9 w-[140px] text-[10px]" />
					<Input type="date" className="h-9 w-[140px] text-[10px]" />
					<div className="ml-auto flex gap-2">
						{canCreate && <Button size="sm">+ PONTAJ NOU</Button>}
						{canExport && <Button variant="secondary" size="sm">↓ EXPORT</Button>}
					</div>
				</div>

				{/* Table */}
				{entries.length === 0 ? (
					<EmptyState title="NU EXISTA INTRARI DE PONTAJ" description="FILTRAREA CURENTA NU A PRODUS NICIUN REZULTAT." />
				) : (
					<div className="border border-[var(--b1)] bg-[var(--s1)]">
						<Table>
							<thead>
								<tr>
									<TH>UTILIZATOR</TH>
									<TH>DATA</TH>
									<TH>PROIECT</TH>
									<TH>LUCRARE</TH>
									<TH>ORE</TH>
									<TH>STATUS</TH>
									<TH className="text-right">ACTIUNI</TH>
								</tr>
							</thead>
							<tbody>
								{entries.map((entry) => {
									const meta = getTimeEntryStatusMeta(entry.status);
									const duration = entry.startAt && entry.endAt ? Math.round((entry.endAt.getTime() - entry.startAt.getTime()) / 3600000 * 100) / 100 : "-";
									return (
										<tr key={entry.id} className="border-b border-[var(--b1)] last:border-b-0">
											<TD className="font-mono text-[10px] text-[var(--t2)]">
												{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : "-"}
											</TD>
											<TD className="font-mono text-[10px] text-[var(--t2)]">
												{entry.startAt ? formatDate(entry.startAt) : "-"}
											</TD>
											<TD className="text-[11px]">{entry.project?.title || "-"}</TD>
											<TD className="text-[11px]">{entry.workOrder?.title || "-"}</TD>
											<TD className="font-mono text-[11px]">{duration}h</TD>
											<TD><Badge tone={meta.tone}>{meta.label}</Badge></TD>
											<TD className="text-right">
												{canApprove && entry.status === TimeEntryStatus.SUBMITTED && (
													<form action={approveTimeEntry} className="inline">
														<input type="hidden" name="id" value={entry.id} />
														<ConfirmSubmitButton text="APROBA" confirmMessage="APROBI PONTAJUL?" size="sm" variant="secondary" />
													</form>
												)}
											</TD>
										</tr>
									);
								})}
							</tbody>
						</Table>
						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div className="flex items-center justify-between border-t border-[var(--b1)] px-3 py-2 text-[9px] text-[var(--t3)] sm:px-4">
								<span className="font-mono">{total} INTRARI</span>
								<div className="flex gap-2">
									{pagination.currentPage > 1 && (
										<Link href={buildPontajHref(pagination.currentPage - 1, filterParams)} className="border border-[var(--b1)] px-2 py-1 hover:border-[var(--amber)]">
											←
										</Link>
									)}
									<span className="font-mono">PAG {pagination.currentPage} / {pagination.totalPages}</span>
									{pagination.currentPage < pagination.totalPages && (
										<Link href={buildPontajHref(pagination.currentPage + 1, filterParams)} className="border border-[var(--b1)] px-2 py-1 hover:border-[var(--amber)]">
											→
										</Link>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</PermissionGuard>
	);
}
