"use client";

import { useEffect, useState } from "react";

const shortcuts: Record<string, { href: string; label: string }> = {
	p: { href: "/proiecte", label: "Proiecte" },
	l: { href: "/lucrari", label: "Lucrari" },
	c: { href: "/clienti", label: "Clienti" },
	f: { href: "/financiar", label: "Financiar" },
	o: { href: "/oferte", label: "Oferte" },
	m: { href: "/materiale", label: "Materiale" },
	d: { href: "/documente", label: "Documente" },
	e: { href: "/echipe", label: "Echipe" },
	t: { href: "/pontaj", label: "Pontaj" },
	n: { href: "/notificari", label: "Notificari" },
	s: { href: "/setari", label: "Setari" },
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
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onClick={() => setShowHelp(false)}
			onKeyDown={(e) => {
				if (e.key === "Escape") setShowHelp(false);
			}}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label="Scurtaturi de tastatura"
			>
				<h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
					Scurtaturi de tastatura
				</h2>
				<div className="space-y-2">
					{Object.entries(shortcuts).map(([key, { label }]) => (
						<div key={key} className="flex items-center justify-between">
							<span className="text-sm text-[var(--muted-strong)]">
								{label}
							</span>
							<kbd className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
								{key.toUpperCase()}
							</kbd>
						</div>
					))}
					<div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
						<span className="text-sm text-[var(--muted-strong)]">
							Ajutor scurtaturi
						</span>
						<kbd className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
							?
						</kbd>
					</div>
				</div>
				<button
					type="button"
					className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--surface-2)]"
					onClick={() => setShowHelp(false)}
				>
					Inchide
				</button>
			</div>
		</div>
	) : null;
}
