"use client";

import { Card } from "@/src/components/ui/card";

export function FgoSummaryCard({
  stats,
}: {
  stats: { sent: number; pending: number; errors: number };
}) {
  return (
    <Card>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
        eFactura FGO — ANAF
      </p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-emerald-400">{stats.sent}</p>
          <p className="text-[10px] text-[var(--muted)]">Transmise</p>
        </div>
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-[var(--muted-strong)]">{stats.pending}</p>
          <p className="text-[10px] text-[var(--muted)]">In curs</p>
        </div>
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] p-2 text-center">
          <p className="text-lg font-semibold text-[var(--danger)]">{stats.errors}</p>
          <p className="text-[10px] text-[var(--muted)]">Erori</p>
        </div>
      </div>
    </Card>
  );
}
