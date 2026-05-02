"use client";

import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <table
      className={cn(
        "w-full min-w-full border-collapse text-sm lg:min-w-[760px] [&_tbody_tr:nth-child(even)]:bg-[rgba(15,23,33,0.38)] [&_tbody_tr:hover]:bg-[rgba(35,54,75,0.34)]",
        className,
      )}
    >
      {children}
    </table>
  );
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "top-0 z-[1] border-b border-[var(--border)] bg-[color:color-mix(in_oklab,var(--surface-card)_92%,#162233_8%)] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] lg:sticky lg:px-4 lg:py-2.5",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-[var(--border)] px-3 py-2 align-top text-[var(--muted-strong)] lg:px-4 lg:py-3", className)}>
      {children}
    </td>
  );
}

export function ExpandableRow({
  isExpanded,
  onToggle,
  children,
  className,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn("cursor-pointer", className)}
      >
        <td className="border-b border-[var(--border)] px-1 py-2 align-top lg:px-2 lg:py-3">
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex h-5 w-5 items-center justify-center text-[var(--muted)]"
          >
            <ChevronDown size={14} />
          </motion.span>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <tr key="expanded-content">
            <td colSpan={999} className="border-b border-[var(--border)] p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 py-3 lg:px-4 lg:py-4">{children}</div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
