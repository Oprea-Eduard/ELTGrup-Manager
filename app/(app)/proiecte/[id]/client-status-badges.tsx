"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/src/components/ui/badge";

export function PhaseOverdueBadge({
	endDate,
	phaseCompleted,
	formatDate,
}: {
	endDate: Date | null;
	phaseCompleted: boolean;
	formatDate: (d: Date) => string;
}) {
	const [mounted, setMounted] = useState(false);
	const [overdue, setOverdue] = useState(false);
	useEffect(() => {
		setMounted(true);
		if (!phaseCompleted && endDate) {
			setOverdue(new Date(endDate) < new Date());
		}
	}, [endDate, phaseCompleted]);

	if (phaseCompleted) {
		return (
			<span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--success)]">
				Finalizata
			</span>
		);
	}

	if (!endDate || !mounted) return null;

	if (!overdue) {
		return (
			<span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
				Termen: {formatDate(endDate)}
			</span>
		);
	}

	return (
		<span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--danger)]">
			Termen DEPASIT
		</span>
	);
}

export function ExpiryBadge({
	expiresAt,
	formatDate,
}: {
	expiresAt: Date | null;
	formatDate: (d: Date) => string;
}) {
	const [expired, setExpired] = useState(false);
	useEffect(() => {
		if (expiresAt) {
			setExpired(new Date(expiresAt) < new Date());
		}
	}, [expiresAt]);

	if (!expiresAt) return null;

	return (
		<Badge tone={expired ? "warning" : "neutral"}>
			Expira {formatDate(expiresAt)}
		</Badge>
	);
}
