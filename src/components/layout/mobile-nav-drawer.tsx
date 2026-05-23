"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	navItems,
	navSections,
} from "@/src/components/layout/navigation-config";
import { Button } from "@/src/components/ui/button";
import type { AppModule } from "@/src/lib/access-control";
import { cn } from "@/src/lib/utils";

export function MobileNavDrawer({
	visibleModules,
}: {
	visibleModules: AppModule[];
}) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const visibleSet = useMemo(() => new Set(visibleModules), [visibleModules]);

	const handleOpen = useCallback(() => setIsOpen(true), []);
	const handleClose = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		const id = setTimeout(() => {
			handleClose();
		}, 0);
		return () => clearTimeout(id);
	}, [handleClose]);

	useEffect(() => {
		const media = window.matchMedia("(min-width: 1024px)");
		const closeOnDesktop = (event: MediaQueryListEvent) => {
			if (event.matches) handleClose();
		};

		media.addEventListener("change", closeOnDesktop);
		return () => media.removeEventListener("change", closeOnDesktop);
	}, [handleClose]);

	const drawer = (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/60 lg:hidden"
					onClick={handleClose}
					aria-hidden="true"
				/>
			)}

			<aside className={cn(
				"fixed left-0 top-0 z-50 flex h-dvh w-[300px] max-w-[85vw] flex-col border-r border-[var(--border-visible)] bg-[var(--black)] transition-transform duration-200",
				isOpen ? "translate-x-0" : "-translate-x-full",
			)}>
				<div className="flex items-center justify-between border-b border-[var(--border-visible)] px-5 py-4">
					<div className="flex items-center gap-2">
						<span className="flex size-7 items-center justify-center bg-[var(--accent)] font-sans text-[12px] font-bold text-[#0B0C0F]">EG</span>
						<div>
							<p className="font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--text-display)]">ELT GRUP</p>
							<p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">MANAGER</p>
						</div>
					</div>
					<Button
						size="icon"
						variant="ghost"
						onClick={handleClose}
						aria-label="Inchide meniul"
					>
						<X className="size-5" />
					</Button>
				</div>

				<nav className="flex-1 overflow-y-auto px-4 py-5">
					{navSections.map((section) => {
						const sectionItems = navItems.filter(
							(item) => item.section === section && visibleSet.has(item.module),
						);
						if (!sectionItems.length) return null;

						return (
							<section key={section} className="mb-6">
								<p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
									{section}
								</p>
								<div className="flex flex-col gap-0.5">
									{sectionItems.map((item) => {
										const active =
											pathname === item.href ||
											pathname.startsWith(`${item.href}/`);
										const Icon = item.icon;

										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={handleClose}
												className={cn(
													"flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors",
													active
														? "text-[var(--text-display)]"
														: "text-[var(--text-disabled)] hover:text-[var(--text-primary)]",
												)}
											>
												<Icon
													className={cn(
														"size-4 shrink-0",
														active ? "text-[var(--accent)]" : "",
													)}
												/>
												<span className="truncate">{item.label}</span>
											</Link>
										);
									})}
								</div>
							</section>
						);
					})}
				</nav>
			</aside>
		</>
	);

	return (
		<>
			<Button
				size="icon"
				variant="secondary"
				className="shrink-0 lg:hidden"
				onClick={handleOpen}
				aria-label="Deschide meniul"
			>
				<Menu className="size-5" />
			</Button>
			{isOpen && typeof document !== "undefined"
				? createPortal(drawer, document.body)
				: null}
		</>
	);
}
