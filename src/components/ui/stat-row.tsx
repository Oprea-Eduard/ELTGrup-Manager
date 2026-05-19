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
			<span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
				{label}
			</span>
			<span
				className={cn(
					"font-mono tabular-nums text-sm",
					muted ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]",
				)}
			>
				{value}
				{trend === "up" && (
					<span className="ml-1 text-xs text-[var(--success)]">↑</span>
				)}
				{trend === "down" && (
					<span className="ml-1 text-xs text-[var(--accent)]">↓</span>
				)}
			</span>
		</div>
	);
}
