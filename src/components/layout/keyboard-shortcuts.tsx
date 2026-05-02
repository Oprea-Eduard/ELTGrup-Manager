"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const shortcuts: Record<string, { href: string; label: string }> = {
  p: { href: "/proiecte", label: "Proiecte" },
  l: { href: "/lucrari", label: "Lucrari" },
  c: { href: "/clienti", label: "Clienti" },
  f: { href: "/financiar", label: "Financiar" },
  o: { href: "/oferte", label: "Oferte" },
  m: { href: "/materiale", label: "Materiale" },
  d: { href: "/documente", label: "Documente" },
  e: { href: "/echipe", label: "Echipe" },
  t: { href: "/pontaj", label: "Pontaj" },
  n: { href: "/notificari", label: "Notificari" },
  s: { href: "/setari", label: "Setari" },
};

export function KeyboardShortcuts({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();
      const shortcut = shortcuts[key];
      if (shortcut) {
        e.preventDefault();
        router.push(shortcut.href);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, enabled]);

  return null;
}
