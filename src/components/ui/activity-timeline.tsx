import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";

const timelineDateFormatter = new Intl.DateTimeFormat("ro-RO", {
	dateStyle: "medium",
	timeStyle: "short",
});

export type TimelineEvent = {
	id: string;
	at: Date;
	title: string;
	detail?: string;
	category: string;
	href?: string;
	tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

function formatTimelineDate(value: Date) {
	return timelineDateFormatter.format(value);
}

export function ActivityTimeline({
	events,
	emptyTitle = "Nu exista evenimente",
	emptyDescription = "Activitatea va aparea aici dupa primele operatiuni.",
}: {
	events: TimelineEvent[];
	emptyTitle?: string;
	emptyDescription?: string;
}) {
	if (events.length === 0) {
		return (
			<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
				<p className="font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-display)]">
					[ {emptyTitle} ]
				</p>
				<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
					{emptyDescription}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{events.map((event) => (
				<div
					key={event.id}
					className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3"
				>
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-[var(--text-display)]">
							{event.title}
						</p>
						<Badge tone={event.tone || "neutral"}>{event.category}</Badge>
					</div>
					{event.detail ? (
						<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							{event.detail}
						</p>
					) : null}
					<div className="mt-2 flex items-center justify-between gap-3">
						<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							{formatTimelineDate(event.at)}
						</p>
						{event.href ? (
							<Link
								className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--interactive)] hover:text-[var(--text-display)] transition-colors"
								href={event.href}
							>
								[DESCHIDE]
							</Link>
						) : null}
					</div>
				</div>
			))}
		</div>
	);
}
