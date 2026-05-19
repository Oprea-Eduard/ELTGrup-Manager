"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import {
	navItems,
	navSections,
} from "@/src/components/layout/navigation-config";
import { useTheme } from "@/src/components/providers/theme-provider";
import type { AppModule } from "@/src/lib/access-control";
import { cn } from "@/src/lib/utils";

export function Sidebar({
	visibleModules,
	collapsed,
	userName,
	userAvatar,
}: {
	visibleModules: AppModule[];
	collapsed?: boolean;
	userName?: string | null;
	userAvatar?: string | null;
}) {
	const pathname = usePathname();
	const visibleSet = new Set(visibleModules);
	const { theme, toggle } = useTheme();

	return (
		<aside
			className={cn(
				"sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--black)] lg:flex",
				collapsed ? "w-[64px]" : "w-[200px]",
			)}
		>
			{/* Logo area */}
			<div
				className={cn(
					"border-b border-[var(--border)]",
					collapsed ? "px-2 py-4" : "px-4 py-4",
				)}
			>
				{collapsed ? (
					<p className="text-center font-mono text-[13px] uppercase tracking-[0.06em] text-[var(--accent)]">
						EG
					</p>
				) : (
					<p className="font-mono text-[13px] uppercase tracking-[0.08em] text-[var(--accent)]">
						ELTGRUP
					</p>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-2 py-3">
				{navSections.map((section) => {
					const sectionItems = navItems.filter(
						(item) => item.section === section && visibleSet.has(item.module),
					);
					if (!sectionItems.length) return null;

					return (
						<section key={section} className={cn("mb-4", collapsed && "mb-3")}>
							{!collapsed && (
								<p className="mb-1 px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
									{section}
								</p>
							)}
							<div className="space-y-0.5">
								{sectionItems.map((item) => {
									const active =
										pathname === item.href ||
										pathname.startsWith(`${item.href}/`);
									const Icon = item.icon;

									return (
										<a
											key={item.href}
											href={item.href}
											title={collapsed ? item.label : undefined}
											className={cn(
												"group relative flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors",
												item.sub && !collapsed ? "ml-4" : "",
												collapsed ? "justify-center px-2 py-2" : "",
												active
													? "text-[var(--text-display)]"
													: "text-[var(--text-disabled)] hover:text-[var(--text-primary)]",
											)}
										>
											{active && (
												<span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-[var(--accent)]" />
											)}
											{!item.sub && (
												<Icon
													className={cn(
														"size-3.5 shrink-0",
														active
															? "text-[var(--accent)]"
															: "text-[var(--text-disabled)] group-hover:text-[var(--text-primary)]",
													)}
												/>
											)}
											{!collapsed && (
												<span className="min-w-0 flex-1 truncate">
													{item.label}
												</span>
											)}
										</a>
									);
								})}
							</div>
						</section>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="border-t border-[var(--border)] p-3">
				<div className="flex items-center gap-2">
					{!collapsed && (userName || userAvatar) && (
						<div className="min-w-0 flex-1 flex items-center gap-2">
							{userName && (
								<p className="truncate font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
									{userName}
								</p>
							)}
						</div>
					)}
					<button
						type="button"
						onClick={toggle}
						className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-visible)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-display)]"
						aria-label="Schimba tema"
					>
						{theme === "dark" ? (
							<Sun className="size-3" />
						) : (
							<Moon className="size-3" />
						)}
					</button>
				</div>
			</div>
		</aside>
	);
}
