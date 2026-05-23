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
	sm: "h-7 px-2.5 text-[9px] gap-1",
	default: "h-9 px-4 text-[10px] gap-2",
	lg: "h-11 px-6 text-[11px] gap-2",
	icon: "h-9 w-9 justify-center p-0",
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
	default:
		"bg-[var(--amber)] text-black font-extrabold hover:opacity-90",
	secondary:
		"border border-[var(--b2)] text-[var(--t2)] font-bold hover:text-[var(--t)]",
	ghost:
		"text-[var(--t2)] font-bold hover:text-[var(--t)]",
	destructive: "border border-[var(--red)] text-[var(--red)] font-bold hover:bg-[var(--rb)]",
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
				"inline-flex items-center justify-center font-[var(--font-heading)] tracking-[2.5px] transition-colors",
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
				<span className="inline-block size-3 rounded-full border border-current border-r-transparent animate-spin" />
			)}
			{children}
		</Comp>
	);
}
