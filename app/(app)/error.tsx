"use client";

import { Button } from "@/src/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--surface)] p-6">
			<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]">
				[ EROARE ]
			</p>
			<p className="mt-2 text-lg font-medium text-[var(--text-display)]">
				A APARUT O EROARE IN MODULUL CURENT
			</p>
			<p className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
				{error.message || "EROARE NECUNOSCUTA"}
			</p>
			<Button className="mt-4" variant="destructive" onClick={() => reset()}>
				REINCERCARE
			</Button>
		</div>
	);
}
