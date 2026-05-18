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
				<h1
					className={cn(
						"text-xl font-semibold tracking-tight text-[var(--heading)]",
						"sm:text-2xl",
					)}
				>
					{title}
				</h1>
				{subtitle ? (
					<p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
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
