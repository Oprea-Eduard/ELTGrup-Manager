import { memo } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export const KpiCard = memo(function KpiCard({
  label,
  value,
  helper,
  trend,
  loading,
  onClick,
}: {
  label: string;
  value: string;
  helper?: string;
  trend?: "up" | "down";
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-4",
        onClick && "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-float)]",
      )}
      {...(onClick ? { onClick, role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && onClick() } : {})}
    >
      <p className="text-[11px] font-medium text-[var(--muted)]">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-24" />
      ) : (
        <p className="mt-1.5 flex items-center gap-2 text-2xl font-semibold text-[var(--heading)] tabular-nums">
          {value}
          {trend === "up" && <span className="text-xs text-[var(--success)]">↑</span>}
          {trend === "down" && <span className="text-xs text-[var(--danger)]">↓</span>}
        </p>
      )}
      {helper ? (
        loading ? (
          <Skeleton className="mt-0.5 h-4 w-32" />
        ) : (
          <p className="mt-0.5 text-xs text-[var(--muted)]">{helper}</p>
        )
      ) : null}
    </div>
  );
});
