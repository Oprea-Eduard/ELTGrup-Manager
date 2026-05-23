import { cn } from "@/src/lib/utils";

export function StatRow({
	label,
	value,
	trend,
	className,
	muted,
}: {
	label: string;
	value: string | number;
	trend?: "up" | "down";
	className?: string;
	muted?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between py-1.5",
				className,
			)}
		>
			<span className="text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
				{label}
			</span>
			<span
				className={cn(
					"font-mono text-[11px]",
					muted ? "text-[var(--t2)]" : "text-[var(--t)]",
				)}
			>
				{value}
				{trend === "up" && (
					<span className="ml-1 text-xs text-[var(--green)]">↑</span>
				)}
				{trend === "down" && (
					<span className="ml-1 text-xs text-[var(--red)]">↓</span>
				)}
			</span>
		</div>
	);
}
