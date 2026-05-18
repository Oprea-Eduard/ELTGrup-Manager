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
		<div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(16,26,38,0.95),rgba(12,21,31,0.92))] p-8 text-center sm:p-10">
			<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
				<svg
					className="size-5 text-[var(--muted-strong)]"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					aria-hidden="true"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
					/>
				</svg>
			</div>
			<h3 className="text-base font-semibold text-[var(--foreground)]">
				{title}
			</h3>
			<p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
			{action && (
				<div className="mt-4">
					<Button onClick={action.onClick}>{action.label}</Button>
				</div>
			)}
		</div>
	);
}
