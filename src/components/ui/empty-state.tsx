import { Button } from "@/src/components/ui/button";

export function EmptyState({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action?: { label: string; onClick: () => void };
}) {
	return (
		<div className="dot-grid-subtle rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center sm:p-10">
			<p className="font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-display)]">
				[ {title} ]
			</p>
			<p className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
				{description}
			</p>
			{action && (
				<div className="mt-6">
					<Button onClick={action.onClick}>{action.label}</Button>
				</div>
			)}
		</div>
	);
}
