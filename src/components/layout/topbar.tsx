"use client";

import type { RoleKey } from "@prisma/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { MobileNavDrawer } from "@/src/components/layout/mobile-nav-drawer";
import { TopbarGlobalSearch } from "@/src/components/ui/topbar-global-search";
import type { AppModule } from "@/src/lib/access-control";
import { cn } from "@/src/lib/utils";
import { formatRoleLabels } from "@/src/lib/rbac";

const NAV_TABS: { label: string; href: string; module: AppModule }[] = [
	{ label: "PANOU", href: "/panou", module: "dashboard" },
	{ label: "PROIECTE", href: "/proiecte", module: "projects" },
	{ label: "LUCRARI", href: "/lucrari", module: "work_orders" },
	{ label: "CALENDAR", href: "/calendar", module: "calendar" },
	{ label: "PONTAJ", href: "/pontaj", module: "time_tracking" },
	{ label: "TEREN", href: "/teren", module: "field" },
	{ label: "MATERIALE", href: "/materiale", module: "materials" },
	{ label: "DOCUMENTE", href: "/documente", module: "documents" },
	{ label: "FINANCIAR", href: "/financiar", module: "financial" },
	{ label: "ANALITICE", href: "/analitice", module: "reports" },
];

export function Topbar({
	visibleModules,
	user,
}: {
	visibleModules: AppModule[];
	user: { id: string; name?: string | null; roleKeys: Array<RoleKey | string> };
}) {
	const pathname = usePathname();
	const visibleSet = new Set(visibleModules);
	const [now, setNow] = useState(new Date());
	const roleLabel = formatRoleLabels(user.roleKeys);

	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(t);
	}, []);

	const fmtT = (d: Date) =>
		d.toLocaleTimeString("ro-RO", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

	return (
		<header className="sticky top-0 z-30">
			{/* Top bar */}
			<div className="flex items-center justify-between border-b border-[var(--b1)] bg-[var(--s1)] px-4 py-2 sm:px-5">
				<div className="flex items-center gap-2">
					<MobileNavDrawer visibleModules={visibleModules} />
					<div className="flex size-6 items-center justify-center bg-[var(--amber)] text-[10px] font-extrabold text-black">
						EG
					</div>
					<div className="ml-1 hidden sm:block">
						<div className="text-sm font-bold tracking-[3px] text-[var(--t)]">
							ELT GRUP
						</div>
						<div className="text-[7px] font-bold tracking-[3px] text-[var(--t3)]">
							MANAGER
						</div>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="font-mono text-[9px] text-[var(--t2)]">
						<em className="not-italic text-[var(--t)]">{fmtT(now)}</em>
					</span>
					<Link
						href="/notificari"
						className="flex items-center gap-1 border border-[var(--ad)] bg-[var(--ab)] px-2 py-1 text-[8px] font-bold tracking-[1.5px] text-[var(--amber)]"
					>
						<span className="blink text-[7px]">{"▲"}</span>
						3 ALERTE
					</Link>
					<div className="flex size-6 items-center justify-center border border-[var(--b2)] bg-[var(--s3)] text-[8px] font-bold text-[var(--t2)]">
						{user.name
							? user.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()
							: "??"}
					</div>
					<SignOutButton />
				</div>
			</div>
			{/* Nav tabs */}
			<div className="flex h-[30px] items-stretch gap-0 overflow-hidden border-b border-[var(--b1)] bg-[var(--s2)] px-4">
				{NAV_TABS.filter((n) => visibleSet.has(n.module)).map((n) => {
					const active =
						pathname === n.href || pathname.startsWith(`${n.href}/`);
					return (
						<Link
							key={n.href}
							href={n.href}
							className={cn(
								"flex items-center border-b-2 px-2.5 text-[8px] font-bold tracking-[1.5px] transition-colors",
								active
									? "border-[var(--amber)] text-[var(--amber)]"
									: "border-transparent text-[var(--t3)] hover:text-[var(--t)]",
							)}
						>
							{n.label}
						</Link>
					);
				})}
			</div>
		</header>
	);
}
