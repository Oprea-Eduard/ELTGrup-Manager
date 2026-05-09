import { memo } from "react";
import Link from "next/link";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export const KpiCard = memo(function KpiCard({
  label,
  value,
  helper,
  trend,
  severity,
  href,
  loading,
  onClick,
}: {
  label: string;
  value: string;
  helper?: string;
  trend?: "up" | "down";
  severity?: "active" | "blocked" | "pending" | "done" | "info";
  href?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const severityRail: Record<string, string> = {
    active: "border-l-[var(--status-active)]",
    blocked: "border-l-[var(--status-blocked)]",
    pending: "border-l-[var(--status-pending)]",
    done: "border-l-[var(--status-done)]",
    info: "border-l-[var(--status-info)]",
  };

  const content = (
    <>
      <p className="text-[11px] font-medium tracking-wide text-[var(--muted)]">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-[var(--heading)] tabular-nums leading-none">
          {value}
          {trend === "up" && <span className="text-xs font-medium text-[var(--status-active)]">↑</span>}
          {trend === "down" && <span className="text-xs font-medium text-[var(--status-blocked)]">↓</span>}
        </p>
      )}
      {helper ? (
        loading ? (
          <Skeleton className="mt-1.5 h-3.5 w-28" />
        ) : (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{helper}</p>
        )
      ) : null}
    </>
  );

  const classes = cn(
    "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)] p-4",
    severity && `border-l-[3px] ${severityRail[severity]}`,
    (onClick || href) && "cursor-pointer transition-colors hover:bg-[var(--surface-2)]",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={classes}
      {...(onClick ? { onClick, role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && onClick() } : {})}
    >
      {content}
    </div>
  );
});
