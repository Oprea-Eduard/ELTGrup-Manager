"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { AppModule } from "@/src/lib/access-control";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { navItems } from "@/src/components/layout/navigation-config";

type SearchTarget = {
  module: AppModule;
  href: string;
};

type SearchEntry = {
  label: string;
  href: string;
  module: AppModule;
  keywords: string[];
};

const targetPriority: SearchTarget[] = [
  { module: "work_orders", href: "/lucrari" },
  { module: "projects", href: "/proiecte" },
  { module: "clients", href: "/clienti" },
  { module: "subcontractors", href: "/subcontractori" },
  { module: "financial", href: "/financiar" },
  { module: "reports", href: "/rapoarte-zilnice" },
  { module: "notifications", href: "/notificari" },
  { module: "time_tracking", href: "/pontaj" },
  { module: "documents", href: "/documente" },
  { module: "materials", href: "/materiale" },
  { module: "calendar", href: "/calendar" },
];

const prefixToModule: Array<{ prefix: string; module: AppModule }> = [
  { prefix: "lucrare:", module: "work_orders" },
  { prefix: "task:", module: "work_orders" },
  { prefix: "proiect:", module: "projects" },
  { prefix: "proiecte:", module: "projects" },
  { prefix: "document:", module: "documents" },
  { prefix: "doc:", module: "documents" },
  { prefix: "client:", module: "clients" },
  { prefix: "clienti:", module: "clients" },
  { prefix: "subcontractor:", module: "subcontractors" },
  { prefix: "sub:", module: "subcontractors" },
  { prefix: "material:", module: "materials" },
  { prefix: "mat:", module: "materials" },
  { prefix: "scula:", module: "materials" },
  { prefix: "scule:", module: "materials" },
  { prefix: "depozit:", module: "materials" },
  { prefix: "financiar:", module: "financial" },
  { prefix: "factura:", module: "financial" },
  { prefix: "documente:", module: "documents" },
  { prefix: "rapoarte:", module: "reports" },
  { prefix: "raport:", module: "reports" },
  { prefix: "notificare:", module: "notifications" },
  { prefix: "pontaj:", module: "time_tracking" },
  { prefix: "calendar:", module: "calendar" },
  { prefix: "oferta:", module: "offers" },
  { prefix: "oferte:", module: "offers" },
  { prefix: "echipa:", module: "teams" },
  { prefix: "echipe:", module: "teams" },
  { prefix: "setari:", module: "settings" },
  { prefix: "panou:", module: "dashboard" },
  { prefix: "teren:", module: "field" },
];

function buildSearchEntries(): SearchEntry[] {
  return navItems.map((item) => {
    const keywords = [
      item.label.toLowerCase(),
      item.module.replace(/_/g, " ").toLowerCase(),
      item.module.toLowerCase(),
      ...item.href
        .split("/")
        .filter(Boolean)
        .map((s) => s.toLowerCase()),
    ];
    return { label: item.label, href: item.href, module: item.module, keywords };
  });
}

function highlightMatch(text: string, indices: ReadonlyArray<[number, number]>): { char: string; highlight: boolean }[] {
  if (!indices.length) return text.split("").map((char) => ({ char, highlight: false }));

  const chars: { char: string; highlight: boolean }[] = [];
  let lastEnd = 0;

  for (const [start, end] of indices) {
    for (let i = lastEnd; i < start; i++) {
      chars.push({ char: text[i], highlight: false });
    }
    for (let i = start; i <= end; i++) {
      chars.push({ char: text[i], highlight: true });
    }
    lastEnd = end + 1;
  }
  for (let i = lastEnd; i < text.length; i++) {
    chars.push({ char: text[i], highlight: false });
  }

  return chars;
}

function extractSearchTarget(query: string) {
  const normalized = query.trim().toLowerCase();
  for (const item of prefixToModule) {
    if (normalized.startsWith(item.prefix)) {
      return {
        module: item.module,
        query: query.slice(item.prefix.length).trim(),
      };
    }
  }
  return { module: null, query: query.trim() };
}

const sectionOrder: SearchEntry["module"][] = [
  "dashboard",
  "offers",
  "projects",
  "work_orders",
  "teams",
  "calendar",
  "time_tracking",
  "materials",
  "documents",
  "clients",
  "reports",
  "subcontractors",
  "financial",
  "notifications",
  "settings",
];

function sortByModuleOrder(entries: SearchEntry[]): SearchEntry[] {
  const order = new Map(sectionOrder.map((m, i) => [m, i]));
  return [...entries].sort((a, b) => (order.get(a.module) ?? 99) - (order.get(b.module) ?? 99));
}

export function TopbarGlobalSearch({
  visibleModules,
  className,
  inputClassName,
  placeholder,
}: {
  visibleModules: AppModule[];
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const visibleSet = useMemo(() => new Set(visibleModules), [visibleModules]);

  const fuse = useMemo(() => {
    const entries = buildSearchEntries().filter((e) => visibleSet.has(e.module));
    return new Fuse(entries, {
      keys: [
        { name: "label", weight: 3 },
        { name: "keywords", weight: 2 },
        { name: "module", weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
    });
  }, [visibleSet]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || !isFocused) return [];
    const raw = fuse.search(trimmed);
    return sortByModuleOrder(raw.map((r) => r.item));
  }, [query, fuse, isFocused]);

  const highlightResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [] as { entry: SearchEntry; highlighted: { char: string; highlight: boolean }[] }[];
    const raw = fuse.search(trimmed);
    return raw.map((r) => {
      const labelMatch = r.matches?.find((m) => m.key === "label");
      const indices = (labelMatch?.indices ?? []) as unknown as ReadonlyArray<[number, number]>;
      return {
        entry: r.item,
        highlighted: highlightMatch(r.item.label, indices),
      };
    });
  }, [query, fuse]);

  const visibleTargetMap = useMemo(() => {
    return new Map(
      targetPriority.filter((target) => visibleSet.has(target.module)).map((target) => [target.module, target.href]),
    );
  }, [visibleSet]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const item = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function resolveRoute(rawQuery: string) {
    const parsed = extractSearchTarget(rawQuery);
    const finalQuery = parsed.query;
    if (!finalQuery) return null;

    if (parsed.module && visibleTargetMap.has(parsed.module)) {
      return { href: visibleTargetMap.get(parsed.module)!, query: finalQuery };
    }

    const currentTarget = targetPriority.find(
      (target) => visibleTargetMap.has(target.module) && (pathname === target.href || pathname.startsWith(`${target.href}/`)),
    );

    if (currentTarget) {
      return { href: currentTarget.href, query: finalQuery };
    }

    const fallback = targetPriority.find((target) => visibleTargetMap.has(target.module));
    if (!fallback) return null;

    return { href: fallback.href, query: finalQuery };
  }

  function navigate(href: string) {
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();
    router.push(href);
  }

  function onSelect(entry: SearchEntry) {
    navigate(entry.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev < highlightResults.length - 1 ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : highlightResults.length - 1));
    } else if (event.key === "Enter" && highlightResults.length > 0) {
      event.preventDefault();
      onSelect(highlightResults[selectedIndex].entry);
    } else if (event.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (highlightResults.length > 0) {
      onSelect(highlightResults[selectedIndex].entry);
      return;
    }
    const target = resolveRoute(query);
    if (!target) return;
    router.push(`${target.href}?q=${encodeURIComponent(target.query)}`);
  }

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f93ab]" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || "Cauta in modulul activ sau foloseste proiect:, lucrare:, client:, document:, financiar:"}
        className={cn(
          "h-10 rounded-lg border-[var(--border)] bg-[linear-gradient(180deg,rgba(20,31,45,0.95),rgba(15,25,37,0.95))] pl-9 pr-28",
          inputClassName,
        )}
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-[4.4rem] top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-[var(--border)] bg-[rgba(15,24,34,0.9)] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          aria-label="Curata cautarea"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 inline-flex h-7 -translate-y-1/2 items-center rounded-md border border-[var(--border)] bg-[rgba(15,24,34,0.85)] px-2.5 text-[11px] font-semibold text-[var(--muted-strong)] transition hover:border-[var(--border-strong)]"
      >
        Cauta
      </button>
      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-[var(--border)] bg-[rgba(15,25,37,0.98)] p-1 shadow-xl backdrop-blur-sm"
        >
          {highlightResults.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-[var(--muted)]">
              Niciun rezultat pentru &quot;{query.trim()}&quot;
            </li>
          ) : (
            highlightResults.map((item, index) => (
              <li
                key={item.entry.href}
                onMouseDown={() => onSelect(item.entry)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-[rgba(59,130,246,0.15)] text-[var(--foreground)]"
                    : "text-[var(--muted-strong)] hover:bg-[rgba(59,130,246,0.08)]",
                )}
              >
                <span className="truncate">
                  {item.highlighted.map((part, i) =>
                    part.highlight ? (
                      <mark key={i} className="rounded-sm bg-[rgba(59,130,246,0.3)] px-0.5 text-[var(--foreground)]">
                        {part.char}
                      </mark>
                    ) : (
                      <span key={i}>{part.char}</span>
                    ),
                  )}
                </span>
                <span className="ml-auto shrink-0 text-[11px] text-[var(--muted)]">{item.entry.href}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
