import { Chip } from "@heroui/react";
import { cn } from "@/src/lib/utils";

const filledStyles: Record<string, string> = {
  success: "border border-[color-mix(in oklab,var(--success)_45%,transparent)] bg-[color-mix(in oklab,var(--success)_18%,transparent)] text-[color-mix(in oklab,var(--success)_75%,white_25%)]",
  warning: "border border-[color-mix(in oklab,var(--warning)_45%,transparent)] bg-[color-mix(in oklab,var(--warning)_18%,transparent)] text-[color-mix(in oklab,var(--warning)_75%,white_25%)]",
  danger: "border border-[color-mix(in oklab,var(--danger)_46%,transparent)] bg-[color-mix(in oklab,var(--danger)_18%,transparent)] text-[color-mix(in oklab,var(--danger)_75%,white_25%)]",
  neutral: "border border-[color-mix(in oklab,var(--muted-strong)_44%,transparent)] bg-[color-mix(in oklab,var(--muted-strong)_17%,transparent)] text-[color-mix(in oklab,var(--foreground)_75%,white_25%)]",
  info: "border border-[color-mix(in oklab,var(--info)_44%,transparent)] bg-[color-mix(in oklab,var(--info)_17%,transparent)] text-[color-mix(in oklab,var(--info)_75%,white_25%)]",
};

const outlineStyles: Record<string, string> = {
  success: "border border-[color-mix(in oklab,var(--success)_55%,transparent)] text-[color-mix(in oklab,var(--success)_80%,white_20%)]",
  warning: "border border-[color-mix(in oklab,var(--warning)_55%,transparent)] text-[color-mix(in oklab,var(--warning)_80%,white_20%)]",
  danger: "border border-[color-mix(in oklab,var(--danger)_56%,transparent)] text-[color-mix(in oklab,var(--danger)_80%,white_20%)]",
  neutral: "border border-[color-mix(in oklab,var(--muted-strong)_55%,transparent)] text-[color-mix(in oklab,var(--foreground)_80%,white_20%)]",
  info: "border border-[color-mix(in oklab,var(--info)_55%,transparent)] text-[color-mix(in oklab,var(--info)_80%,white_20%)]",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[9px]",
  md: "px-2.5 py-1 text-[10px]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  size = "md",
  outline,
}: {
  children: React.ReactNode;
  tone?: keyof typeof filledStyles;
  className?: string;
  size?: "sm" | "md";
  outline?: boolean;
}) {
  const styles = outline ? outlineStyles : filledStyles;
  return (
    <Chip
      variant="soft"
      className={cn(
        "inline-flex h-auto min-h-0 items-center rounded-full font-semibold uppercase tracking-[0.08em] leading-none",
        sizeStyles[size],
        outline
          ? "bg-transparent shadow-none"
          : "shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]",
        styles[tone],
        className,
      )}
    >
      {children}
    </Chip>
  );
}
