import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows ?? 3}
        className={cn(
          "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-colors",
          "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
