"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import type { AppModule } from "@/src/lib/access-control";
import { cn } from "@/src/lib/utils";
import { navItems, navSections } from "@/src/components/layout/navigation-config";
import { useTheme } from "@/src/components/providers/theme-provider";
import pkg from "@/package.json";

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
        "sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--background) 98%,transparent),color-mix(in oklab,var(--background) 98%,transparent))] lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[272px]",
      )}
    >
      <div className={cn("border-b border-[var(--border)]", collapsed ? "px-2 pb-3 pt-3" : "px-4 pb-4 pt-5")}>
        <div className={cn("rounded-xl border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface-card) 96%,transparent))]", collapsed ? "px-2 py-2" : "px-3 py-4")}>
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center mx-auto rounded-lg bg-[var(--accent)] text-white text-sm font-bold">
              EG
            </div>
          ) : (
            <img
              src="/eltgrup-servicii-wordmark.png"
              alt="ELT Grup Servicii"
              className="mx-auto h-auto w-full max-w-[198px] object-contain"
              loading="lazy"
            />
          )}
        </div>
        {!collapsed && (
          <>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">ELTGRUP Manager</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in oklab,var(--accent) 45%,transparent)] bg-[color-mix(in oklab,var(--accent) 26%,transparent)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[color-mix(in oklab,var(--accent-strong)_80%,white_20%)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in oklab,var(--accent-strong)_90%,white_10%)]" />
                live
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-[var(--muted-strong)]">Platforma operationala</p>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => {
          const sectionItems = navItems.filter((item) => item.section === section && visibleSet.has(item.module));
          if (!sectionItems.length) return null;

          return (
            <section key={section} className={cn("mb-5", collapsed && "mb-4")}>
              {!collapsed && (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{section}</p>
              )}
              <div className={cn("mt-2 space-y-1", collapsed && "mt-1")}>
                {sectionItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                        item.sub && !collapsed ? "ml-5" : "",
                        collapsed ? "justify-center px-2 py-2" : "",
                        active
                          ? "border-[var(--border-strong)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface-2) 96%,transparent))] text-[var(--foreground)] shadow-[var(--shadow-float)]"
                          : "border-transparent text-[var(--muted-strong)] hover:border-[var(--border)] hover:bg-[var(--surface-card)] hover:text-[var(--foreground)]",
                      )}
                    >
                      {active && !collapsed ? <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" /> : null}
                      {!item.sub && (
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[var(--accent-strong)]" : "text-[var(--muted)] group-hover:text-[var(--accent)]")} />
                      )}
                      {!collapsed && (
                        <>
                          <span className={cn("min-w-0 flex-1 truncate", item.sub && "text-[12px] text-[var(--muted)]")}>{item.label}</span>
                          {!item.sub && <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]")} />}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="min-w-0 flex-1">
              {(userName || userAvatar) && (
                <div className="mb-2 flex items-center gap-2">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : userName ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  ) : null}
                  {userName && <p className="truncate text-xs font-medium text-[var(--foreground)]">{userName}</p>}
                </div>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Strat operational</p>
              <p className="mt-1 text-xs text-[var(--muted-strong)]">Executie proiecte, materiale, trasabilitate financiara</p>
            </div>
          )}
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-strong)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
        </div>
        <p className="mt-2 text-[9px] text-[var(--muted)]/50">v{pkg.version}</p>
      </div>
    </aside>
  );
}
