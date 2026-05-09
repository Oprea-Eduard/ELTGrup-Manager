import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
  /** Colored left border for category identification */
  rail?: "project" | "task" | "finance" | "material" | "alert";
  /** Remove padding (for flush tables/lists) */
  flush?: boolean;
  /** Render as a clickable element */
  as?: "div" | "article" | "section";
};

const railMap: Record<string, string> = {
  project: "border-l-[var(--rail-project)]",
  task: "border-l-[var(--rail-task)]",
  finance: "border-l-[var(--rail-finance)]",
  material: "border-l-[var(--rail-material)]",
  alert: "border-l-[var(--rail-alert)]",
};

export function Card({ className, children, rail, flush, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)]",
        flush ? "p-0" : "p-4 sm:p-5",
        rail && `border-l-[3px] ${railMap[rail]}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
