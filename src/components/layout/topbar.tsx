import Link from "next/link";
import { Bell } from "lucide-react";
import type { RoleKey } from "@prisma/client";
import type { AppModule } from "@/src/lib/access-control";
import { getUnreadNotificationCount } from "@/src/lib/notifications";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { MobileNavDrawer } from "@/src/components/layout/mobile-nav-drawer";
import { TopbarGlobalSearch } from "@/src/components/ui/topbar-global-search";
import { formatRoleLabels } from "@/src/lib/rbac";

export async function Topbar({
  visibleModules,
  user,
}: {
  visibleModules: AppModule[];
  user: { id: string; name?: string | null; roleKeys: Array<RoleKey | string> };
}) {
  const visibleSet = new Set(visibleModules);
  const unreadNotifications = visibleSet.has("notifications") && user.id ? await getUnreadNotificationCount(user.id) : 0;
  const roleLabel = formatRoleLabels(user.roleKeys);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/95 px-3 py-2.5 backdrop-blur-md sm:px-5 lg:px-6">
      {/* Mobile hamburger */}
      <MobileNavDrawer visibleModules={visibleModules} />

      {/* Search — dominant element */}
      <TopbarGlobalSearch
        visibleModules={visibleModules}
        className="min-w-0 flex-1"
        placeholder="Cauta proiect, lucrare, material..."
      />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {visibleSet.has("notifications") ? (
          <Link
            href="/notificari"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted-strong)] transition-colors hover:bg-[var(--surface-2)] sm:h-10 sm:w-10"
            aria-label="Notificari"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--status-blocked)] px-1 text-[9px] font-bold text-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            ) : null}
          </Link>
        ) : null}

        <div className="hidden text-right sm:block">
          <p className="max-w-[160px] truncate text-sm font-medium text-[var(--foreground)]">{user.name || "Utilizator"}</p>
          <p className="max-w-[160px] truncate text-[11px] text-[var(--muted)]">{roleLabel}</p>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
