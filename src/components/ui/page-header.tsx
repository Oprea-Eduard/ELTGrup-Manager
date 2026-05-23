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
		<header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<h1 className={cn("text-xl font-bold tracking-[0.5px] text-[var(--t)]", "sm:text-2xl")}>
					{title}
				</h1>
				{subtitle ? (
					<p className="mt-0.5 max-w-2xl text-[8px] font-bold tracking-[2px] text-[var(--t3)]">
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
