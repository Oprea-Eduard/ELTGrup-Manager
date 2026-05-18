import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function SectionCard({
	title,
	subtitle,
	children,
	action,
	spacing = "md",
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
	action?: ReactNode;
	spacing?: "sm" | "md" | "lg";
}) {
	const spacingMap = { sm: "px-4 py-1", md: "px-5 py-2", lg: "px-6 py-3" };

	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
			{(title || action) && (
				<div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
							{title}
						</p>
						{subtitle && (
							<p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>
						)}
					</div>
					{action && <div className="shrink-0">{action}</div>}
				</div>
			)}
			<div
				className={cn(
					"divide-y divide-[var(--border)]/50",
					spacingMap[spacing],
				)}
			>
				{children}
			</div>
		</div>
	);
}

export function SectionCardSimple({
	title,
	children,
	className,
	padding = "md",
}: {
	title?: string;
	children: ReactNode;
	className?: string;
	padding?: "sm" | "md" | "lg";
}) {
	const paddingMap = { sm: "p-3 sm:p-4", md: "p-4 sm:p-5", lg: "p-5 sm:p-6" };

	return (
		<div
			className={cn(
				"rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--shadow-panel)]",
				className,
			)}
		>
			{title && (
				<div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
					<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
						{title}
					</p>
				</div>
			)}
			<div className={paddingMap[padding]}>{children}</div>
		</div>
	);
}
