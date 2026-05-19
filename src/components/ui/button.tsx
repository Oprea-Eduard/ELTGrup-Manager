import { Slot } from "@radix-ui/react-slot";
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
	default: "h-10 px-6 text-sm gap-2 sm:h-11",
	lg: "h-12 px-8 text-sm gap-2",
	icon: "h-10 w-10 sm:h-11 sm:w-11 justify-center p-0",
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
	default:
		"bg-[var(--text-display)] text-[var(--black)] hover:opacity-90",
	secondary:
		"border border-[var(--border-visible)] text-[var(--text-primary)] hover:border-[var(--text-display)]",
	ghost:
		"text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
	destructive: "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-subtle)]",
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
				"inline-flex items-center rounded-[var(--radius-pill)] font-mono text-[13px] uppercase tracking-[0.06em] font-normal transition-all duration-100",
				"disabled:pointer-events-none disabled:opacity-50",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
				sizeStyles[size],
				variantStyles[variant],
				loading && "pointer-events-none opacity-80",
				className,
			)}
			{...props}
		>
			{loading && (
				<span className="inline-block size-3.5 rounded-full border border-current border-r-transparent animate-spin" />
			)}
			{children}
		</Comp>
	);
}
