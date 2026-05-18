"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/src/components/ui/kpi-card";

export function ApprovedTodayCount({
	requests,
}: {
	requests: Array<{ status: string; updatedAt: Date }>;
}) {
	const [count, setCount] = useState(0);
	useEffect(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		setCount(
			requests.filter((r) => r.status === "APPROVED" && r.updatedAt > today)
				.length,
		);
	}, [requests]);

	return (
		<KpiCard label="Aprobate azi" value={String(count)} severity="active" />
	);
}
