import { Card } from "@/src/components/ui/card";

export function DashboardSkeleton() {
	return (
		<div className="page-stack">
			<div className="h-10 w-72 shimmer rounded-xl bg-[var(--surface-card)]" />
			<div className="page-kpis">
				{Array.from({ length: 5 }, (_, i) => `kpi-${i}`).map((id) => (
					<div
						key={id}
						className="h-28 shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]"
					/>
				))}
			</div>
			<div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
				<div className="h-72 shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]" />
				<div className="h-72 shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]" />
			</div>
		</div>
	);
}

export function ListSkeleton({
	rows = 5,
	cols = 4,
}: {
	rows?: number;
	cols?: number;
}) {
	return (
		<div className="space-y-6">
			<div className="h-10 w-64 shimmer rounded-xl bg-[var(--surface-card)]" />
			<div
				className="grid gap-4"
				style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
			>
				{Array.from({ length: 4 }, (_, i) => `grid-${i}`).map((id) => (
					<div
						key={id}
						className="h-24 shimmer rounded-xl border border-[var(--border)] bg-[var(--surface-card)]"
					/>
				))}
			</div>
			<Card>
				<div className="space-y-3">
					{Array.from({ length: rows }, (_, i) => `row-${i}`).map((id) => (
						<div
							key={id}
							className="h-12 shimmer rounded-lg bg-[var(--surface-2)]"
						/>
					))}
				</div>
			</Card>
		</div>
	);
}

export function DetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="h-5 w-48 shimmer rounded-lg bg-[var(--surface-card)]" />
			<div className="h-16 w-full shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]" />
			<div className="grid gap-4 md:grid-cols-5">
				{Array.from({ length: 5 }, (_, i) => `detail-${i}`).map((id) => (
					<div
						key={id}
						className="h-24 shimmer rounded-xl border border-[var(--border)] bg-[var(--surface-card)]"
					/>
				))}
			</div>
			<div className="grid gap-4 xl:grid-cols-2">
				<div className="h-64 shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]" />
				<div className="h-64 shimmer rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]" />
			</div>
		</div>
	);
}
