import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

/**
 * Consistent page section with optional title and action slot.
 * Replaces the pattern of wrapping everything in <Card> with a label.
 */
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
							<h2 className="text-base font-semibold text-[var(--heading)]">
								{title}
							</h2>
						)}
						{description && (
							<p className="text-sm text-[var(--muted)]">{description}</p>
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
