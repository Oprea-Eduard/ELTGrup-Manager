import {
	FgoInvoiceStatus,
	RoleKey,
	type WorkOrderStatus,
} from "@prisma/client";
import { AlertTriangle, ArrowRight, FileWarning, Package } from "lucide-react";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Card } from "@/src/components/ui/card";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { StatRow } from "@/src/components/ui/stat-row";
import { cn } from "@/src/lib/utils";
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
	SUPER_ADMIN: { subtitle: "CONTROL GLOBAL: RISC, MARJA, CASHFLOW SI BLOCAJE", focus: ["REVIZUIESTE ANALITICELE", "INTERVINE PE PROIECTE INTARZIATE"] },
	ADMINISTRATOR: { subtitle: "COORDONARE EXECUTIE: PROIECTE, ECHIPE, APROBARI", focus: ["CONFIRMA CERERILE MATERIALE", "VERIFICA LUCRARILE INTARZIATE"] },
	MAGAZIONER: { subtitle: "GESTIUNE INVENTAR: SCULE, MATERIALE, DEPOZIT", focus: ["VERIFICA CERERILE NOI", "INREGISTREAZA RETURURILE"] },
	PROJECT_MANAGER: { subtitle: "MANAGEMENT PROIECT: TERMENE, PROGRES, COSTURI", focus: ["COMPARA ORELE PONTATE CU ESTIMARILE", "URMARESTE BUGETUL"] },
	SITE_MANAGER: { subtitle: "EXECUTIE SANTIER: TASKURI, PONTAJ, BLOCAJE", focus: ["ACTUALIZEAZA RAPOARTELE", "ESCALADEAZA LUCRARILE BLOCATE"] },
	BACKOFFICE: { subtitle: "OPERATIUNI SUPORT: DOCUMENTE, TASKURI, MATERIALE", focus: ["ASIGURA COMPLETITUDINEA DOCUMENTELOR", "CURA CERERILE MATERIALE"] },
	ACCOUNTANT: { subtitle: "CONTROL FINANCIAR: COSTURI, FACTURARE, PLATI", focus: ["VERIFICA COSTURILE NOI", "URMARESTE FACTURILE SCADENTE"] },
	WORKER: { subtitle: "EXECUTIE PERSONALA: LUCRARI, PONTAJ, PROGRES", focus: ["PORNESTE/OPRESTE PONTAJUL", "TRIMITE UPDATE TEREN"] },
	CLIENT_VIEWER: { subtitle: "VIZIBILITATE CLIENT: PROGRES, DOCUMENTE, RAPOARTE", focus: ["CONSULTA TIMELINE-UL", "VERIFICA ULTIMELE RAPOARTE"] },
	SUBCONTRACTOR: { subtitle: "EXECUTIE SUBCONTRACTOR: TASKURI, LIVRABILE", focus: ["ACTUALIZEAZA TASKURILE", "INCADRCA DOVADA DE EXECUTIE"] },
};

const colorStyles = {
	amber: { bar: "bg-[var(--amber)]", text: "text-[var(--amber)]" },
	steel: { bar: "bg-[var(--steel)]", text: "text-[var(--steel)]" },
	red: { bar: "bg-[var(--red)]", text: "text-[var(--red)]" },
	green: { bar: "bg-[var(--green)]", text: "text-[var(--green)]" },
};

const progColor = (p: number) => p >= 85 ? colorStyles.red : p >= 65 ? colorStyles.amber : colorStyles.steel;
const budgetColor = (b: number) => b >= 90 ? colorStyles.red : b >= 75 ? colorStyles.amber : colorStyles.green;
const daysColor = (d: number) => d < 0 ? colorStyles.red : d < 15 ? colorStyles.amber : colorStyles.steel;
const daysLabel = (d: number) => d < 0 ? `+${Math.abs(d)} ZILE` : `${d} ZILE`;

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
	const receivables = Number(d.unpaidInvoices._sum.totalAmount || 0) - Number(d.unpaidInvoices._sum.paidAmount || 0);
	return (
		<section className="page-kpis">
			<KpiCard label="PROIECTE ACTIVE" value={String(d.activeProjects)} helper="↑ 2 FATA DE LUNA TRECUTA" severity="info" href="/proiecte" />
			<KpiCard label="MUNCITORI AZI" value={String(d.clockedIn)} helper="DIN 52 PLANIFICATI" severity="active" href="/pontaj" />
			<KpiCard label="CERERI PENDING" value={String(d.pendingMaterialApprovals)} helper="3 URGENTE · 5 NORMALE" severity="pending" href="/materiale" />
			<KpiCard label="PONTAJ AZI" value={`${d.clockedIn}`} helper="44 / 47 RAPORTAT" severity="active" />
		</section>
	);
}

function ActionQueueSection({ d }: { d: DashboardData }) {
	if (d.delayedTasks <= 0 && d.pendingMaterialApprovals <= 0 && (!d.overdueInvoices || (d.overdueInvoices as unknown[]).length <= 0)) return null;
	const items = [
		d.delayedTasks > 0 && { icon: AlertTriangle, color: "var(--red)", label: `${d.delayedTasks} LUCRARI DEPASESC TERMENUL`, href: "/lucrari" },
		d.pendingMaterialApprovals > 0 && { icon: Package, color: "var(--amber)", label: `${d.pendingMaterialApprovals} CERERI MATERIALE DE APROBAT`, href: "/materiale" },
		d.overdueInvoices && (d.overdueInvoices as unknown[]).length > 0 && { icon: FileWarning, color: "var(--red)", label: `${(d.overdueInvoices as unknown[]).length} FACTURI RESTANTE`, href: "/financiar" },
	].filter(Boolean);

	return (
		<div className="flex items-center gap-2 border border-[var(--ad)] bg-[var(--ab)] px-3 py-2 text-[9px] font-bold tracking-[0.5px] text-[var(--amber)]">
			<span className="blink">◆</span>
			<span className="flex-1">{items.map((i: any) => i.label).join(" · ")}</span>
			<span className="text-[8px] opacity-70 tracking-[1px]">VIZUALIZEAZA →</span>
		</div>
	);
}

const SAMPLE_PROJECTS = [
	{ id: "P-001", name: "Bloc C4 Timișoara", status: "active", prog: 72, workers: 14, budget: 85, days: 23, crit: false },
	{ id: "P-002", name: "Hală Industrială Arad", status: "active", prog: 41, workers: 8, budget: 52, days: 47, crit: false },
	{ id: "P-003", name: "Ansamblu Rezidențial Cluj", status: "active", prog: 88, workers: 22, budget: 91, days: 8, crit: true },
	{ id: "P-004", name: "Depozit Logistic Ploiești", status: "delayed", prog: 34, workers: 6, budget: 67, days: -5, crit: false },
];

const SAMPLE_ACTIVITY = [
	{ time: "14:38", type: "pontaj", msg: "Pontaj trimis — Echipa 3, P-003", user: "I.M." },
	{ time: "14:22", type: "material", msg: "Cerere materiale aprobată — P-001", user: "E.O." },
	{ time: "13:55", type: "raport", msg: "Raport teren încărcat — P-002", user: "C.B." },
	{ time: "13:41", type: "alert", msg: "Buget depășit 91% — P-003", user: "SYS" },
	{ time: "12:30", type: "pontaj", msg: "Pontaj trimis — Echipa 1, P-001", user: "A.P." },
];

const activityDot: Record<string, string> = {
	pontaj: "bg-[var(--steel)]",
	material: "bg-[var(--amber)]",
	raport: "bg-[var(--green)]",
	alert: "bg-[var(--red)]",
};

function ProjectsSection() {
	return (
		<div className="border border-[var(--b1)] bg-[var(--s1)]">
			<div className="flex items-center justify-between border-b border-[var(--b1)] px-3 py-2 sm:px-4">
				<span className="text-[8px] font-bold tracking-[2px] text-[var(--t2)]">
					PROIECTE IN EXECUTIE
				</span>
				<span className="font-mono text-[9px] text-[var(--t3)]">
					{SAMPLE_PROJECTS.length} PROIECTE
				</span>
			</div>
			{SAMPLE_PROJECTS.map((p) => (
				<div key={p.id} className="border-b border-[var(--b1)] px-3 py-2 last:border-b-0 sm:px-4">
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[9px] text-[var(--t3)] min-w-[32px]">{p.id}</span>
						<span className="flex-1 text-[12px] font-semibold text-[var(--t)]">{p.name}</span>
						{p.crit && <span className="border border-[var(--ad)] bg-[var(--ab)] px-1 py-[1px] text-[7px] font-bold tracking-[1px] text-[var(--amber)]">CRITIC</span>}
						<span className={cn("border px-1 py-[1px] text-[7px] font-bold tracking-[1px]", p.status === "delayed" ? "border-[var(--rb)] bg-[var(--rb)] text-[var(--red)]" : "border-[var(--gb)] bg-[var(--gb)] text-[var(--green)]")}>
							{p.status === "delayed" ? "INTARZIAT" : "ACTIV"}
						</span>
					</div>
					<div className="mt-1 flex items-center gap-2">
						<div className="flex-1 h-[2px] bg-[var(--b1)]">
							<div className="h-full" style={{ width: `${p.prog}%`, background: progColor(p.prog).bar.replace("bg-", "") }} />
						</div>
						<span className={cn("font-mono text-[9px]", progColor(p.prog).text)}>{p.prog}%</span>
					</div>
					<div className="mt-1 flex gap-3 text-[9px] text-[var(--t3)]">
						<span>MUNCITORI <em className="not-italic text-[var(--t2)] font-mono">{p.workers}</em></span>
						<span>BUGET <em className={cn("not-italic font-mono", budgetColor(p.budget).text)}>{p.budget}%</em></span>
						<span>TERMEN <em className={cn("not-italic font-mono", daysColor(p.days).text)}>{daysLabel(p.days)}</em></span>
					</div>
				</div>
			))}
		</div>
	);
}

function ActivitySection() {
	return (
		<div className="border border-[var(--b1)] bg-[var(--s1)]">
			<div className="flex items-center justify-between border-b border-[var(--b1)] px-3 py-2 sm:px-4">
				<span className="flex items-center gap-1 text-[8px] font-bold tracking-[2px] text-[var(--t2)]">
					<span className="inline-block size-[5px] rounded-full bg-[var(--green)] blink" />
					ACTIVITATE RECENTA
				</span>
				<span className="text-[8px] tracking-[1px] text-[var(--green)]">LIVE</span>
			</div>
			{SAMPLE_ACTIVITY.map((a, i) => (
				<div key={i} className="flex items-start gap-2 border-b border-[var(--b1)] px-3 py-2 last:border-b-0 sm:px-4">
					<span className="font-mono text-[8px] text-[var(--t3)] w-[30px] shrink-0 pt-[2px]">{a.time}</span>
					<div className={cn("mt-[3px] size-[4px] shrink-0 rounded-full", activityDot[a.type] || "bg-[var(--t3)]")} />
					<span className="flex-1 text-[10px] leading-[1.4] text-[var(--t2)]">{a.msg}</span>
					<span className="font-mono text-[8px] text-[var(--t3)] shrink-0">{a.user}</span>
				</div>
			))}
		</div>
	);
}

function DashboardContent() {
	return (
		<div className="flex flex-col gap-3">
			<section className="grid grid-cols-1 gap-3 xl:grid-cols-[3fr_2fr]">
				<ProjectsSection />
				<ActivitySection />
			</section>
		</div>
	);
}

export default async function DashboardPage() {
	const session = await auth();
	const scope = session?.user
		? await resolveAccessScope({ id: session.user.id, email: session.user.email, roleKeys: session.user.roleKeys || [] })
		: { projectIds: null, teamId: null };
	const userContext = session?.user
		? { id: session.user.id, email: session.user.email, roleKeys: session.user.roleKeys || [] }
		: { id: "", email: null, roleKeys: [] };
	const scopedProjectWhere = scope.projectIds === null ? {} : { id: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } };
	const scopedProjectIdWhere = scope.projectIds === null ? {} : { projectId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } };
	const scopedWorkOrderWhere = { ...workOrderScopeWhere(userContext, scope), deletedAt: null };
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const primaryRole = getPrimaryRole(userContext.roleKeys);
	const roleContext = roleExperience[primaryRole];

	if (primaryRole === RoleKey.CLIENT_VIEWER) return <ClientViewerDashboard userContext={userContext} scope={scope} />;

	const now = new Date();
	const in7Days = new Date();
	in7Days.setDate(now.getDate() + 7);

	async function getDashboardData() {
		const scopedWorkOrderIds = scope.projectIds === null ? null : scope.projectIds.length === 0 ? [] : (await prisma.workOrder.findMany({ where: scopedWorkOrderWhere, select: { id: true }, orderBy: { id: "asc" }, take: 250 })).map((item) => item.id);

		const [installationAlerts, upcomingChecks, expiredChecks, offerBuckets, avizareProjects, delayedTasks, todaySchedule, clockedIn, pendingMaterialApprovals, unpaidInvoices, latestActivities, weeklyHours, projectStatusBuckets, workOrderStatusBuckets, overdueInvoices, fgoStatusBuckets] = await Promise.all([
			prisma.projectInstallation.groupBy({ by: ["status"], where: { deletedAt: null, project: { ...scopedProjectWhere, deletedAt: null } }, _count: { _all: true } }),
			prisma.projectInstallation.findMany({ where: { deletedAt: null, nextCheckAt: { gte: now, lte: in7Days }, project: { ...scopedProjectWhere, deletedAt: null } }, select: { id: true, name: true, nextCheckAt: true, status: true, project: { select: { id: true, code: true, title: true } } }, orderBy: { nextCheckAt: "asc" }, take: 5 }),
			prisma.projectInstallation.count({ where: { deletedAt: null, nextCheckAt: { lt: now }, project: { ...scopedProjectWhere, deletedAt: null } } }),
			prisma.offer.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
			prisma.project.findMany({ where: { deletedAt: null, ...scopedProjectWhere, phases: { some: { type: "AVIZ_ISU", completed: false } } }, select: { id: true, code: true, title: true, phases: { where: { type: "AVIZ_ISU" }, select: { title: true, endDate: true, completed: true }, orderBy: { position: "asc" }, take: 1 } }, take: 5 }),
			prisma.workOrder.count({ where: { ...scopedWorkOrderWhere, dueDate: { lt: new Date() }, status: { notIn: ["DONE", "CANCELED"] } } }),
			prisma.workOrder.findMany({ where: { ...scopedWorkOrderWhere, startDate: { gte: startOfToday } }, select: { id: true, title: true, startDate: true, status: true, description: true, project: { select: { title: true } }, team: { select: { name: true } } }, orderBy: [{ startDate: "asc" }, { id: "asc" }], take: 10 }),
			prisma.timeEntry.count({ where: { ...scopedProjectIdWhere, endAt: null } }),
			prisma.materialRequest.count({ where: { ...scopedProjectIdWhere, status: "PENDING" } }),
			prisma.invoice.aggregate({ where: { ...scopedProjectIdWhere, status: { in: ["SENT", "OVERDUE", "PARTIAL_PAID"] } }, _sum: { totalAmount: true, paidAmount: true } }),
			prisma.activityLog.findMany({ where: scope.projectIds === null ? undefined : { OR: [{ entityType: "PROJECT", entityId: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] } }, { entityType: "WORK_ORDER", entityId: { in: scopedWorkOrderIds?.length ? scopedWorkOrderIds : ["__none__"] } }] }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, user: { select: { firstName: true, lastName: true } } }, take: 8 }),
			prisma.timeEntry.groupBy({ by: ["projectId"], where: scopedProjectIdWhere, _sum: { durationMinutes: true }, orderBy: [{ _sum: { durationMinutes: "desc" } }, { projectId: "asc" }], take: 6 }),
			prisma.project.groupBy({ by: ["status"], where: { deletedAt: null, ...scopedProjectWhere }, _count: { _all: true } }),
			prisma.workOrder.groupBy({ by: ["status"], where: scopedWorkOrderWhere, _count: { _all: true } }),
			prisma.invoice.findMany({ where: { ...scopedProjectIdWhere, status: "OVERDUE" }, select: { id: true, invoiceNumber: true, totalAmount: true, paidAmount: true, dueDate: true, status: true, project: { select: { id: true, code: true, title: true } } }, orderBy: { dueDate: "asc" }, take: 5 }),
			prisma.invoice.groupBy({ by: ["fgoStatus"], where: { ...scopedProjectIdWhere, fgoStatus: { not: null } }, _count: { _all: true } }),
		]);

		const totalInstallations = installationAlerts.reduce((acc, i) => acc + i._count._all, 0);
		const certifiedCount = installationAlerts.find((i) => i.status === "CERTIFIED")?._count._all ?? 0;
		const maintenanceCount = installationAlerts.find((i) => i.status === "UNDER_MAINTENANCE")?._count._all ?? 0;
		const projectsById = weeklyHours.length === 0 ? [] : await prisma.project.findMany({ where: { deletedAt: null, AND: [{ id: { in: weeklyHours.map((h) => h.projectId) } }, scopedProjectWhere] }, select: { id: true, title: true } });
		const projectNameById = new Map(projectsById.map((p) => [p.id, p.title] as const));
		const chartData = weeklyHours.map((h) => ({ name: (projectNameById.get(h.projectId) || "PROIECT").slice(0, 18), ore: Math.round((h._sum.durationMinutes || 0) / 60) }));
		const offerCountByStatus = new Map(offerBuckets.map((item) => [item.status, item._count._all]));
		const projectCountByStatus = new Map(projectStatusBuckets.map((item) => [item.status, item._count._all]));
		const workOrderCountByStatus = new Map((workOrderStatusBuckets || []).map((item) => [item.status, item._count._all]));
		const fgoCountByStatus = new Map(fgoStatusBuckets.map((item) => [item.fgoStatus, item._count._all]));

		const avizareWithDaysLeft = (avizareProjects as { id: string; code: string; title: string; phases: { title: string; endDate: Date; completed: boolean }[] }[]).map((project) => {
			const phase = project.phases?.[0];
			const daysLeft = phase?.endDate ? Math.ceil((new Date(phase.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
			return { ...project, daysLeft };
		});

		return {
			delayedTasks, todaySchedule, clockedIn, pendingMaterialApprovals, unpaidInvoices, latestActivities, chartData,
			upcomingChecks, expiredChecks, totalInstallations, certifiedCount, maintenanceCount,
			offersDraft: offerCountByStatus.get("DRAFT") || 0, offersSent: offerCountByStatus.get("SENT") || 0, offersAccepted: offerCountByStatus.get("ACCEPTED") || 0,
			avizareProjects: avizareWithDaysLeft,
			activeProjects: projectCountByStatus.get("ACTIVE") || 0, plannedProjects: projectCountByStatus.get("PLANNED") || 0,
			blockedProjects: projectCountByStatus.get("BLOCKED") || 0, completedProjects: projectCountByStatus.get("COMPLETED") || 0,
			todoOrders: workOrderCountByStatus.get("TODO") || 0, inProgressOrders: workOrderCountByStatus.get("IN_PROGRESS") || 0,
			blockedOrders: workOrderCountByStatus.get("BLOCKED") || 0, overdueInvoices,
			fgoStats: { sent: (fgoCountByStatus.get(FgoInvoiceStatus.SENT_TO_ANAF) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.SIGNED) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.SUBMITTED_OK) || 0), pending: (fgoCountByStatus.get(FgoInvoiceStatus.DRAFT_UPLOADED) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.PENDING_VALIDATION) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.VALIDATION_OK) || 0), errors: (fgoCountByStatus.get(FgoInvoiceStatus.VALIDATION_ERRORS) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.SUBMITTED_ERRORS) || 0) + (fgoCountByStatus.get(FgoInvoiceStatus.REJECTED) || 0) },
		};
	}

	const d = await getDashboardData();
	const receivables = Number(d.unpaidInvoices._sum.totalAmount || 0) - Number(d.unpaidInvoices._sum.paidAmount || 0);

	return (
		<PermissionGuard resource="REPORTS" action="VIEW">
			<div className="flex flex-col gap-3">
				<PageHeader title="PANOU OPERATIONAL" subtitle={roleContext.subtitle} />
				<KpiStrip d={d as unknown as DashboardData} />
				<ActionQueueSection d={d as unknown as DashboardData} />
				<DashboardContent />
			</div>
		</PermissionGuard>
	);
}
