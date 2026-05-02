import { memo } from "react";

export const KpiCard = memo(function KpiCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-4">
      <p className="text-[11px] font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-[var(--heading)] tabular-nums">{value}</p>
      {helper ? <p className="mt-0.5 text-xs text-[var(--muted)]">{helper}</p> : null}
    </div>
  );
});
