import { cn } from "@/src/lib/utils";

const borderStyles: Record<string, string> = {
	success: "border-[var(--green)] text-[var(--green)] bg-[var(--gb)]",
	warning: "border-[var(--amber)] text-[var(--amber)] bg-[var(--ab)]",
	danger: "border-[var(--red)] text-[var(--red)] bg-[var(--rb)]",
	neutral: "border-[var(--b2)] text-[var(--t2)] bg-transparent",
	info: "border-[var(--steel)] text-[var(--steel)] bg-[var(--sb)]",
};

const dotColors: Record<string, string> = {
	success: "bg-[var(--green)]",
	warning: "bg-[var(--amber)]",
	danger: "bg-[var(--red)]",
	neutral: "bg-[var(--t2)]",
	info: "bg-[var(--steel)]",
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
					"inline-flex items-center gap-1.5 text-[8px] font-bold tracking-[1px] text-[var(--t2)]",
					className,
				)}
			>
				<span
					className={cn(
						"inline-block size-[5px] rounded-full",
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
				"inline-flex items-center border px-1.5 py-[1px] text-[8px] font-bold tracking-[1px] leading-none",
				borderStyles[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}
