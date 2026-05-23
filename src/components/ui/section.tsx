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
		<section className={cn("space-y-2", className)}>
			{(title || actions) && (
				<div className="flex items-center justify-between gap-3 border-b border-[var(--b1)] px-3 py-2 sm:px-4">
					<div>
						{title && (
							<h2 className="text-[9px] font-bold tracking-[2px] text-[var(--t2)]">
								{title}
							</h2>
						)}
						{description && (
							<p className="text-[11px] text-[var(--t3)]">{description}</p>
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
