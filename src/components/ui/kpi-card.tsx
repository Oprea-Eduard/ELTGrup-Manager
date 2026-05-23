import Link from "next/link";
import { memo } from "react";
import { cn } from "@/src/lib/utils";

const colorMap: Record<string, string> = {
	active: "bg-[var(--green)]",
	blocked: "bg-[var(--red)]",
	pending: "bg-[var(--amber)]",
	done: "bg-[var(--t3)]",
	info: "bg-[var(--steel)]",
};

const textColorMap: Record<string, string> = {
	active: "text-[var(--green)]",
	blocked: "text-[var(--red)]",
	pending: "text-[var(--amber)]",
	done: "text-[var(--t2)]",
	info: "text-[var(--steel)]",
};

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
	const content = (
		<>
			<div
				className={cn(
					"absolute inset-x-0 top-0 h-[2px]",
					severity ? colorMap[severity] : "bg-[var(--amber)]",
				)}
			/>
			<p className="text-[8px] font-bold tracking-[2px] text-[var(--t3)]">
				{label}
			</p>
			{loading ? (
				<span className="font-mono text-[10px] text-[var(--t3)]">
					[INCARCARE...]
				</span>
			) : (
				<p className="mt-1 flex items-baseline gap-1 font-mono text-[22px] font-medium leading-none tracking-tight sm:text-[26px]">
					<span
						className={severity ? textColorMap[severity] : "text-[var(--t)]"}
					>
						{value}
					</span>
					{trend === "up" && (
						<span className="text-xs text-[var(--green)]">↑</span>
					)}
					{trend === "down" && (
						<span className="text-xs text-[var(--red)]">↓</span>
					)}
				</p>
			)}
			{helper ? (
				loading ? (
					<span className="font-mono text-[9px] text-[var(--t3)]">
						[INCARCARE...]
					</span>
				) : (
					<p className="mt-0.5 text-[9px] text-[var(--t3)]">
						{helper}
					</p>
				)
			) : null}
		</>
	);

	const classes = cn(
		"relative border border-[var(--b1)] bg-[var(--s1)] p-3 pt-[14px] overflow-hidden",
		(onClick || href) && "cursor-pointer transition-colors hover:bg-[var(--s2)]",
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
