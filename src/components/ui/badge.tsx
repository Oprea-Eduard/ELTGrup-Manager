import { Chip } from "@heroui/react";
import { cn } from "@/src/lib/utils";

const styles: Record<string, string> = {
  success: "border border-[color-mix(in oklab,var(--success)_45%,transparent)] bg-[color-mix(in oklab,var(--success)_18%,transparent)] text-[color-mix(in oklab,var(--success)_75%,white_25%)]",
  warning: "border border-[color-mix(in oklab,var(--warning)_45%,transparent)] bg-[color-mix(in oklab,var(--warning)_18%,transparent)] text-[color-mix(in oklab,var(--warning)_75%,white_25%)]",
  danger: "border border-[color-mix(in oklab,var(--danger)_46%,transparent)] bg-[color-mix(in oklab,var(--danger)_18%,transparent)] text-[color-mix(in oklab,var(--danger)_75%,white_25%)]",
  neutral: "border border-[color-mix(in oklab,var(--muted-strong)_44%,transparent)] bg-[color-mix(in oklab,var(--muted-strong)_17%,transparent)] text-[color-mix(in oklab,var(--foreground)_75%,white_25%)]",
  info: "border border-[color-mix(in oklab,var(--info)_44%,transparent)] bg-[color-mix(in oklab,var(--info)_17%,transparent)] text-[color-mix(in oklab,var(--info)_75%,white_25%)]",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof styles; className?: string }) {
  return (
    <Chip
      variant="soft"
      className={cn(
        "h-auto min-h-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]",
        styles[tone],
        className,
      )}
    >
      {children}
    </Chip>
  );
}
