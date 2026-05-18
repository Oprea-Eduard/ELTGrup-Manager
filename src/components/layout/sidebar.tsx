"use client";

import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
				"sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--shell)] lg:flex",
				collapsed ? "w-[64px]" : "w-[240px]",
			)}
		>
			{/* Logo */}
			<div
				className={cn(
					"border-b border-[var(--border)]",
					collapsed ? "px-2 py-3" : "px-4 py-4",
				)}
			>
				{collapsed ? (
					<div className="flex size-9 items-center justify-center mx-auto rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-xs font-bold">
						EG
					</div>
				) : (
					<Image
						src="/eltgrup-servicii-wordmark.png"
						alt="ELT Grup Servicii"
						width={180}
						height={60}
						className="mx-auto h-auto w-full max-w-[180px] object-contain"
						loading="lazy"
					/>
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
								<p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
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
										<Link
											key={item.href}
											href={item.href}
											title={collapsed ? item.label : undefined}
											className={cn(
												"group relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[13px] font-medium transition-colors",
												item.sub && !collapsed ? "ml-4 text-[12px]" : "",
												collapsed ? "justify-center px-2 py-2" : "",
												active
													? "bg-[var(--accent-subtle)] text-[var(--foreground)]"
													: "text-[var(--muted-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
											)}
										>
											{active && !collapsed ? (
												<span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
											) : null}
											{!item.sub && (
												<Icon
													className={cn(
														"size-4 shrink-0",
														active
															? "text-[var(--accent)]"
															: "text-[var(--muted)] group-hover:text-[var(--accent)]",
													)}
												/>
											)}
											{!collapsed && (
												<span className="min-w-0 flex-1 truncate">
													{item.label}
												</span>
											)}
										</Link>
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
							{userAvatar ? (
								<Image
									src={userAvatar}
									alt=""
									width={28}
									height={28}
									className="size-7 shrink-0 rounded-full object-cover"
								/>
							) : userName ? (
								<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
									{userName.charAt(0).toUpperCase()}
								</div>
							) : null}
							{userName && (
								<p className="truncate text-xs font-medium text-[var(--foreground)]">
									{userName}
								</p>
							)}
						</div>
					)}
					<button
						type="button"
						onClick={toggle}
						className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
						aria-label="Schimba tema"
					>
						{theme === "dark" ? (
							<Sun className="size-3.5" />
						) : (
							<Moon className="size-3.5" />
						)}
					</button>
				</div>
			</div>
		</aside>
	);
}
