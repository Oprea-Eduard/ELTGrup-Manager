import Link from "next/link";
import { memo } from "react";
import { cn } from "@/src/lib/utils";

export const KpiCard = memo(function KpiCard({
	label,
	value,
	helper,
	trend,
	severity,
	href,
	loading,
	onClick,
}: {
	label: string;
	value: string;
	helper?: string;
	trend?: "up" | "down";
	severity?: "active" | "blocked" | "pending" | "done" | "info";
	href?: string;
	loading?: boolean;
	onClick?: () => void;
}) {
	const severityColor: Record<string, string> = {
		active: "text-[var(--success)]",
		blocked: "text-[var(--accent)]",
		pending: "text-[var(--warning)]",
		done: "text-[var(--text-secondary)]",
		info: "text-[var(--interactive)]",
	};

	const content = (
		<>
			<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
				{label}
			</p>
			{loading ? (
				<span className="font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
					[INCARCARE...]
				</span>
			) : (
				<p className="mt-2 flex items-baseline gap-2 font-doto text-[32px] font-medium leading-none tracking-tight text-[var(--text-display)] sm:text-[36px]">
					<span className={severity ? severityColor[severity] : ""}>{value}</span>
					{trend === "up" && (
						<span className="text-[16px] text-[var(--success)]">↑</span>
					)}
					{trend === "down" && (
						<span className="text-[16px] text-[var(--accent)]">↓</span>
					)}
				</p>
			)}
			{helper ? (
				loading ? (
					<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
						[INCARCARE...]
					</span>
				) : (
					<p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
						{helper}
					</p>
				)
			) : null}
		</>
	);

	const classes = cn(
		"rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4",
		(onClick || href) && "cursor-pointer transition-colors hover:bg-[var(--surface-raised)]",
	);

	if (href) {
		return (
			<Link href={href} className={classes}>
				{content}
			</Link>
		);
	}

	return (
		<div
			className={classes}
			{...(onClick
				? {
						onClick,
						role: "button",
						tabIndex: 0,
						onKeyDown: (e: React.KeyboardEvent) =>
							e.key === "Enter" && onClick(),
					}
				: {})}
		>
			{content}
		</div>
	);
});
