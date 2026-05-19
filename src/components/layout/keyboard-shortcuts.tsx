"use client";

import { useEffect, useState } from "react";

const shortcuts: Record<string, { href: string; label: string }> = {
	p: { href: "/proiecte", label: "PROIECTE" },
	l: { href: "/lucrari", label: "LUCRARI" },
	c: { href: "/clienti", label: "CLIENTI" },
	f: { href: "/financiar", label: "FINANCIAR" },
	o: { href: "/oferte", label: "OFERTE" },
	m: { href: "/materiale", label: "MATERIALE" },
	d: { href: "/documente", label: "DOCUMENTE" },
	e: { href: "/echipe", label: "ECHIPE" },
	t: { href: "/pontaj", label: "PONTAJ" },
	n: { href: "/notificari", label: "NOTIFICARI" },
	s: { href: "/setari", label: "SETARI" },
};

export function KeyboardShortcuts({ enabled = true }: { enabled?: boolean }) {
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey) return;
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				e.target instanceof HTMLSelectElement
			)
				return;

			if (e.key === "?" || (e.key === "/" && !e.shiftKey)) {
				e.preventDefault();
				setShowHelp((prev) => !prev);
				return;
			}

			const key = e.key.toLowerCase();
			const shortcut = shortcuts[key];
			if (shortcut) {
				e.preventDefault();
				window.location.href = shortcut.href;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled]);

	return showHelp ? (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
			onClick={() => setShowHelp(false)}
			onKeyDown={(e) => {
				if (e.key === "Escape") setShowHelp(false);
			}}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-visible)] bg-[var(--surface)] p-5"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label="Scurtaturi de tastatura"
			>
				<h2 className="mb-4 font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-display)]">
					SCURTATURI TASTATURA
				</h2>
				<div className="space-y-2">
					{Object.entries(shortcuts).map(([key, { label }]) => (
						<div key={key} className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
								{label}
							</span>
							<kbd className="rounded-[var(--radius-sm)] border border-[var(--border-visible)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
								{key.toUpperCase()}
							</kbd>
						</div>
					))}
					<div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
						<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
							AJUTOR SCURTATURI
						</span>
						<kbd className="rounded-[var(--radius-sm)] border border-[var(--border-visible)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
							?
						</kbd>
					</div>
				</div>
				<button
					type="button"
					className="mt-4 w-full rounded-[var(--radius-pill)] border border-[var(--border-visible)] py-2 font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-primary)] hover:border-[var(--text-display)]"
					onClick={() => setShowHelp(false)}
				>
					INCHIDE
				</button>
			</div>
		</div>
	) : null;
}
