"use client";

import { useEffect, useState } from "react";

export function TopbarClock() {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		function tick() {
			const now = new Date();
			setTime(
				now.toLocaleTimeString("ro-RO", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false,
				}),
			);
		}
		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!time) return null;

	return (
		<div className="hidden items-center gap-2 md:flex">
			<span className="font-mono text-[13px] font-medium tabular-nums tracking-wider text-[var(--text-display)]">
				{time}
			</span>
		</div>
	);
}
