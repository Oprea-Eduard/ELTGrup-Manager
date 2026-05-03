import { Card as HeroCard } from "@heroui/react";
import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

type Padding = "sm" | "md" | "lg";

const paddingMap: Record<Padding, string> = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  className,
  children,
  hoverable,
  padding = "md",
}: {
  className?: string;
  children: ReactNode;
  hoverable?: boolean;
  padding?: Padding;
}) {
  return (
    <HeroCard
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface-card)]",
        paddingMap[padding],
        hoverable && "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-float)]",
        className,
      )}
    >
      {children}
    </HeroCard>
  );
}
