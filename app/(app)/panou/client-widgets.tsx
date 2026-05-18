"use client";

import type { WorkOrderStatus } from "@prisma/client";
import {
	AlertTriangle,
	ArrowRight,
	BarChart3,
	ClipboardCheck,
	Clock,
	Construction,
	FileText,
	FileWarning,
	Hammer,
	HardHat,
	Package,
	Users,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const timeFormatter = new Intl.DateTimeFormat("ro-RO", {
	hour: "2-digit",
	minute: "2-digit",
});

import { DashboardScheduleTable } from "@/src/components/dashboard/schedule-table";
import { formatDate } from "@/src/lib/utils";

/* ── Quick Actions Bar ── */

const quickActions: Record<
	string,
	{ label: string; href: string; icon: React.ReactNode }
> = {
	view_projects: {
		label: "Proiecte active",
		href: "/proiecte",
		icon: <Construction className="size-4" />,
	},
	view_delayed: {
		label: "Lucrari intarziate",
		href: "/lucrari",
		icon: <AlertTriangle className="size-4" />,
	},
	view_materials: {
		label: "Cereri materiale",
		href: "/materiale",
		icon: <Package className="size-4" />,
	},
	view_finance: {
		label: "Facturi restante",
		href: "/financiar",
		icon: <FileWarning className="size-4" />,
	},
	view_offers: {
		label: "Oferte pipeline",
		href: "/oferte",
		icon: <BarChart3 className="size-4" />,
	},
	view_pontaj: {
		label: "Pontaj activ",
		href: "/pontaj",
		icon: <Clock className="size-4" />,
	},
	view_rapoarte: {
		label: "Rapoarte teren",
		href: "/rapoarte-zilnice",
		icon: <FileText className="size-4" />,
	},
	view_echipe: {
		label: "Echipe",
		href: "/echipe",
		icon: <Users className="size-4" />,
	},
	view_subcontractori: {
		label: "Subcontractori",
		href: "/subcontractori",
		icon: <HardHat className="size-4" />,
	},
	view_analytics: {
		label: "Analitice",
		href: "/analitice",
		icon: <BarChart3 className="size-4" />,
	},
};

const roleActionKeys: Record<string, string[]> = {
	SUPER_ADMIN: ["view_analytics", "view_delayed", "view_finance"],
	ADMINISTRATOR: ["view_projects", "view_materials", "view_delayed"],
	MAGAZIONER: ["view_materials", "view_echipe"],
	PROJECT_MANAGER: ["view_projects", "view_delayed", "view_finance"],
	SITE_MANAGER: ["view_pontaj", "view_rapoarte", "view_delayed"],
	BACKOFFICE: ["view_materials", "view_offers", "view_rapoarte"],
	ACCOUNTANT: ["view_finance", "view_offers", "view_analytics"],
	WORKER: ["view_pontaj", "view_rapoarte"],
	SUBCONTRACTOR: ["view_rapoarte", "view_subcontractori"],
};

export function QuickActionsBar({ roleKeys }: { roleKeys: string[] }) {
	const primary = roleKeys.find((k) => roleActionKeys[k]) || "WORKER";
	const actions = (roleActionKeys[primary] || []).map(
		(key) => quickActions[key],
	);

	if (actions.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{actions.map((action) => (
				<Link
					key={action.href}
					href={action.href}
					className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--surface-2)]"
				>
					{action.icon}
					{action.label}
					<ArrowRight className="size-3 text-[var(--muted)]" />
				</Link>
			))}
		</div>
	);
}

/* ── Schedule Tabs ── */

type ScheduleItem = {
	id: string;
	title: string;
	startLabel: string;
	projectTitle: string;
	teamName: string;
	status: WorkOrderStatus;
	description: string;
	startDate: string;
};

export function ScheduleWithTabs({ items }: { items: ScheduleItem[] }) {
	const [tab, setTab] = useState<"today" | "tomorrow" | "week">("today");

	const filtered = useMemo(() => {
		const now = new Date();
		const todayStr = now.toISOString().split("T")[0];
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toISOString().split("T")[0];

		return items.filter((item) => {
			const date = item.startDate.split("T")[0];
			if (tab === "today") return date === todayStr;
			if (tab === "tomorrow") return date === tomorrowStr;
			return true;
		});
	}, [items, tab]);

	const tabs = [
		{ key: "today" as const, label: "Astazi" },
		{ key: "tomorrow" as const, label: "Maine" },
		{ key: "week" as const, label: "Saptamana" },
	];

	return (
		<div>
			<div className="mb-3 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
				{tabs.map((t) => (
					<button
						key={t.key}
						type="button"
						onClick={() => setTab(t.key)}
						className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
							tab === t.key
								? "bg-[var(--accent)] text-white shadow-sm"
								: "text-[var(--muted-strong)] hover:text-[var(--foreground)]"
						}`}
					>
						{t.label}
						{tab === t.key && (
							<span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">
								{filtered.length}
							</span>
						)}
					</button>
				))}
			</div>
			<DashboardScheduleTable items={filtered} />
		</div>
	);
}

/* ── Worker Presence Card ── */

type WorkerEntry = {
	id: string;
	startAt: Date;
	user: { firstName: string; lastName: string } | null;
	project: { id: string; title: string };
};

export function WorkerPresenceCard({ entries }: { entries: WorkerEntry[] }) {
	if (entries.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-center text-sm text-[var(--muted)]">
				Niciun membru nu este pontat acum.
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 text-xs text-[var(--muted-strong)]">
				<Clock className="size-3.5 text-[var(--status-active)]" />
				<span className="font-semibold">{entries.length} membri activi</span>
			</div>
			<div className="space-y-1.5">
				{entries.slice(0, 8).map((entry) => (
					<div
						key={entry.id}
						className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2"
					>
						<div className="flex items-center gap-2 min-w-0">
							<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-strong)] text-[10px] font-bold text-white">
								{entry.user
									? `${entry.user.firstName[0]}${entry.user.lastName[0]}`
									: "??"}
							</span>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-[var(--foreground)]">
									{entry.user
										? `${entry.user.firstName} ${entry.user.lastName}`
										: "Utilizator"}
								</p>
								<p className="truncate text-[11px] text-[var(--muted)]">
									{entry.project.title}
								</p>
							</div>
						</div>
						<span className="shrink-0 text-[10px] text-[var(--muted)]">
							{timeFormatter.format(entry.startAt)}
						</span>
					</div>
				))}
			</div>
			{entries.length > 8 && (
				<p className="text-center text-[11px] text-[var(--muted)]">
					+{entries.length - 8} alti membri
				</p>
			)}
		</div>
	);
}

/* ── Enhanced Activity Feed ── */

type ActivityItem = {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	createdAt: Date;
	user: { firstName: string; lastName: string } | null;
};

const entityColors: Record<string, string> = {
	PROJECT: "border-[var(--status-active)]",
	WORK_ORDER: "border-[var(--status-pending)]",
	INVOICE: "border-[var(--status-info)]",
	OFFER: "border-[var(--accent-strong)]",
	MATERIAL_REQUEST: "border-[var(--status-blocked)]",
	TIME_ENTRY: "border-[var(--status-done)]",
	DAILY_REPORT: "border-[#6a93c6]",
};

const entityIcons: Record<string, React.ReactNode> = {
	PROJECT: <Construction className="size-3.5" />,
	WORK_ORDER: <Wrench className="size-3.5" />,
	INVOICE: <FileWarning className="size-3.5" />,
	OFFER: <FileText className="size-3.5" />,
	MATERIAL_REQUEST: <Package className="size-3.5" />,
	TIME_ENTRY: <Clock className="size-3.5" />,
	DAILY_REPORT: <ClipboardCheck className="size-3.5" />,
};

export function EnhancedActivityFeed({
	activities,
}: {
	activities: ActivityItem[];
}) {
	if (activities.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-center text-sm text-[var(--muted)]">
				Nicio activitate recenta.
				<br />
				<Link
					href="/proiecte"
					className="mt-1 inline-block text-[var(--accent)] hover:underline"
				>
					Incepe prin a crea un proiect →
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{activities.map((log) => {
				const color = entityColors[log.entityType] || "border-[var(--border)]";
				const icon = entityIcons[log.entityType];

				return (
					<div
						key={log.id}
						className={`border-l-2 ${color} pl-3 transition hover:pl-4`}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<div className="flex items-center gap-1.5">
									{icon && (
										<span className="shrink-0 text-[var(--muted-strong)]">
											{icon}
										</span>
									)}
									<p className="truncate text-sm font-medium text-[var(--foreground)]">
										{log.action}
									</p>
								</div>
								<p className="mt-0.5 text-xs text-[var(--muted)]">
									{log.user
										? `${log.user.firstName} ${log.user.lastName}`
										: "Sistem"}{" "}
									· {log.entityType}
								</p>
							</div>
							<span className="shrink-0 text-[11px] text-[var(--muted)]">
								{formatDate(log.createdAt)}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/* ── Installation Alerts Card ── */

export function InstallationAlertsCard({
	total,
	certified,
	maintenance,
	expired,
	upcoming,
}: {
	total: number;
	certified: number;
	maintenance: number;
	expired: number;
	upcoming: { id: string; name: string; nextCheckAt: Date; status: string }[];
}) {
	if (total === 0) {
		return null;
	}

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold text-[var(--muted-strong)]">
					Instalatii si verificari
				</p>
				<span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
					{total} total
				</span>
			</div>
			<div className="mt-3 grid grid-cols-2 gap-2">
				<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 text-center">
					<p className="text-sm font-semibold text-emerald-400">{certified}</p>
					<p className="text-[10px] text-[var(--muted)]">Certificate</p>
				</div>
				<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 text-center">
					<p className="text-sm font-semibold text-[var(--status-info)]">
						{maintenance}
					</p>
					<p className="text-[10px] text-[var(--muted)]">In mentenanta</p>
				</div>
			</div>
			{expired > 0 && (
				<p className="mt-2 flex items-center gap-1 rounded-lg border border-[rgba(232,102,120,0.3)] bg-[rgba(232,102,120,0.08)] px-2 py-1.5 text-[11px] font-medium text-[var(--danger)]">
					<AlertTriangle className="size-3 shrink-0" />
					{expired} verificari expirate
				</p>
			)}
			{upcoming.length > 0 && (
				<div className="mt-2 space-y-1">
					<p className="text-[10px] font-medium text-[var(--muted)]">
						Urmatoarele verificari:
					</p>
					{upcoming.map((inst) => (
						<div
							key={inst.id}
							className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1"
						>
							<span className="truncate text-[11px] text-[var(--foreground)]">
								{inst.name}
							</span>
							<span className="shrink-0 text-[10px] text-[var(--muted)]">
								{formatDate(inst.nextCheckAt)}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ── Phase Tracker Card ── */

const phaseTypeMeta: Record<
	string,
	{ label: string; color: string; icon: React.ReactNode }
> = {
	OFERTARE: {
		label: "Ofertare",
		color: "border-l-[var(--status-info)]",
		icon: <FileText className="size-3.5" />,
	},
	PROIECTARE: {
		label: "Proiectare",
		color: "border-l-[var(--accent-strong)]",
		icon: <Hammer className="size-3.5" />,
	},
	AVIZ_ISU: {
		label: "Aviz ISU",
		color: "border-l-[var(--status-blocked)]",
		icon: <AlertTriangle className="size-3.5" />,
	},
	AVIZ_SSM: {
		label: "Aviz SSM",
		color: "border-l-[var(--status-pending)]",
		icon: <HardHat className="size-3.5" />,
	},
	AVIZ_POMPIERI: {
		label: "Aviz Pompieri",
		color: "border-l-[var(--status-blocked)]",
		icon: <AlertTriangle className="size-3.5" />,
	},
	EXECUTIE: {
		label: "Executie",
		color: "border-l-[var(--status-active)]",
		icon: <Construction className="size-3.5" />,
	},
	RECEPTIE_PSI: {
		label: "Receptie PSI",
		color: "border-l-[var(--status-done)]",
		icon: <ClipboardCheck className="size-3.5" />,
	},
	MENTENANTA: {
		label: "Mentenanta",
		color: "border-l-[var(--status-info)]",
		icon: <Wrench className="size-3.5" />,
	},
};

export function PhaseTrackerCard({
	phaseBuckets,
}: {
	phaseBuckets: { type: string; count: number }[];
}) {
	const sorted = phaseBuckets.toSorted((a, b) => {
		const order = Object.keys(phaseTypeMeta);
		return order.indexOf(a.type) - order.indexOf(b.type);
	});

	if (sorted.length === 0) {
		return (
			<p className="text-sm text-[var(--muted)]">
				Toate fazele sunt finalizate.{" "}
				<Link href="/proiecte" className="text-[var(--accent)] hover:underline">
					Vezi proiectele →
				</Link>
			</p>
		);
	}

	return (
		<div className="space-y-1.5">
			{sorted.map((bucket) => {
				const meta = phaseTypeMeta[bucket.type] || {
					label: bucket.type,
					color: "border-l-[var(--border)]",
					icon: null,
				};
				return (
					<Link
						key={bucket.type}
						href={`/proiecte`}
						className={`flex items-center justify-between rounded-lg border border-[var(--border)] border-l-[3px] bg-[var(--surface-2)] px-3 py-2 transition hover:bg-[var(--surface-1)] ${meta.color}`}
					>
						<div className="flex items-center gap-2 min-w-0">
							{meta.icon && (
								<span className="shrink-0 text-[var(--muted-strong)]">
									{meta.icon}
								</span>
							)}
							<span className="text-sm text-[var(--foreground)]">
								{meta.label}
							</span>
						</div>
						<span className="shrink-0 rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-strong)]">
							{bucket.count}
						</span>
					</Link>
				);
			})}
		</div>
	);
}

/* ── Weekly Summary Banner ── */

export function WeeklySummaryBanner({
	activeProjects,
	weekTaskCount,
	overdueInvoices,
	pendingMaterials,
}: {
	activeProjects: number;
	weekTaskCount: number;
	overdueInvoices: number;
	pendingMaterials: number;
}) {
	const now = new Date();
	const weekStart = new Date(now);
	const dow = now.getDay();
	weekStart.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow));
	const weekNum = Math.ceil(
		((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) /
			(24 * 60 * 60 * 1000) +
			1) /
			7,
	);

	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-xs">
			<span className="font-semibold text-[var(--muted-strong)]">
				Saptamana {weekNum}
			</span>
			<span className="text-[var(--muted)]">
				<strong className="text-[var(--foreground)]">{activeProjects}</strong>{" "}
				proiecte active
			</span>
			<span className="text-[var(--muted)]">
				<strong className="text-[var(--foreground)]">{weekTaskCount}</strong>{" "}
				lucrari programate
			</span>
			{overdueInvoices > 0 && (
				<span className="text-[var(--status-blocked)]">
					<strong>{overdueInvoices}</strong> facturi restante
				</span>
			)}
			{pendingMaterials > 0 && (
				<span className="text-[var(--status-pending)]">
					<strong>{pendingMaterials}</strong> cereri materiale
				</span>
			)}
		</div>
	);
}
