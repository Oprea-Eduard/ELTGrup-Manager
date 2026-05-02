import { Card as HeroCard } from "@heroui/react";
import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <HeroCard
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </HeroCard>
  );
}
