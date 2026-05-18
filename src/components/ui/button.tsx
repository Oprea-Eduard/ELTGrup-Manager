import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "secondary" | "ghost" | "destructive";
	size?: "sm" | "default" | "lg" | "icon";
	loading?: boolean;
	asChild?: boolean;
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
	sm: "h-8 px-3 text-xs gap-1.5",
	default: "h-10 px-4 text-sm gap-2 sm:h-11",
	lg: "h-12 px-6 text-sm gap-2",
	icon: "h-10 w-10 sm:h-11 sm:w-11 justify-center p-0",
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
	default:
		"bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] active:brightness-90",
	secondary:
		"border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]",
	ghost:
		"text-[var(--muted-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
	destructive: "bg-[var(--status-blocked)] text-white hover:opacity-90",
};

export function Button({
	className,
	variant = "default",
	size = "default",
	loading,
	disabled,
	asChild,
	children,
	type = "button",
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			type={asChild ? undefined : type}
			disabled={disabled || loading}
			className={cn(
				"inline-flex items-center rounded-[var(--radius-md)] font-medium transition-all duration-100",
				"active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
				sizeStyles[size],
				variantStyles[variant],
				loading && "pointer-events-none opacity-80",
				className,
			)}
			{...props}
		>
			{loading && <Loader2 className="size-4 animate-spin" />}
			{children}
		</Comp>
	);
}
