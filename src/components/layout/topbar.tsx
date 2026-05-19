import type { RoleKey } from "@prisma/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { MobileNavDrawer } from "@/src/components/layout/mobile-nav-drawer";
import { TopbarGlobalSearch } from "@/src/components/ui/topbar-global-search";
import type { AppModule } from "@/src/lib/access-control";
import { getUnreadNotificationCount } from "@/src/lib/notifications";
import { formatRoleLabels } from "@/src/lib/rbac";

export async function Topbar({
	visibleModules,
	user,
}: {
	visibleModules: AppModule[];
	user: { id: string; name?: string | null; roleKeys: Array<RoleKey | string> };
}) {
	const visibleSet = new Set(visibleModules);
	const unreadNotifications =
		visibleSet.has("notifications") && user.id
			? await getUnreadNotificationCount(user.id)
			: 0;
	const roleLabel = formatRoleLabels(user.roleKeys);

	return (
		<header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--black)] px-3 py-2 sm:px-5 lg:px-6">
			<MobileNavDrawer visibleModules={visibleModules} />

			<TopbarGlobalSearch
				visibleModules={visibleModules}
				className="min-w-0 flex-1"
				placeholder="Cauta proiect, lucrare, material..."
			/>

			<div className="flex items-center gap-2 shrink-0">
				{visibleSet.has("notifications") ? (
					<Link
						href="/notificari"
						className="relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-visible)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-display)] sm:h-10 sm:w-10"
						aria-label="Notificari"
					>
						<Bell className="size-4" />
						{unreadNotifications > 0 ? (
							<span className="absolute -right-1 -top-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center bg-[var(--accent)] px-1 font-mono text-[9px] text-[var(--text-display)]">
								{unreadNotifications > 99 ? "99+" : unreadNotifications}
							</span>
						) : null}
					</Link>
				) : null}

				<div className="hidden text-right sm:block">
					<p className="max-w-[160px] truncate font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
						{user.name || "UTILIZATOR"}
					</p>
					<p className="max-w-[160px] truncate font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
						{roleLabel}
					</p>
				</div>

				<SignOutButton />
			</div>
		</header>
	);
}
