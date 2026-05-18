import { cn } from "@/src/lib/utils";

/**
 * Clean label/value pair with optional trend indicator.
 * Replaces the verbose ListItem + inline stat pattern.
 */
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
	/** Show the value in muted color instead of foreground */
	muted?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between py-1.5 text-sm",
				className,
			)}
		>
			<span className="text-[var(--muted-strong)]">{label}</span>
			<span
				className={cn(
					"font-semibold tabular-nums",
					muted ? "text-[var(--muted)]" : "text-[var(--foreground)]",
				)}
			>
				{value}
				{trend === "up" && (
					<span className="ml-1 text-xs text-[var(--status-active)]">↑</span>
				)}
				{trend === "down" && (
					<span className="ml-1 text-xs text-[var(--status-blocked)]">↓</span>
				)}
			</span>
		</div>
	);
}
