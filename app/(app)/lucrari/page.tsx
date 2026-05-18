import { Prisma, type TaskPriority, WorkOrderStatus } from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
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
	workOrderScopeWhere,
} from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
	buildListHref,
	parseEnumParam,
	parsePositiveIntParam,
	resolvePagination,
} from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatDate } from "@/src/lib/utils";
import { BulkActionsCard } from "./bulk-actions-card";
import { WorkOrderCreateForm } from "./work-order-create-form";
import { WorkOrderRowActions } from "./work-order-row-actions";

function isPoolTimeout(error: unknown) {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2024"
	);
}

async function withPoolFallback<T>(
	label: string,
	query: () => Promise<T>,
	fallback: T,
): Promise<T> {
	try {
		return await query();
	} catch (error) {
		if (isPoolTimeout(error)) {
			console.warn(
				`[lucrari] Prisma pool timeout on ${label}. Using fallback data.`,
			);
			return fallback;
		}
		throw error;
	}
}

const workOrderStatusMeta: Record<
	WorkOrderStatus,
	{ label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
	TODO: { label: "De facut", tone: "neutral" },
	IN_PROGRESS: { label: "In lucru", tone: "info" },
	BLOCKED: { label: "Blocat", tone: "danger" },
	REVIEW: { label: "In verificare", tone: "warning" },
	DONE: { label: "Finalizat", tone: "success" },
	CANCELED: { label: "Anulat", tone: "neutral" },
};

const priorityMeta: Record<
	TaskPriority,
	{ label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
	LOW: { label: "Scazuta", tone: "neutral" },
	MEDIUM: { label: "Medie", tone: "info" },
	HIGH: { label: "Ridicata", tone: "warning" },
	CRITICAL: { label: "Critica", tone: "danger" },
};

const workOrderStatusOptions = Object.values(WorkOrderStatus).map((status) => ({
	value: status,
	label: workOrderStatusMeta[status].label,
}));
function getStatusTone(status: WorkOrderStatus) {
	return workOrderStatusMeta[status].tone;
}
function getPriorityTone(priority: TaskPriority) {
	return priorityMeta[priority].tone;
}
function formatPriority(priority: TaskPriority) {
	return priorityMeta[priority].label;
}
function formatWorkOrderStatus(status: WorkOrderStatus) {
	return workOrderStatusMeta[status].label;
}

function formatDeadline(dueDate: Date | null, status: WorkOrderStatus) {
	if (!dueDate) return { label: "Fara termen", tone: "neutral" as const };
	if (status === WorkOrderStatus.DONE || status === WorkOrderStatus.CANCELED)
		return {
			label: `Finalizat la ${formatDate(dueDate)}`,
			tone: "success" as const,
		};
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const dueStart = new Date(
		dueDate.getFullYear(),
		dueDate.getMonth(),
		dueDate.getDate(),
	);
	const diffDays = Math.round(
		(dueStart.getTime() - startOfToday.getTime()) / 86400000,
	);
	if (diffDays < 0)
		return { label: `Restant ${Math.abs(diffDays)}z`, tone: "danger" as const };
	if (diffDays === 0) return { label: "Azi", tone: "warning" as const };
	if (diffDays === 1) return { label: "Maine", tone: "warning" as const };
	return { label: `${diffDays}z`, tone: "neutral" as const };
}

function buildLucrariHref({
	page,
	q,
	status,
	projectId,
}: {
	page?: number;
	q?: string;
	status?: WorkOrderStatus | null;
	projectId?: string;
}) {
	return buildListHref("/lucrari", {
		page,
		q,
		status: status || undefined,
		projectId,
	});
}

type WorkOrderItem = {
	id: string;
	title: string;
	description: string | null;
	startDate: Date | null;
	dueDate: Date | null;
	priority: TaskPriority;
	status: WorkOrderStatus;
	project: { title: string };
	responsible: { firstName: string; lastName: string } | null;
	team: { name: string } | null;
};

function WorkOrderFilters({
	q,
	statusFilter,
	params,
	projects,
	selectClass,
}: {
	q: string;
	statusFilter: WorkOrderStatus | undefined;
	params: { projectId?: string };
	projects: { id: string; title: string }[];
	selectClass: string;
}) {
	return (
		<form className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
			<input type="hidden" name="page" value="1" />
			<Input name="q" placeholder="Cauta lucrare..." defaultValue={q} />
			<select
				name="status"
				defaultValue={statusFilter || ""}
				className={selectClass}
			>
				<option value="">Toate statusurile</option>
				{workOrderStatusOptions.map((s) => (
					<option key={s.value} value={s.value}>
						{s.label}
					</option>
				))}
			</select>
			<select
				name="projectId"
				defaultValue={params.projectId || ""}
				className={selectClass}
			>
				<option value="">Toate proiectele</option>
				{projects.map((project) => (
					<option key={project.id} value={project.id}>
						{project.title}
					</option>
				))}
			</select>
			<Button type="submit" variant="secondary">
				Filtreaza
			</Button>
		</form>
	);
}

function WorkOrderMobileCards({ workOrders }: { workOrders: WorkOrderItem[] }) {
	return (
		<div className="space-y-2 lg:hidden">
			{workOrders.map((item) => {
				const deadline = formatDeadline(item.dueDate, item.status);
				return (
					<Link key={item.id} href={`/lucrari/${item.id}`} className="block">
						<Card className="active:bg-[var(--surface-2)]">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate font-semibold text-[var(--foreground)]">
										{item.title}
									</p>
									<p className="mt-0.5 text-xs text-[var(--muted)]">
										{item.project.title}
									</p>
								</div>
								<Badge tone={getStatusTone(item.status)} className="shrink-0">
									{formatWorkOrderStatus(item.status)}
								</Badge>
							</div>
							<div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted)]">
								<Badge
									tone={getPriorityTone(item.priority)}
									className="text-[10px]"
								>
									{formatPriority(item.priority)}
								</Badge>
								<span
									className={
										deadline.tone === "danger"
											? "font-medium text-[var(--status-blocked)]"
											: ""
									}
								>
									{deadline.label}
								</span>
								<span className="ml-auto truncate">
									{item.team?.name || "—"}
								</span>
							</div>
						</Card>
					</Link>
				);
			})}
		</div>
	);
}

function WorkOrderDesktopTable({
	workOrders,
	canUpdate,
	canDelete,
}: {
	workOrders: WorkOrderItem[];
	canUpdate: boolean;
	canDelete: boolean;
}) {
	return (
		<Card flush className="hidden lg:block">
			<Table>
				<thead>
					<tr>
						<TH>TITLU</TH>
						<TH>PROIECT</TH>
						<TH>RESPONSABIL</TH>
						<TH>ECHIPA</TH>
						<TH>TERMEN</TH>
						<TH>PRIORITATE</TH>
						<TH>STATUS</TH>
						<TH>ACTIUNI</TH>
					</tr>
				</thead>
				<tbody>
					{workOrders.map((item) => {
						const deadline = formatDeadline(item.dueDate, item.status);
						return (
							<tr key={item.id}>
								<TD>
									<Link
										href={`/lucrari/${item.id}`}
										className="font-medium text-[var(--accent)] hover:underline"
									>
										{item.title}
									</Link>
									{item.description && (
										<p className="text-xs text-[var(--muted)]">
											{item.description.slice(0, 80)}
										</p>
									)}
								</TD>
								<TD>{item.project.title}</TD>
								<TD>
									{item.responsible
										? `${item.responsible.firstName} ${item.responsible.lastName}`
										: "Nealocat"}
								</TD>
								<TD>{item.team?.name || "—"}</TD>
								<TD>
									<span
										className={
											deadline.tone === "danger"
												? "font-medium text-[var(--status-blocked)]"
												: "text-[var(--muted-strong)]"
										}
									>
										{deadline.label}
									</span>
								</TD>
								<TD>
									<Badge tone={getPriorityTone(item.priority)}>
										{formatPriority(item.priority)}
									</Badge>
								</TD>
								<TD>
									<Badge tone={getStatusTone(item.status)}>
										{formatWorkOrderStatus(item.status)}
									</Badge>
								</TD>
								<TD>
									<WorkOrderRowActions
										workOrderId={item.id}
										currentStatus={item.status}
										canUpdate={canUpdate}
										canDelete={canDelete}
									/>
								</TD>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</Card>
	);
}

export default async function WorkOrdersPage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		status?: string;
		page?: string;
		projectId?: string;
	}>;
}) {
	const params = await searchParams;
	const q = params.q?.trim() || "";
	const statusFilter = parseEnumParam(
		params.status,
		Object.values(WorkOrderStatus),
	);
	const page = parsePositiveIntParam(params.page);
	const pageSize = 12;
	const session = await auth();
	const scope = session?.user
		? await resolveAccessScope({
				id: session.user.id,
				email: session.user.email,
				roleKeys: session.user.roleKeys || [],
			})
		: { projectIds: null, teamId: null };
	const userContext = session?.user
		? {
				id: session.user.id,
				email: session.user.email,
				roleKeys: session.user.roleKeys || [],
			}
		: { id: "", email: null, roleKeys: [] };
	const roleKeys = userContext.roleKeys || [];
	const canCreate = hasPermission(
		roleKeys,
		"TASKS",
		"CREATE",
		userContext.email,
	);
	const canUpdate = hasPermission(
		roleKeys,
		"TASKS",
		"UPDATE",
		userContext.email,
	);
	const canDelete = hasPermission(
		roleKeys,
		"TASKS",
		"DELETE",
		userContext.email,
	);

	const where = {
		deletedAt: null,
		project: { deletedAt: null },
		...workOrderScopeWhere(userContext, scope),
		title: q ? { contains: q, mode: "insensitive" as const } : undefined,
		status: statusFilter,
		projectId:
			params.projectId &&
			(scope.projectIds === null || scope.projectIds.includes(params.projectId))
				? params.projectId
				: undefined,
	};
	const activeWorkOrderWhere = {
		deletedAt: null,
		project: { deletedAt: null },
		...workOrderScopeWhere(userContext, scope),
		status: { notIn: [WorkOrderStatus.DONE, WorkOrderStatus.CANCELED] },
	};

	const [
		projects,
		users,
		teams,
		responsibleLoad,
		teamLoad,
		checklistTemplates,
		total,
	] = await Promise.all([
		withPoolFallback(
			"project.findMany",
			() =>
				prisma.project.findMany({
					where: {
						deletedAt: null,
						...(scope.projectIds === null
							? {}
							: {
									id: {
										in: scope.projectIds.length
											? scope.projectIds
											: ["__none__"],
									},
								}),
					},
					select: { id: true, title: true },
					orderBy: [{ title: "asc" }, { id: "asc" }],
				}),
			[],
		),
		withPoolFallback(
			"user.findMany",
			() =>
				prisma.user.findMany({
					where: { isActive: true, deletedAt: null },
					select: { id: true, firstName: true, lastName: true },
					orderBy: [{ firstName: "asc" }, { id: "asc" }],
				}),
			[],
		),
		withPoolFallback(
			"team.findMany",
			() =>
				prisma.team.findMany({
					where: scope.teamId
						? { deletedAt: null, isActive: true, id: scope.teamId }
						: { deletedAt: null, isActive: true },
					select: { id: true, name: true },
					orderBy: [{ name: "asc" }, { id: "asc" }],
				}),
			[],
		),
		withPoolFallback(
			"workOrder.groupBy.responsibleId",
			() =>
				prisma.workOrder.groupBy({
					by: ["responsibleId"],
					where: { ...activeWorkOrderWhere, responsibleId: { not: null } },
					_count: { _all: true },
				}),
			[],
		),
		withPoolFallback(
			"workOrder.groupBy.teamId",
			() =>
				prisma.workOrder.groupBy({
					by: ["teamId"],
					where: { ...activeWorkOrderWhere, teamId: { not: null } },
					_count: { _all: true },
				}),
			[],
		),
		withPoolFallback(
			"checklistTemplate.findMany",
			() =>
				prisma.checklistTemplate.findMany({
					orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
					select: { id: true, name: true, category: true },
				}),
			[],
		),
		withPoolFallback(
			"workOrder.count",
			() => prisma.workOrder.count({ where }),
			0,
		),
	]);
	const responsibleWorkloadById = Object.fromEntries(
		responsibleLoad.flatMap((item) =>
			item.responsibleId
				? [[item.responsibleId as string, item._count._all] as const]
				: [],
		),
	);
	const teamWorkloadById = Object.fromEntries(
		teamLoad.flatMap((item) =>
			item.teamId ? [[item.teamId as string, item._count._all] as const] : [],
		),
	);
	const { totalPages, currentPage, skip, take } = resolvePagination({
		page,
		totalItems: total,
		pageSize,
	});
	const workOrders = (await withPoolFallback(
		"workOrder.findMany",
		() =>
			prisma.workOrder.findMany({
				where,
				select: {
					id: true,
					title: true,
					description: true,
					startDate: true,
					dueDate: true,
					priority: true,
					status: true,
					project: { select: { title: true } },
					responsible: { select: { firstName: true, lastName: true } },
					team: { select: { name: true } },
				},
				orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }, { id: "asc" }],
				skip,
				take,
			}),
		[],
	)) as WorkOrderItem[];

	const selectClass =
		"h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] sm:h-11";

	return (
		<PermissionGuard resource="TASKS" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title="Lucrari"
					subtitle="Coordonare executie, termene si alocare echipe"
					actions={
						canCreate ? (
							<FormModal
								triggerLabel="Adauga lucrare"
								title="Creare ordin de lucru"
								description="Completeaza detaliile de executie, responsabilul si echipa."
							>
								<WorkOrderCreateForm
									projects={projects.map((p) => ({ id: p.id, label: p.title }))}
									users={users.map((u) => ({
										id: u.id,
										label: `${u.firstName} ${u.lastName}`,
									}))}
									teams={teams.map((t) => ({ id: t.id, label: t.name }))}
									templates={checklistTemplates.map((t) => ({
										id: t.id,
										label: `[${t.category}] ${t.name}`,
									}))}
									responsibleWorkloadById={responsibleWorkloadById}
									teamWorkloadById={teamWorkloadById}
								/>
							</FormModal>
						) : undefined
					}
				/>
				<WorkOrderFilters
					q={q}
					statusFilter={statusFilter}
					params={params}
					projects={projects}
					selectClass={selectClass}
				/>
				{(canUpdate || canDelete) && (
					<BulkActionsCard
						workOrders={workOrders.map((item) => ({
							id: item.id,
							title: item.title,
						}))}
						canUpdate={canUpdate}
						canDelete={canDelete}
					/>
				)}
				{workOrders.length === 0 ? (
					<EmptyState
						title="Nu exista lucrari"
						description="Adauga primul ordin de lucru pentru santier."
					/>
				) : (
					<>
						<WorkOrderMobileCards workOrders={workOrders} />
						<WorkOrderDesktopTable
							workOrders={workOrders}
							canUpdate={canUpdate}
							canDelete={canDelete}
						/>
					</>
				)}
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
						{" · "}
						{total} lucrari
					</span>
					<div className="flex w-full gap-2 sm:w-auto">
						{currentPage > 1 && (
							<Link
								href={buildLucrariHref({
									page: currentPage - 1,
									q: q || undefined,
									status: statusFilter,
									projectId: params.projectId,
								})}
								className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] sm:flex-none"
							>
								Anterior
							</Link>
						)}
						{currentPage < totalPages && (
							<Link
								href={buildLucrariHref({
									page: currentPage + 1,
									q: q || undefined,
									status: statusFilter,
									projectId: params.projectId,
								})}
								className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] sm:flex-none"
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
