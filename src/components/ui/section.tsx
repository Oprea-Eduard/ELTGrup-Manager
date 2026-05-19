import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function Section({
	title,
	description,
	actions,
	children,
	className,
}: {
	title?: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("space-y-3", className)}>
			{(title || actions) && (
				<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
					<div>
						{title && (
							<h2 className="text-base font-medium text-[var(--text-display)]">
								{title}
							</h2>
						)}
						{description && (
							<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
								{description}
							</p>
						)}
					</div>
					{actions && (
						<div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
					)}
				</div>
			)}
			{children}
		</section>
	);
}
