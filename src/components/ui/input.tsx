import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-[var(--border)] bg-[color:color-mix(in_oklab,var(--surface-card)_85%,var(--shell)_15%)] px-3.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-colors outline-none focus:-translate-y-px focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_24%,transparent)] disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
