import { ProjectStatus } from "@prisma/client";
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
import { projectScopeWhere, resolveAccessScope } from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
	buildListHref,
	parseEnumParam,
	parsePositiveIntParam,
	resolvePagination,
} from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import {
	bulkProjectsAction,
	deleteProject,
	updateProjectStatusAction,
} from "./actions";
import { ProjectCreateForm } from "./project-create-form";

const projectStatusMeta: Record<
	ProjectStatus,
	{ label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
	DRAFT: { label: "Schita", tone: "neutral" },
	PLANNED: { label: "Planificat", tone: "info" },
	ACTIVE: { label: "In lucru", tone: "success" },
	BLOCKED: { label: "Blocat", tone: "danger" },
	COMPLETED: { label: "Finalizat", tone: "neutral" },
	CANCELED: { label: "Anulat", tone: "warning" },
};

function mapStatus(status: ProjectStatus) {
	return projectStatusMeta[status];
}

const projectStatusOptions = Object.values(ProjectStatus).map((status) => ({
	value: status,
	label: projectStatusMeta[status].label,
}));

function formatProjectDates(startDate: Date | null, endDate: Date | null) {
	if (!startDate && !endDate) return "Fara interval";
	if (startDate && endDate)
		return `${formatDate(startDate)} → ${formatDate(endDate)}`;
	if (startDate) return `Start: ${formatDate(startDate)}`;
	return `Termen: ${formatDate(endDate as Date)}`;
}

function buildProiecteHref({
	page,
	q,
	status,
	bulk,
}: {
	page?: number;
	q?: string;
	status?: ProjectStatus | null;
	bulk?: boolean;
}) {
	return buildListHref("/proiecte", {
		page,
		q,
		status: status || undefined,
		bulk: bulk ? "1" : undefined,
	});
}

function PaginationLink({
	href,
	label,
	disabled,
}: {
	href: string | null;
	label: string;
	disabled?: boolean;
}) {
	if (disabled || !href) {
		return (
			<span className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted)] opacity-40 sm:flex-none">
				{label}
			</span>
		);
	}
	return (
		<Link
			href={href}
			className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] active:scale-[0.98] sm:flex-none"
		>
			{label}
		</Link>
	);
}

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		status?: string;
		page?: string;
		bulk?: string;
	}>;
}) {
	const params = await searchParams;
	const query = params.q?.trim() || "";
	const statusFilter = parseEnumParam(
		params.status,
		Object.values(ProjectStatus),
	);
	const page = parsePositiveIntParam(params.page);
	const bulkOpen = params.bulk === "1";
	const pageSize = 10;
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
	const canCreate = hasPermission(roleKeys, "PROJECTS", "CREATE", userEmail);
	const canUpdate = hasPermission(roleKeys, "PROJECTS", "UPDATE", userEmail);
	const canDelete = hasPermission(roleKeys, "PROJECTS", "DELETE", userEmail);
	const where = {
		deletedAt: null,
		...projectScopeWhere(scope.projectIds),
		title: query
			? { contains: query, mode: "insensitive" as const }
			: undefined,
		status: statusFilter || undefined,
	};

	const [total, clients] = await Promise.all([
		prisma.project.count({ where }),
		prisma.client.findMany({
			where:
				scope.projectIds === null
					? { deletedAt: null }
					: {
							deletedAt: null,
							projects: {
								some: {
									id: {
										in: scope.projectIds.length
											? scope.projectIds
											: ["__none__"],
									},
								},
							},
						},
			select: { id: true, name: true },
			orderBy: [{ name: "asc" }, { id: "asc" }],
		}),
	]);
	const { totalPages, currentPage, skip, take } = resolvePagination({
		page,
		totalItems: total,
		pageSize,
	});
	const projects = await prisma.project.findMany({
		where,
		select: {
			id: true,
			code: true,
			title: true,
			siteAddress: true,
			startDate: true,
			endDate: true,
			estimatedBudget: true,
			contractValue: true,
			progressPercent: true,
			status: true,
			client: { select: { name: true } },
			manager: { select: { firstName: true, lastName: true } },
		},
		orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
		skip,
		take,
	});

	const bulkHref = buildProiecteHref({
		page: currentPage,
		q: query,
		status: statusFilter,
		bulk: !bulkOpen,
	});
	const closeBulkHref = buildProiecteHref({
		page: currentPage,
		q: query,
		status: statusFilter,
	});

	return (
		<PermissionGuard resource="PROJECTS" action="VIEW">
			<div className="page-stack">
				{/* Header with action button */}
				<PageHeader
					title="Proiecte"
					subtitle="Portofoliu executie, costuri, status contractual"
					actions={
						canCreate ? (
							<FormModal
								triggerLabel="Adauga proiect"
								title="Creare proiect nou"
								description="Completeaza datele contractuale si de executie."
							>
								<ProjectCreateForm clients={clients} />
							</FormModal>
						) : undefined
					}
				/>

				{/* Inline filters */}
				<form className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
					<Input
						name="q"
						placeholder="Cauta dupa nume proiect..."
						defaultValue={query}
					/>
					<input type="hidden" name="page" value="1" />
					<select
						name="status"
						defaultValue={statusFilter || ""}
						className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] sm:h-11"
					>
						<option value="">Toate statusurile</option>
						{projectStatusOptions.map((status) => (
							<option key={status.value} value={status.value}>
								{status.label}
							</option>
						))}
					</select>
					<Button type="submit" variant="secondary">
						Aplica
					</Button>
				</form>

				{/* Bulk actions — collapsible */}
				{(canUpdate || canDelete) && (
					<div className="flex items-center gap-3 text-sm">
						<Link
							href={bulkHref}
							className="text-xs font-medium text-[var(--accent)] hover:underline"
						>
							{bulkOpen ? "Ascunde actiuni bulk" : "Actiuni in masa"}
						</Link>
						<span className="text-[var(--muted)]">·</span>
						<span className="text-xs text-[var(--muted)]">
							{total} proiecte
						</span>
					</div>
				)}

				{bulkOpen && (canUpdate || canDelete) && (
					<Card>
						<form action={bulkProjectsAction} className="space-y-3">
							<div className="grid gap-2 md:grid-cols-3">
								<select
									name="operation"
									defaultValue={canUpdate ? "SET_STATUS" : "ARCHIVE"}
									className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm sm:h-11"
								>
									{canUpdate ? (
										<option value="SET_STATUS">Actualizeaza status</option>
									) : null}
									{canDelete ? (
										<option value="ARCHIVE">Arhiveaza (soft delete)</option>
									) : null}
								</select>
								<select
									name="status"
									defaultValue={ProjectStatus.ACTIVE}
									disabled={!canUpdate}
									className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm disabled:opacity-50 sm:h-11"
								>
									{projectStatusOptions.map((status) => (
										<option key={status.value} value={status.value}>
											{status.label}
										</option>
									))}
								</select>
								<ConfirmSubmitButton
									text="Executa"
									confirmMessage="Confirmi executia actiunii bulk pe proiectele selectate?"
								/>
							</div>
							<div className="max-h-36 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
								<div className="grid gap-1 md:grid-cols-2">
									{projects.map((project) => (
										<label
											key={project.id}
											className="flex items-center gap-2 text-sm text-[var(--muted-strong)]"
										>
											<input
												type="checkbox"
												name="ids"
												value={project.id}
												className="size-4 accent-[var(--accent)]"
											/>
											<span>
												{project.code} · {project.title}
											</span>
										</label>
									))}
								</div>
							</div>
							<Link
								href={closeBulkHref}
								className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
							>
								Inchide
							</Link>
						</form>
					</Card>
				)}

				{/* Project list */}
				{projects.length === 0 ? (
					<EmptyState
						title="Nu exista proiecte"
						description="Adauga primul proiect pentru a incepe planificarea."
					/>
				) : (
					<>
						{/* Mobile cards */}
						<div className="space-y-2 lg:hidden">
							{projects.map((project) => {
								const status = mapStatus(project.status);
								return (
									<Link
										key={project.id}
										href={`/proiecte/${project.id}`}
										className="block"
									>
										<Card
											className="active:bg-[var(--surface-2)]"
											rail="project"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<p className="truncate font-semibold text-[var(--foreground)]">
														{project.title}
													</p>
													<p className="mt-0.5 text-xs text-[var(--muted)]">
														{project.code} · {project.client.name}
													</p>
												</div>
												<Badge tone={status.tone} className="shrink-0">
													{status.label}
												</Badge>
											</div>
											<div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted)]">
												<span>{project.progressPercent}%</span>
												<span>
													{formatCurrency(
														project.estimatedBudget?.toString() || 0,
													)}
												</span>
												<span className="ml-auto">
													{formatProjectDates(
														project.startDate,
														project.endDate,
													)}
												</span>
											</div>
										</Card>
									</Link>
								);
							})}
						</div>

						{/* Desktop table */}
						<Card flush className="hidden lg:block">
							<Table>
								<thead>
									<tr>
										<TH>COD</TH>
										<TH>PROIECT</TH>
										<TH>CLIENT</TH>
										<TH>MANAGER</TH>
										<TH>BUGET</TH>
										<TH>PROGRES</TH>
										<TH>STATUS</TH>
										<TH>ACTIUNI</TH>
									</tr>
								</thead>
								<tbody>
									{projects.map((project) => {
										const status = mapStatus(project.status);
										return (
											<tr key={project.id}>
												<TD>
													<span className="font-mono text-xs">
														{project.code}
													</span>
												</TD>
												<TD>
													<Link
														href={`/proiecte/${project.id}`}
														className="font-medium text-[var(--accent)] hover:underline"
													>
														{project.title}
													</Link>
													{project.siteAddress && (
														<p className="text-xs text-[var(--muted)]">
															{project.siteAddress}
														</p>
													)}
													<p className="text-xs text-[var(--muted)]">
														{formatProjectDates(
															project.startDate,
															project.endDate,
														)}
													</p>
												</TD>
												<TD>{project.client.name}</TD>
												<TD>
													{project.manager
														? `${project.manager.firstName} ${project.manager.lastName}`
														: "Nealocat"}
												</TD>
												<TD>
													<p>
														{formatCurrency(
															project.estimatedBudget?.toString() || 0,
														)}
													</p>
													<p className="text-xs text-[var(--muted)]">
														Contract:{" "}
														{formatCurrency(
															project.contractValue?.toString() || 0,
														)}
													</p>
												</TD>
												<TD>
													<span className="tabular-nums">
														{project.progressPercent}%
													</span>
												</TD>
												<TD>
													<Badge tone={status.tone}>{status.label}</Badge>
												</TD>
												<TD>
													{canUpdate || canDelete ? (
														<div className="flex gap-1.5">
															{canUpdate ? (
																<form
																	action={updateProjectStatusAction}
																	className="flex gap-1"
																>
																	<input
																		type="hidden"
																		name="id"
																		value={project.id}
																	/>
																	<select
																		name="status"
																		defaultValue={project.status}
																		className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-1)] px-2 text-xs"
																	>
																		{projectStatusOptions.map((st) => (
																			<option key={st.value} value={st.value}>
																				{st.label}
																			</option>
																		))}
																	</select>
																	<Button
																		size="sm"
																		variant="ghost"
																		type="submit"
																	>
																		Actualizeaza
																	</Button>
																</form>
															) : null}
															{canDelete ? (
																<form action={deleteProject}>
																	<input
																		type="hidden"
																		name="id"
																		value={project.id}
																	/>
																	<Button
																		size="sm"
																		variant="destructive"
																		type="submit"
																	>
																		Sterge
																	</Button>
																</form>
															) : null}
														</div>
													) : (
														<span className="text-xs text-[var(--muted)]">
															·
														</span>
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
						Pagina{" "}
						<span className="font-medium text-[var(--foreground)]">
							{currentPage}
						</span>{" "}
						din{" "}
						<span className="font-medium text-[var(--foreground)]">
							{totalPages}
						</span>
					</span>
					<div className="flex w-full gap-2 sm:w-auto">
						<PaginationLink
							href={
								currentPage > 1
									? buildProiecteHref({
											page: currentPage - 1,
											q: query,
											status: statusFilter,
										})
									: null
							}
							label="Anterior"
							disabled={currentPage <= 1}
						/>
						<PaginationLink
							href={
								currentPage < totalPages
									? buildProiecteHref({
											page: currentPage + 1,
											q: query,
											status: statusFilter,
										})
									: null
							}
							label="Urmator"
							disabled={currentPage >= totalPages}
						/>
					</div>
				</div>
			</div>
		</PermissionGuard>
	);
}
