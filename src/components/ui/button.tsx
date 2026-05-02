import * as React from "react";
import { Button as HeroButton } from "@heroui/react";
import { cn } from "@/src/lib/utils";

type BaseHeroButtonProps = Omit<React.ComponentProps<typeof HeroButton>, "variant" | "size" | "color">;

export interface ButtonProps extends BaseHeroButtonProps {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

const sizeMap = {
  sm: "sm",
  default: "md",
  lg: "lg",
} as const;

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "border border-[var(--accent)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--accent) 88%,var(--shell) 12%),color-mix(in oklab,var(--accent) 72%,var(--shell) 28%))] text-[var(--foreground)] shadow-[0_12px_24px_-16px_color-mix(in_oklab,var(--accent)_88%,transparent)] hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[linear-gradient(180deg,color-mix(in oklab,var(--accent-strong) 92%,var(--shell) 8%),color-mix(in oklab,var(--accent-strong) 78%,var(--shell) 22%))] hover:shadow-[0_16px_32px_-18px_color-mix(in_oklab,var(--accent)_80%,transparent)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)] hover:-translate-y-px hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:shadow-[0_10px_24px_-20px_color-mix(in_oklab,var(--accent)_78%,transparent)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--muted-strong)] hover:border-[var(--border)] hover:bg-[var(--surface-card)] hover:text-[var(--foreground)]",
  destructive:
    "border border-[color-mix(in oklab,var(--danger) 75%,var(--shell) 25%)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--danger) 88%,var(--shell) 12%),color-mix(in oklab,var(--danger) 72%,var(--shell) 28%))] text-[var(--foreground)] shadow-[0_10px_18px_-14px_color-mix(in_oklab,var(--danger)_85%,transparent)] hover:-translate-y-px hover:border-[color-mix(in oklab,var(--danger) 85%,var(--shell) 15%)] hover:bg-[linear-gradient(180deg,color-mix(in oklab,var(--danger) 92%,var(--shell) 8%),color-mix(in oklab,var(--danger) 78%,var(--shell) 22%))]",
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const { disabled, ...rest } = props;

  return (
    <HeroButton
      size={sizeMap[size]}
      isDisabled={disabled}
      className={cn(
        "min-w-0 rounded-lg text-sm font-semibold transition-all duration-150 active:translate-y-px data-[disabled=true]:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40",
        variantClassMap[variant],
        className,
      )}
      {...rest}
    />
  );
}
