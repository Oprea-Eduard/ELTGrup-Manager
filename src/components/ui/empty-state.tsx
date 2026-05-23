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
		<div className="border border-[var(--b1)] bg-[var(--s1)] p-6 text-center sm:p-8">
			<p className="text-[11px] font-bold tracking-[2px] text-[var(--t)]">
				{title}
			</p>
			<p className="mt-1 text-[10px] text-[var(--t3)]">
				{description}
			</p>
			{action && (
				<div className="mt-4">
					<Button onClick={action.onClick}>{action.label}</Button>
				</div>
			)}
		</div>
	);
}
