import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

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
	emptyTitle = "NU EXISTA EVENIMENTE",
	emptyDescription = "ACTIVITATEA VA APAREA AICI DUPA PRIMELE OPERATIUNI.",
}: {
	events: TimelineEvent[];
	emptyTitle?: string;
	emptyDescription?: string;
}) {
	if (events.length === 0) {
		return (
			<div className="border border-[var(--b1)] bg-[var(--s1)] p-3 sm:p-4">
				<p className="text-[10px] font-bold tracking-[1.5px] text-[var(--t)]">
					{emptyTitle}
				</p>
				<p className="mt-1 text-[9px] text-[var(--t3)]">{emptyDescription}</p>
			</div>
		);
	}

	return (
		<div className="space-y-0">
			{events.map((event) => (
				<div
					key={event.id}
					className="flex items-start gap-2 border-b border-[var(--b1)] px-3 py-2 last:border-b-0 sm:px-4"
				>
					<span className="font-mono text-[8px] text-[var(--t3)] shrink-0 w-[30px] pt-[2px]">
						{formatTimelineDate(event.at)}
					</span>
					<div
						className={cn(
							"mt-[3px] size-[4px] shrink-0 rounded-full",
							event.tone === "danger"
								? "bg-[var(--red)]"
								: event.tone === "warning"
									? "bg-[var(--amber)]"
									: event.tone === "success"
										? "bg-[var(--green)]"
										: "bg-[var(--steel)]",
						)}
					/>
					<div className="flex-1">
						<p className="text-[10px] leading-[1.4] text-[var(--t2)]">
							{event.title}
						</p>
					</div>
					<span className="font-mono text-[8px] text-[var(--t3)] shrink-0">
						{event.href ? (
							<Link
								href={event.href}
								className="text-[var(--amber)] hover:text-[var(--t)] transition-colors"
							>
								{event.detail}
							</Link>
						) : null}
					</span>
				</div>
			))}
		</div>
	);
}
