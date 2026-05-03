import { Button as HeroButton } from "@heroui/react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

type BaseHeroButtonProps = Omit<React.ComponentProps<typeof HeroButton>, "variant" | "size" | "color" | "isLoading">;

export interface ButtonProps extends BaseHeroButtonProps {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

const sizeMap = { sm: "sm", default: "md", lg: "lg" } as const;

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] active:bg-[var(--accent-strong)] disabled:opacity-50",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-2)] disabled:opacity-50",
  ghost:
    "text-[var(--muted-strong)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-50",
  destructive:
    "bg-[var(--danger)] text-white hover:opacity-90 disabled:opacity-50",
};

export function Button({ className, variant = "default", size = "default", loading, disabled, asChild, children, ...props }: ButtonProps) {
  const { ref: _ref, ...rest } = props as any;

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  const Comp = asChild ? Slot : HeroButton;

  return (
    <Comp
      size={sizeMap[size]}
      isDisabled={disabled || loading}
      className={cn(
        "min-w-0 rounded-lg text-sm font-medium transition-all duration-100 active:scale-[0.98] data-[disabled=true]:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40",
        loading && "pointer-events-none opacity-80",
        variantClassMap[variant],
        className,
      )}
      {...rest}
    >
      {asChild ? children : content}
    </Comp>
  );
}
