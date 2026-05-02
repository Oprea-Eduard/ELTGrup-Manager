import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

export function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{title}</p>
            {subtitle && <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="divide-y divide-[var(--border)]/50 px-5 py-2">{children}</div>
    </div>
  );
}

export function SectionCardSimple({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--shadow-panel)]", className)}>
      {title && (
        <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{title}</p>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
