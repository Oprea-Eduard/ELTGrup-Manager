"use client";

import { useSyncExternalStore } from "react";

function useMounted() {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

const dateFormatter = new Intl.DateTimeFormat("ro-RO");

export function OverdueAvizCount({
	phases,
}: {
	phases: Array<{ completed: boolean; endDate: Date | null }>;
}) {
	const mounted = useMounted();

	if (!mounted) return null;

	const overdueCount = phases.filter(
		(p) => !p.completed && p.endDate && new Date(p.endDate) < new Date(),
	).length;

	if (overdueCount === 0) return null;

	return (
		<p
			suppressHydrationWarning
			className="mt-1 text-[11px] text-[var(--danger)]"
		>
			⚠️ {overdueCount} faza/faze cu termen depasit
		</p>
	);
}

const phaseTypeLabel: Record<string, string> = {
	OFERTARE: "Ofertare",
	PROIECTARE: "Proiectare",
	AVIZ_ISU: "Aviz ISU",
	AVIZ_SSM: "Aviz SSM",
	AVIZ_POMPIERI: "Aviz Pompieri",
	EXECUTIE: "Executie",
	RECEPTIE_PSI: "Receptie PSI",
	MENTENANTA: "Mentenanta",
};

export function AvizPhaseItem({
	phase,
}: {
	phase: {
		id: string;
		type: string;
		title: string;
		completed: boolean;
		startDate: Date | null;
		endDate: Date | null;
	};
}) {
	const mounted = useMounted();

	const daysLeft =
		mounted && phase.endDate
			? Math.ceil(
					(new Date(phase.endDate).getTime() - Date.now()) /
						(1000 * 60 * 60 * 24),
				)
			: null;

	return (
		<div
			suppressHydrationWarning
			className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
				phase.completed
					? "border-[rgba(79,156,118,0.35)] bg-[rgba(79,156,118,0.08)]"
					: daysLeft !== null && daysLeft < 0
						? "border-[rgba(190,95,111,0.35)] bg-[rgba(190,95,111,0.08)]"
						: "border-[var(--border)] bg-[var(--surface-card)]"
			}`}
		>
			<div className="min-w-0">
				<p className="font-medium text-[var(--foreground)] text-sm">
					{phaseTypeLabel[phase.type] || phase.title}
				</p>
				{mounted && phase.startDate && phase.endDate ? (
					<p className="text-[11px] text-[var(--muted)]">
						{dateFormatter.format(phase.startDate)} →{" "}
						{dateFormatter.format(phase.endDate)}
					</p>
				) : null}
			</div>
			<span className="shrink-0 text-xs">
				{phase.completed ? (
					<span className="font-semibold text-[#bde7cf]">Finalizata</span>
				) : daysLeft !== null ? (
					<span
						className={
							daysLeft < 0
								? "font-semibold text-[var(--danger)]"
								: "text-[var(--muted)]"
						}
					>
						{daysLeft < 0
							? `Depasit ${Math.abs(daysLeft)} zile`
							: `${daysLeft} zile`}
					</span>
				) : (
					<span className="text-[var(--muted)]">In desfasurare</span>
				)}
			</span>
		</div>
	);
}
