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
				"sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--b1)] bg-[var(--s1)] lg:flex",
				collapsed ? "w-[64px]" : "w-[200px]",
			)}
		>
			{/* Brand */}
			<div className="flex items-center gap-2 border-b border-[var(--b1)] px-4 py-4">
				<div className="flex size-7 items-center justify-center bg-[var(--amber)] text-[11px] font-extrabold text-black">
					EG
				</div>
				{!collapsed && (
					<div>
						<div className="text-base font-bold tracking-[3px] text-[var(--t)]">
							ELT GRUP
						</div>
						<div className="text-[8px] font-bold tracking-[3px] text-[var(--t3)]">
							MANAGER
						</div>
					</div>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-2">
				{navSections.map((section) => {
					const sectionItems = navItems.filter(
						(item) => item.section === section && visibleSet.has(item.module),
					);
					if (!sectionItems.length) return null;

					return (
						<section key={section} className="mb-2">
							{!collapsed && (
								<p className="px-4 py-1 font-[var(--font-heading)] text-[8px] font-bold tracking-[2px] text-[var(--t3)]">
									{section}
								</p>
							)}
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
											"flex items-center gap-2.5 px-4 py-1.5 text-[9px] font-bold tracking-[1.5px] transition-colors",
											item.sub && !collapsed ? "ml-6" : "",
											collapsed ? "justify-center px-2" : "",
											active
												? "text-[var(--amber)] border-l-2 border-[var(--amber)] bg-[var(--ab)]"
												: "text-[var(--t3)] hover:text-[var(--t)]",
										)}
									>
										{!item.sub && (
											<Icon
												className={cn(
													"size-3.5 shrink-0",
													active ? "text-[var(--amber)]" : "",
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
						</section>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="border-t border-[var(--b1)] p-3">
				<div className="flex items-center gap-2">
					{!collapsed && userName && (
						<p className="flex-1 truncate font-[var(--font-heading)] text-[9px] font-bold tracking-[1px] text-[var(--t2)]">
							{userName}
						</p>
					)}
					<button
						type="button"
						onClick={toggle}
						className="flex size-6 items-center justify-center border border-[var(--b2)] text-[var(--t2)] hover:text-[var(--t)] transition-colors"
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
