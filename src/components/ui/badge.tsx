import { cn } from "@/src/lib/utils";

const filledStyles: Record<string, string> = {
  success: "border-[color-mix(in_oklab,var(--status-active)_40%,transparent)] bg-[color-mix(in_oklab,var(--status-active)_15%,transparent)] text-[color-mix(in_oklab,var(--status-active)_80%,white_20%)]",
  warning: "border-[color-mix(in_oklab,var(--status-pending)_40%,transparent)] bg-[color-mix(in_oklab,var(--status-pending)_15%,transparent)] text-[color-mix(in_oklab,var(--status-pending)_80%,white_20%)]",
  danger: "border-[color-mix(in_oklab,var(--status-blocked)_40%,transparent)] bg-[color-mix(in_oklab,var(--status-blocked)_15%,transparent)] text-[color-mix(in_oklab,var(--status-blocked)_80%,white_20%)]",
  neutral: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-strong)]",
  info: "border-[color-mix(in_oklab,var(--status-info)_40%,transparent)] bg-[color-mix(in_oklab,var(--status-info)_15%,transparent)] text-[color-mix(in_oklab,var(--status-info)_80%,white_20%)]",
};

const dotColors: Record<string, string> = {
  success: "bg-[var(--status-active)]",
  warning: "bg-[var(--status-pending)]",
  danger: "bg-[var(--status-blocked)]",
  neutral: "bg-[var(--muted)]",
  info: "bg-[var(--status-info)]",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[9px]",
  md: "px-2 py-0.5 text-[10px]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  size = "md",
  dot,
}: {
  children: React.ReactNode;
  tone?: keyof typeof filledStyles;
  className?: string;
  size?: "sm" | "md";
  /** Show as a dot + text instead of a pill */
  dot?: boolean;
}) {
  if (dot) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted-strong)]", className)}>
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColors[tone])} />
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.06em] leading-none",
        sizeStyles[size],
        filledStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
