"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { AppModule } from "@/src/lib/access-control";
import { Button } from "@/src/components/ui/button";
import { navItems, navSections } from "@/src/components/layout/navigation-config";
import { cn } from "@/src/lib/utils";

export function MobileNavDrawer({ visibleModules }: { visibleModules: AppModule[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const visibleSet = useMemo(() => new Set(visibleModules), [visibleModules]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Close drawer when navigating
  useEffect(() => {
    setTimeout(() => {
      handleClose();
    }, 0);
  }, [pathname]);

  // Handle window resize
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) handleClose();
    };

    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        className="shrink-0 lg:hidden"
        onClick={handleOpen}
        aria-label="Deschide meniul"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[300px] max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--shell)] transition-transform duration-200 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">ELTGRUP Manager</p>
            <p className="text-base font-semibold text-[var(--heading)]">Meniu</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            aria-label="Inchide meniul"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {navSections.map((section) => {
            const sectionItems = navItems.filter((item) => item.section === section && visibleSet.has(item.module));
            if (!sectionItems.length) return null;

            return (
              <section key={section} className="mb-6">
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{section}</p>
                <div className="flex flex-col gap-0.5">
                  {sectionItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleClose}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--foreground)]"
                            : "text-[var(--muted-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-[var(--accent)]" : "")} />
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
}
