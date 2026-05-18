"use client";

import type { FgoInvoiceStatus } from "@prisma/client";
import { Badge } from "@/src/components/ui/badge";
import {
	FGO_STATUS_LABELS,
	FGO_STATUS_TONES,
	getFgoProgressPercent,
} from "@/src/lib/fgo.types";

export function FgoStatusBadge({
	status,
	showProgress,
}: {
	status: FgoInvoiceStatus | null | undefined;
	showProgress?: boolean;
}) {
	if (!status) {
		return <Badge tone="neutral">Netrimisa</Badge>;
	}

	const label = FGO_STATUS_LABELS[status] ?? status;
	const tone = FGO_STATUS_TONES[status] ?? "neutral";
	const progress = getFgoProgressPercent(status);
	const isTerminal =
		status === "SUBMITTED_OK" ||
		status === "REJECTED" ||
		status === "SUBMITTED_ERRORS";

	return (
		<div className="flex flex-col gap-1.5">
			<Badge tone={tone}>{label}</Badge>
			{showProgress && !isTerminal && (
				<div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
					<div
						className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}
		</div>
	);
}
