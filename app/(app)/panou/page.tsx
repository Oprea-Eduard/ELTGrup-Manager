import {
	FgoInvoiceStatus,
	RoleKey,
	type WorkOrderStatus,
} from "@prisma/client";
import { AlertTriangle, ArrowRight, FileWarning, Package } from "lucide-react";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { DashboardScheduleTable } from "@/src/components/dashboard/schedule-table";
import { Card } from "@/src/components/ui/card";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { Section } from "@/src/components/ui/section";
import { StatRow } from "@/src/components/ui/stat-row";
import {
	resolveAccessScope,
	workOrderScopeWhere,
} from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { formatCurrency, formatDate, fullName } from "@/src/lib/utils";
import { ClientProductivityChart } from "./client-productivity-chart";
import ClientViewerDashboard from "./client-viewer-dashboard";
import { FgoWidget } from "./fgo-widget";

function getPrimaryRole(roleKeys: string[]) {
	const priority: RoleKey[] = [
		RoleKey.SUPER_ADMIN,
		RoleKey.ADMINISTRATOR,
		RoleKey.MAGAZIONER,
		RoleKey.PROJECT_MANAGER,
		RoleKey.SITE_MANAGER,
		RoleKey.BACKOFFICE,
		RoleKey.ACCOUNTANT,
		RoleKey.WORKER,
		RoleKey.CLIENT_VIEWER,
		RoleKey.SUBCONTRACTOR,
	];
	return priority.find((role) => roleKeys.includes(role)) || RoleKey.WORKER;
}

const roleExperience: Record<RoleKey, { subtitle: string; focus: string[] }> = {
	SUPER_ADMIN: {
		subtitle: "CONTROL GLOBAL: RISC, MARJA, CASHFLOW SI BLOCAJE",
		focus: ["REVIZUIESTE ANALITICELE", "INTERVINE PE PROIECTE INTARZIATE"],
	},
	ADMINISTRATOR: {
		subtitle: "COORDONARE EXECUTIE: PROIECTE, ECHIPE, APROBARI",
		focus: ["CONFIRMA CERERILE MATERIALE", "VERIFICA LUCRARILE INTARZIATE"],
	},
	MAGAZIONER: {
		subtitle: "GESTIUNE INVENTAR: SCULE, MATERIALE, DEPOZIT",
		focus: ["VERIFICA CERERILE NOI", "INREGISTREAZA RETURURILE"],
	},
	PROJECT_MANAGER: {
		subtitle: "MANAGEMENT PROIECT: TERMENE, PROGRES, COSTURI",
		focus: ["COMPARA ORELE PONTATE CU ESTIMARILE", "URMARESTE BUGETUL"],
	},
	SITE_MANAGER: {
		subtitle: "EXECUTIE SANTIER: TASKURI, PONTAJ, BLOCAJE",
		focus: ["ACTUALIZEAZA RAPOARTELE", "ESCALADEAZA LUCRARILE BLOCATE"],
	},
	BACKOFFICE: {
		subtitle: "OPERATIUNI SUPORT: DOCUMENTE, TASKURI, MATERIALE",
		focus: ["ASIGURA COMPLETITUDINEA DOCUMENTELOR", "CURA CERERILE MATERIALE"],
	},
	ACCOUNTANT: {
		subtitle: "CONTROL FINANCIAR: COSTURI, FACTURARE, PLATI",
		focus: ["VERIFICA COSTURILE NOI", "URMARESTE FACTURILE SCADENTE"],
	},
	WORKER: {
		subtitle: "EXECUTIE PERSONALA: LUCRARI, PONTAJ, PROGRES",
		focus: ["PORNESTE/OPRESTE PONTAJUL", "TRIMITE UPDATE TEREN"],
	},
	CLIENT_VIEWER: {
		subtitle: "VIZIBILITATE CLIENT: PROGRES, DOCUMENTE, RAPOARTE",
		focus: ["CONSULTA TIMELINE-UL", "VERIFICA ULTIMELE RAPOARTE"],
	},
	SUBCONTRACTOR: {
		subtitle: "EXECUTIE SUBCONTRACTOR: TASKURI, LIVRABILE",
		focus: ["ACTUALIZEAZA TASKURILE", "INCADRCA DOVADA DE EXECUTIE"],
	},
};

type DashboardData = {
	delayedTasks: number;
	todaySchedule: unknown[];
	clockedIn: number;
	pendingMaterialApprovals: number;
	unpaidInvoices: { _sum: { totalAmount: unknown; paidAmount: unknown } };
	latestActivities: unknown[];
	chartData: { name: string; ore: number }[];
	upcomingChecks: unknown[];
	expiredChecks: number;
	totalInstallations: number;
	certifiedCount: number;
	maintenanceCount: number;
	offersDraft: number;
	offersSent: number;
	offersAccepted: number;
	avizareProjects: unknown[];
	activeProjects: number;
	plannedProjects: number;
	blockedProjects: number;
	completedProjects: number;
	todoOrders: number;
	inProgressOrders: number;
	blockedOrders: number;
	overdueInvoices: unknown[];
	fgoStats: { sent: number; pending: number; errors: number };
};

function KpiStrip({ d }: { d: DashboardData }) {
	const receivables =
		Number(d.unpaidInvoices._sum.totalAmount || 0) -
		Number(d.unpaidInvoices._sum.paidAmount || 0);
	return (
		<section className="page-kpis">
			<KpiCard
				label="PROIECTE ACTIVE"
				value={String(d.activeProjects)}
				helper="IN EXECUTIE"
				severity="info"
				href="/proiecte"
			/>
			<KpiCard
				label="LUCRARI INTARZIATE"
				value={String(d.delayedTasks)}
				helper="NECESITA INTERVENTIE"
				severity={d.delayedTasks > 0 ? "blocked" : "active"}
				href="/lucrari"
			/>
			<KpiCard
				label="PONTAJE ACTIVE"
				value={String(d.clockedIn)}
				helper="ECHIPE IN TEREN"
				severity="active"
				href="/pontaj"
			/>
			<KpiCard
				label="CERERI MATERIALE"
				value={String(d.pendingMaterialApprovals)}
				helper="IN ASTEPTARE"
				severity={d.pendingMaterialApprovals > 0 ? "pending" : "done"}
				href="/materiale"
			/>
			<KpiCard
				label="CREANTE NEINCASATE"
				value={formatCurrency(receivables)}
				helper="EXPUNERE CURENTA"
				severity={receivables > 0 ? "pending" : "done"}
				href="/financiar"
			/>
		</section>
	);
}

function ActionQueue({ d }: { d: DashboardData }) {
	if (
		d.delayedTasks <= 0 &&
		d.pendingMaterialApprovals <= 0 &&
		d.overdueInvoices.length <= 0
	)
		return null;
	return (
		<Card className="space-y-2" rail="alert">
			<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
				NECESITA ATENTIE
			</p>
			<div className="space-y-1.5">
				{d.delayedTasks > 0 && (
					<Link
						href="/lucrari"
						className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-[var(--surface-raised)]"
					>
						<AlertTriangle className="size-4 shrink-0 text-[var(--accent)]" />
						<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
							[{d.delayedTasks}] LUCRARI DEPASESC TERMENUL
						</span>
						<ArrowRight className="ml-auto size-3.5 text-[var(--text-secondary)]" />
					</Link>
				)}
				{d.pendingMaterialApprovals > 0 && (
					<Link
						href="/materiale"
						className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-[var(--surface-raised)]"
					>
						<Package className="size-4 shrink-0 text-[var(--warning)]" />
						<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
							[{d.pendingMaterialApprovals}] CERERI MATERIALE DE APROBAT
						</span>
						<ArrowRight className="ml-auto size-3.5 text-[var(--text-secondary)]" />
					</Link>
				)}
				{d.overdueInvoices.length > 0 && (
					<Link
						href="/financiar"
						className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-[var(--surface-raised)]"
					>
						<FileWarning className="size-4 shrink-0 text-[var(--accent)]" />
						<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
							[{d.overdueInvoices.length}] FACTURI RESTANTE
						</span>
						<ArrowRight className="ml-auto size-3.5 text-[var(--text-secondary)]" />
					</Link>
				)}
			</div>
		</Card>
	);
}

function ChartAndActivitySection({
	d,
	receivables,
}: {
	d: DashboardData;
	receivables: number;
}) {
	return (
		<section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
			<Card flush>
				<div className="px-5 py-4">
					<h2 className="text-base font-medium text-[var(--text-display)]">
						ORE FACTURABILE PE PROIECT
					</h2>
					<p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						DISTRIBUTIA ORELOR PONTATE
					</p>
				</div>
				<div className="px-4 pb-3">
					<ClientProductivityChart data={d.chartData} />
				</div>
				<div className="grid gap-px border-t border-[var(--border)] md:grid-cols-3">
					<div className="bg-[var(--surface)] px-4 py-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
							PLANIFICATE AZI
						</p>
						<p className="mt-1 font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--text-display)]">
							{d.todaySchedule.length}
						</p>
					</div>
					<div className="bg-[var(--surface)] px-4 py-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
							NEINCASAT
						</p>
						<p className="mt-1 font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--text-display)]">
							{formatCurrency(receivables)}
						</p>
					</div>
					<div className="bg-[var(--surface)] px-4 py-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
							APROBARI
						</p>
						<p className="mt-1 font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--text-display)]">
							{d.pendingMaterialApprovals}
						</p>
					</div>
				</div>
			</Card>
			<Card>
				<Section title="ACTIVITATE RECENTA">
					{d.latestActivities.length === 0 ? (
						<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							NU EXISTA ACTIVITATE RECENTA.
						</p>
					) : (
						<div className="space-y-3">
							{(
								d.latestActivities as {
									id: string;
									action: string;
									entityType: string;
									entityId: string;
									createdAt: Date;
									user: { firstName: string; lastName: string };
								}[]
							).map((log) => (
								<div
									key={log.id}
									className="border-l-2 border-[var(--border-visible)] pl-3"
								>
									<p className="text-sm font-medium text-[var(--text-display)]">
										{log.action}
									</p>
									<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
										{fullName(log.user?.firstName, log.user?.lastName)} · {log.entityType} #{log.entityId.slice(-6)}
									</p>
									<p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-disabled)]">
										{formatDate(log.createdAt)}
									</p>
								</div>
							))}
						</div>
					)}
				</Section>
			</Card>
		</section>
	);
}

function PipelineSection({ d }: { d: DashboardData }) {
	return (
		<section className="grid gap-4 xl:grid-cols-3">
			<FgoWidget fgoStats={d.fgoStats} />
			<Card>
				<Section
					title="PIPELINE COMERCIAL"
					actions={
						<Link
							href="/oferte"
							className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--interactive)] hover:text-[var(--text-display)] transition-colors"
						>
							[VEZI TOATE]
						</Link>
					}
				>
					<StatRow label="DRAFT" value={d.offersDraft} />
					<StatRow label="TRIMISE" value={d.offersSent} />
					<StatRow label="ACCEPTATE" value={d.offersAccepted} />
				</Section>
			</Card>
			<Card>
				<Section title="AVIZARE ISU">
					{d.avizareProjects.length === 0 ? (
						<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							NICIUN PROIECT IN FATA DE AVIZARE ISU.
						</p>
					) : (
						<div className="space-y-2">
							{(
								d.avizareProjects as {
									id: string;
									code: string;
									title: string;
									daysLeft: number | null;
								}[]
							).map((project) => (
								<Link
									key={project.id}
									href={`/proiecte/${project.id}`}
									className="block rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-[var(--surface-raised)]"
								>
									<p className="truncate font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
										{project.code} · {project.title}
									</p>
									{project.daysLeft !== null && (
										<p
											className={`font-mono text-[10px] uppercase tracking-[0.06em] ${project.daysLeft < 7 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
										>
											{project.daysLeft > 0
												? `TERMEN: ${project.daysLeft} ZILE`
												: "TERMEN DEPASIT"}
										</p>
									)}
								</Link>
							))}
						</div>
					)}
				</Section>
			</Card>
		</section>
	);
}

function PortfolioSection({ d }: { d: DashboardData }) {
	return (
		<section className="grid gap-4 md:grid-cols-2">
			<Card>
				<Section title="PORTOFOLIU PROIECTE">
					<StatRow label="PLANIFICATE" value={d.plannedProjects} />
					<StatRow label="ACTIVE" value={d.activeProjects} />
					<StatRow label="BLOCATE" value={d.blockedProjects} />
					<StatRow label="FINALIZATE" value={d.completedProjects} />
				</Section>
			</Card>
			<Card>
				<Section title="LUCRARI SI ECHIPE">
					<StatRow label="TODO" value={d.todoOrders} />
					<StatRow label="IN PROGRES" value={d.inProgressOrders} />
					<StatRow label="BLOCATE" value={d.blockedOrders} />
					<StatRow label="PONTAJ ACTIV" value={d.clockedIn} />
				</Section>
			</Card>
		</section>
	);
}

function ScheduleSection({ d }: { d: DashboardData }) {
	return (
		<Card flush>
			<div className="px-5 py-4">
				<h2 className="text-base font-medium text-[var(--text-display)]">
					PROGRAM ECHIPE ASTAZI
				</h2>
			</div>
			<div className="p-3 sm:p-4">
				<DashboardScheduleTable
					items={(
						d.todaySchedule as {
							id: string;
							title: string;
							startDate: Date | null;
							project: { title: string };
							team: { name: string } | null;
							status: WorkOrderStatus;
							description: string | null;
						}[]
					).map((item) => ({
						id: item.id,
						title: item.title,
						startLabel: item.startDate ? formatDate(item.startDate) : "-",
						projectTitle: item.project.title,
						teamName: item.team?.name || "NEALOCATA",
						status: item.status,
						description: item.description || "",
					}))}
				/>
			</div>
		</Card>
	);
}

export default async function DashboardPage() {
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
	const scopedProjectWhere =
		scope.projectIds === null
			? {}
			: {
					id: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] },
				};
	const scopedProjectIdWhere =
		scope.projectIds === null
			? {}
			: {
					projectId: {
						in: scope.projectIds.length ? scope.projectIds : ["__none__"],
					},
				};
	const scopedWorkOrderWhere = {
		...workOrderScopeWhere(userContext, scope),
		deletedAt: null,
	};
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const primaryRole = getPrimaryRole(userContext.roleKeys);
	const roleContext = roleExperience[primaryRole];

	if (primaryRole === RoleKey.CLIENT_VIEWER)
		return <ClientViewerDashboard userContext={userContext} scope={scope} />;

	const now = new Date();
	const in7Days = new Date();
	in7Days.setDate(now.getDate() + 7);

	async function getDashboardData() {
		const scopedWorkOrderIds =
			scope.projectIds === null
				? null
				: scope.projectIds.length === 0
					? []
					: (
							await prisma.workOrder.findMany({
								where: scopedWorkOrderWhere,
								select: { id: true },
								orderBy: { id: "asc" },
								take: 250,
							})
						).map((item) => item.id);

		const [
			installationAlerts,
			upcomingChecks,
			expiredChecks,
			offerBuckets,
			avizareProjects,
			delayedTasks,
			todaySchedule,
			clockedIn,
			pendingMaterialApprovals,
			unpaidInvoices,
			latestActivities,
			weeklyHours,
			projectStatusBuckets,
			workOrderStatusBuckets,
			overdueInvoices,
			fgoStatusBuckets,
		] = await Promise.all([
			prisma.projectInstallation.groupBy({
				by: ["status"],
				where: {
					deletedAt: null,
					project: { ...scopedProjectWhere, deletedAt: null },
				},
				_count: { _all: true },
			}),
			prisma.projectInstallation.findMany({
				where: {
					deletedAt: null,
					nextCheckAt: { gte: now, lte: in7Days },
					project: { ...scopedProjectWhere, deletedAt: null },
				},
				select: {
					id: true,
					name: true,
					nextCheckAt: true,
					status: true,
					project: { select: { id: true, code: true, title: true } },
				},
				orderBy: { nextCheckAt: "asc" },
				take: 5,
			}),
			prisma.projectInstallation.count({
				where: {
					deletedAt: null,
					nextCheckAt: { lt: now },
					project: { ...scopedProjectWhere, deletedAt: null },
				},
			}),
			prisma.offer.groupBy({
				by: ["status"],
				where: { deletedAt: null },
				_count: { _all: true },
			}),
			prisma.project.findMany({
				where: {
					deletedAt: null,
					...scopedProjectWhere,
					phases: { some: { type: "AVIZ_ISU", completed: false } },
				},
				select: {
					id: true,
					code: true,
					title: true,
					phases: {
						where: { type: "AVIZ_ISU" },
						select: { title: true, endDate: true, completed: true },
						orderBy: { position: "asc" },
						take: 1,
					},
				},
				take: 5,
			}),
			prisma.workOrder.count({
				where: {
					...scopedWorkOrderWhere,
					dueDate: { lt: new Date() },
					status: { notIn: ["DONE", "CANCELED"] },
				},
			}),
			prisma.workOrder.findMany({
				where: { ...scopedWorkOrderWhere, startDate: { gte: startOfToday } },
				select: {
					id: true,
					title: true,
					startDate: true,
					status: true,
					description: true,
					project: { select: { title: true } },
					team: { select: { name: true } },
				},
				orderBy: [{ startDate: "asc" }, { id: "asc" }],
				take: 10,
			}),
			prisma.timeEntry.count({
				where: { ...scopedProjectIdWhere, endAt: null },
			}),
			prisma.materialRequest.count({
				where: { ...scopedProjectIdWhere, status: "PENDING" },
			}),
			prisma.invoice.aggregate({
				where: {
					...scopedProjectIdWhere,
					status: { in: ["SENT", "OVERDUE", "PARTIAL_PAID"] },
				},
				_sum: { totalAmount: true, paidAmount: true },
			}),
			prisma.activityLog.findMany({
				where:
					scope.projectIds === null
						? undefined
						: {
								OR: [
									{
										entityType: "PROJECT",
										entityId: {
											in: scope.projectIds.length
												? scope.projectIds
												: ["__none__"],
										},
									},
									{
										entityType: "WORK_ORDER",
										entityId: {
											in: scopedWorkOrderIds?.length
												? scopedWorkOrderIds
												: ["__none__"],
										},
									},
								],
							},
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				select: {
					id: true,
					action: true,
					entityType: true,
					entityId: true,
					createdAt: true,
					user: { select: { firstName: true, lastName: true } },
				},
				take: 8,
			}),
			prisma.timeEntry.groupBy({
				by: ["projectId"],
				where: scopedProjectIdWhere,
				_sum: { durationMinutes: true },
				orderBy: [{ _sum: { durationMinutes: "desc" } }, { projectId: "asc" }],
				take: 6,
			}),
			prisma.project.groupBy({
				by: ["status"],
				where: { deletedAt: null, ...scopedProjectWhere },
				_count: { _all: true },
			}),
			prisma.workOrder.groupBy({
				by: ["status"],
				where: scopedWorkOrderWhere,
				_count: { _all: true },
			}),
			prisma.invoice.findMany({
				where: { ...scopedProjectIdWhere, status: "OVERDUE" },
				select: {
					id: true,
					invoiceNumber: true,
					totalAmount: true,
					paidAmount: true,
					dueDate: true,
					status: true,
					project: { select: { id: true, code: true, title: true } },
				},
				orderBy: { dueDate: "asc" },
				take: 5,
			}),
			prisma.invoice.groupBy({
				by: ["fgoStatus"],
				where: { ...scopedProjectIdWhere, fgoStatus: { not: null } },
				_count: { _all: true },
			}),
		]);

		const totalInstallations = installationAlerts.reduce(
			(acc, i) => acc + i._count._all,
			0,
		);
		const certifiedCount =
			installationAlerts.find((i) => i.status === "CERTIFIED")?._count._all ??
			0;
		const maintenanceCount =
			installationAlerts.find((i) => i.status === "UNDER_MAINTENANCE")?._count
				._all ?? 0;
		const projectsById =
			weeklyHours.length === 0
				? []
				: await prisma.project.findMany({
						where: {
							deletedAt: null,
							AND: [
								{ id: { in: weeklyHours.map((h) => h.projectId) } },
								scopedProjectWhere,
							],
						},
						select: { id: true, title: true },
					});
		const projectNameById = new Map(
			projectsById.map((p) => [p.id, p.title] as const),
		);
		const chartData = weeklyHours.map((h) => ({
			name: (projectNameById.get(h.projectId) || "PROIECT").slice(0, 18),
			ore: Math.round((h._sum.durationMinutes || 0) / 60),
		}));
		const offerCountByStatus = new Map(
			offerBuckets.map((item) => [item.status, item._count._all]),
		);
		const projectCountByStatus = new Map(
			projectStatusBuckets.map((item) => [item.status, item._count._all]),
		);
		const workOrderCountByStatus = new Map(
			(workOrderStatusBuckets || []).map((item) => [
				item.status,
				item._count._all,
			]),
		);
		const fgoCountByStatus = new Map(
			fgoStatusBuckets.map((item) => [item.fgoStatus, item._count._all]),
		);

		const avizareWithDaysLeft = (
			avizareProjects as {
				id: string;
				code: string;
				title: string;
				phases: { title: string; endDate: Date; completed: boolean }[];
			}[]
		).map((project) => {
			const phase = project.phases?.[0];
			const daysLeft = phase?.endDate
				? Math.ceil(
						(new Date(phase.endDate).getTime() - Date.now()) /
							(1000 * 60 * 60 * 24),
					)
				: null;
			return { ...project, daysLeft };
		});

		return {
			delayedTasks,
			todaySchedule,
			clockedIn,
			pendingMaterialApprovals,
			unpaidInvoices,
			latestActivities,
			chartData,
			upcomingChecks,
			expiredChecks,
			totalInstallations,
			certifiedCount,
			maintenanceCount,
			offersDraft: offerCountByStatus.get("DRAFT") || 0,
			offersSent: offerCountByStatus.get("SENT") || 0,
			offersAccepted: offerCountByStatus.get("ACCEPTED") || 0,
			avizareProjects: avizareWithDaysLeft,
			activeProjects: projectCountByStatus.get("ACTIVE") || 0,
			plannedProjects: projectCountByStatus.get("PLANNED") || 0,
			blockedProjects: projectCountByStatus.get("BLOCKED") || 0,
			completedProjects: projectCountByStatus.get("COMPLETED") || 0,
			todoOrders: workOrderCountByStatus.get("TODO") || 0,
			inProgressOrders: workOrderCountByStatus.get("IN_PROGRESS") || 0,
			blockedOrders: workOrderCountByStatus.get("BLOCKED") || 0,
			overdueInvoices,
			fgoStats: {
				sent:
					(fgoCountByStatus.get(FgoInvoiceStatus.SENT_TO_ANAF) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.SIGNED) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.SUBMITTED_OK) || 0),
				pending:
					(fgoCountByStatus.get(FgoInvoiceStatus.DRAFT_UPLOADED) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.PENDING_VALIDATION) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.VALIDATION_OK) || 0),
				errors:
					(fgoCountByStatus.get(FgoInvoiceStatus.VALIDATION_ERRORS) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.SUBMITTED_ERRORS) || 0) +
					(fgoCountByStatus.get(FgoInvoiceStatus.REJECTED) || 0),
			},
		};
	}

	const d = await getDashboardData();
	const receivables =
		Number(d.unpaidInvoices._sum.totalAmount || 0) -
		Number(d.unpaidInvoices._sum.paidAmount || 0);

	return (
		<PermissionGuard resource="REPORTS" action="VIEW">
			<div className="page-stack">
				<PageHeader title="PANOU OPERATIONAL" subtitle={roleContext.subtitle} />
				<KpiStrip d={d as unknown as DashboardData} />
				<ActionQueue d={d as unknown as DashboardData} />
				<ChartAndActivitySection
					d={d as unknown as DashboardData}
					receivables={receivables}
				/>
				<PipelineSection d={d as unknown as DashboardData} />
				<PortfolioSection d={d as unknown as DashboardData} />
				<ScheduleSection d={d as unknown as DashboardData} />
			</div>
		</PermissionGuard>
	);
}
