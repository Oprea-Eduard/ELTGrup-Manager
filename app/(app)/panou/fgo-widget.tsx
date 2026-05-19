"use client";

export function FgoWidget({
	fgoStats,
}: {
	fgoStats: { sent: number; pending: number; errors: number };
}) {
	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
			<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3">
				eFACTURA FGO · ANAF
			</p>
			<div className="grid grid-cols-3 gap-2 mb-3">
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--success)]">
						{fgoStats.sent}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						TRANSMISE
					</p>
				</div>
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--text-primary)]">
						{fgoStats.pending}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						IN ASTEPTARE
					</p>
				</div>
				<div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-center">
					<p className="font-doto text-[24px] font-medium leading-none tracking-tight text-[var(--accent)]">
						{fgoStats.errors}
					</p>
					<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						ERORI
					</p>
				</div>
			</div>
		</div>
	);
}
