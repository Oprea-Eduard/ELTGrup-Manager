import { cn } from "@/src/lib/utils";

const borderStyles: Record<string, string> = {
	success: "border-[var(--success)] text-[var(--success)]",
	warning: "border-[var(--warning)] text-[var(--warning)]",
	danger: "border-[var(--accent)] text-[var(--accent)]",
	neutral: "border-[var(--border-visible)] text-[var(--text-secondary)]",
	info: "border-[var(--interactive)] text-[var(--interactive)]",
};

const dotColors: Record<string, string> = {
	success: "bg-[var(--success)]",
	warning: "bg-[var(--warning)]",
	danger: "bg-[var(--accent)]",
	neutral: "bg-[var(--text-secondary)]",
	info: "bg-[var(--interactive)]",
};

export function Badge({
	children,
	tone = "neutral",
	className,
	dot,
}: {
	children: React.ReactNode;
	tone?: keyof typeof borderStyles;
	className?: string;
	dot?: boolean;
}) {
	if (dot) {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]",
					className,
				)}
			>
				<span
					className={cn(
						"inline-block h-1.5 w-1.5 rounded-full",
						dotColors[tone],
					)}
				/>
				{children}
			</span>
		);
	}

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] leading-none",
				borderStyles[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}
