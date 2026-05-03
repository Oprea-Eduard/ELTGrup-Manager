"use client";

export function FgoWidget({ fgoStats }: { fgoStats: { sent: number; pending: number; errors: number } }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-4 mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
        eFactura FGO — ANAF
      </p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-emerald-400">{fgoStats.sent}</p>
          <p className="text-[10px] text-[var(--muted)]">Trimise</p>
        </div>
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-[var(--muted-strong)]">{fgoStats.pending}</p>
          <p className="text-[10px] text-[var(--muted)]">In asteptare</p>
        </div>
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-[var(--danger)]">{fgoStats.errors}</p>
          <p className="text-[10px] text-[var(--muted)]">Erori</p>
        </div>
      </div>
    </div>
  );
}
