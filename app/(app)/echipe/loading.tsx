import { Card } from "@/src/components/ui/card";

export default function OferteLoading() {
	return (
		<div className="page-stack">
			<div className="space-y-2">
				<div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--surface-2)]" />
				<div className="h-4 w-72 animate-pulse rounded bg-[var(--surface-2)]" />
			</div>
			<section className="page-kpis">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]"
					/>
				))}
			</section>
			<Card>
				<div className="space-y-3">
					<div className="h-11 animate-pulse rounded-lg bg-[var(--surface-2)]" />
					<div className="grid gap-3 md:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-11 animate-pulse rounded-lg bg-[var(--surface-2)]"
							/>
						))}
					</div>
				</div>
			</Card>
			<Card className="flush">
				<div className="space-y-2 p-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-12 animate-pulse rounded-lg bg-[var(--surface-2)]"
						/>
					))}
				</div>
			</Card>
		</div>
	);
}
