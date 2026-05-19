import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function PageHeader({
	title,
	subtitle,
	actions,
}: {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
}) {
	return (
		<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<h1 className={cn("text-xl font-medium tracking-tight text-[var(--text-display)]", "sm:text-2xl")}>
					{title}
				</h1>
				{subtitle ? (
					<p className="mt-1 max-w-2xl font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						{subtitle}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2 sm:shrink-0">
					{actions}
				</div>
			) : null}
		</header>
	);
}
