"use client";

import { Card } from "@/src/components/ui/card";

export function FgoSummaryCard({
	stats,
}: {
	stats: { sent: number; pending: number; errors: number };
}) {
	return (
		<Card>
			<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3">
				eFACTURA FGO · ANAF
			</p>
			<div className="grid grid-cols-3 gap-2 mb-3">
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--success)]">
						{stats.sent}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						TRANSMISE
					</p>
				</div>
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--text-primary)]">
						{stats.pending}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						IN CURS
					</p>
				</div>
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--accent)]">
						{stats.errors}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						ERORI
					</p>
				</div>
			</div>
		</Card>
	);
}
