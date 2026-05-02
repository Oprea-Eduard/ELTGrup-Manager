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

export function Sidebar({ visibleModules }: { visibleModules: AppModule[] }) {
  const pathname = usePathname();
  const visibleSet = new Set(visibleModules);
  const { theme, toggle } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--background) 98%,transparent),color-mix(in oklab,var(--background) 98%,transparent))] lg:flex lg:flex-col">
      <div className="border-b border-[var(--border)] px-4 pb-4 pt-5">
        <div className="rounded-xl border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface-card) 96%,transparent))] px-3 py-4">
          <img
            src="/eltgrup-servicii-wordmark.png"
            alt="ELT Grup Servicii"
            className="mx-auto h-auto w-full max-w-[198px] object-contain"
            loading="lazy"
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">ELTGRUP Manager</p>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in oklab,var(--accent) 45%,transparent)] bg-[color-mix(in oklab,var(--accent) 26%,transparent)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: "color-mix(in oklab, var(--accent-strong) 80%, white 20%)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "color-mix(in oklab, var(--accent-strong) 90%, white 10%)" }} />
            live
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-[var(--muted-strong)]">Platforma operationala</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => {
          const sectionItems = navItems.filter((item) => item.section === section && visibleSet.has(item.module));
          if (!sectionItems.length) return null;

          return (
            <section key={section} className="mb-5">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{section}</p>
              <div className="mt-2 space-y-1">
                {sectionItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                        active
                          ? "border-[var(--border-strong)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface-2) 96%,transparent))] text-[var(--foreground)] shadow-[var(--shadow-float)]"
                          : "border-transparent text-[var(--muted-strong)] hover:border-[var(--border)] hover:bg-[var(--surface-card)] hover:text-[var(--foreground)]",
                      )}
                    >
                      {active ? <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" /> : null}
                      <Icon className={cn("h-4 w-4", active ? "text-[var(--accent-strong)]" : "text-[var(--muted)] group-hover:text-[var(--accent)]")} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <ChevronRight className={cn("h-3.5 w-3.5", active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]")} />
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
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Strat operational</p>
            <p className="mt-1 text-xs text-[var(--muted-strong)]">Executie proiecte, materiale, trasabilitate financiara</p>
          </div>
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-strong)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
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
