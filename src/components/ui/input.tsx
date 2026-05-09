import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]",
          "transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]",
          "sm:h-11",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
