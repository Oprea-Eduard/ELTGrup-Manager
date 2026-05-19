"use client";

import {
	Calendar as CalendarIcon,
	FileText,
	Folder,
	Search,
	Settings,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

type CommandItem = {
	id: string;
	title: string;
	subtitle?: string;
	icon: React.ReactNode;
	onSelect: () => void;
	category: string;
};

export function GlobalCommandPalette() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const { push } = useRouter();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const commands = useMemo<CommandItem[]>(
		() => [
			{
				id: "proiecte",
				title: "PROIECTE",
				subtitle: "VEZI TOATE PROIECTELE ACTIVE",
				icon: <Folder className="size-4" />,
				category: "NAVIGARE",
				onSelect: () => push("/proiecte"),
			},
			{
				id: "lucrari",
				title: "LUCRARI",
				subtitle: "GESTIONEAZA ORDINELE DE LUCRU",
				icon: <FileText className="size-4" />,
				category: "NAVIGARE",
				onSelect: () => push("/lucrari"),
			},
			{
				id: "clienti",
				title: "CLIENTI",
				subtitle: "BAZA DE DATE CLIENTI",
				icon: <Users className="size-4" />,
				category: "NAVIGARE",
				onSelect: () => push("/clienti"),
			},
			{
				id: "calendar",
				title: "CALENDAR",
				subtitle: "PROGRAMARI SI TERMENE",
				icon: <CalendarIcon className="size-4" />,
				category: "NAVIGARE",
				onSelect: () => push("/calendar"),
			},
			{
				id: "setari",
				title: "SETARI",
				subtitle: "CONFIGURARE SISTEM SI PROFIL",
				icon: <Settings className="size-4" />,
				category: "SISTEM",
				onSelect: () => push("/setari"),
			},
		],
		[push],
	);

	const filteredCommands = useMemo(() => {
		if (!query) return commands;
		const lowerQuery = query.toLowerCase();
		return commands.filter(
			(cmd) =>
				cmd.title.toLowerCase().includes(lowerQuery) ||
				cmd.subtitle?.toLowerCase().includes(lowerQuery),
		);
	}, [query, commands]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-2xl overflow-hidden p-0">
				<DialogTitle className="sr-only">COMANDA GLOBALA</DialogTitle>
				<div className="flex items-center border-b border-[var(--border)] px-4 py-3">
					<Search className="mr-3 size-5 text-[var(--text-secondary)]" />
					<input
						placeholder="CE DORESTI SA CAUTI?"
						className="flex-1 bg-transparent font-mono text-[13px] uppercase tracking-[0.06em] outline-none placeholder:text-[var(--text-disabled)]"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-visible)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
						<span>[ESC]</span>
					</div>
				</div>

				<div className="max-h-[400px] overflow-y-auto p-2">
					{filteredCommands.length === 0 ? (
						<div className="px-4 py-12 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							NU AM GASIT NICIUN REZULTAT PENTRU &quot;{query}&quot;
						</div>
					) : (
						Object.entries(
							filteredCommands.reduce(
								(acc, cmd) => {
									if (!acc[cmd.category]) acc[cmd.category] = [];
									acc[cmd.category].push(cmd);
									return acc;
								},
								{} as Record<string, CommandItem[]>,
							),
						).map(([category, items]) => (
							<div key={category} className="mb-2 last:mb-0">
								<div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
									{category}
								</div>
								{items.map((item) => (
									<button
										type="button"
										key={item.id}
										onClick={() => {
											item.onSelect();
											setOpen(false);
										}}
										className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition hover:bg-[var(--surface-raised)] group"
									>
										<div className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-visible)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
											{item.icon}
										</div>
										<div>
											<div className="font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
												{item.title}
											</div>
											{item.subtitle && (
												<div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
													{item.subtitle}
												</div>
											)}
										</div>
									</button>
								))}
							</div>
						))
					)}
				</div>

				<div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
					<div className="flex gap-4">
						<span className="flex items-center gap-1">
							<kbd className="rounded-[var(--radius-sm)] border border-[var(--border-visible)] px-1">
								[↑↓]
							</kbd>{" "}
							NAVIGARE
						</span>
						<span className="flex items-center gap-1">
							<kbd className="rounded-[var(--radius-sm)] border border-[var(--border-visible)] px-1">
								[↵]
							</kbd>{" "}
							SELECTARE
						</span>
					</div>
					<span>COMANDA GLOBALA</span>
				</div>
			</DialogContent>
		</Dialog>
	);
}
