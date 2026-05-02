"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-3" aria-label="Breadcrumb">
      <Link href="/panou" className="hover:text-[var(--accent-strong)] transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={item.label + index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--accent-strong)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--muted-strong)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
