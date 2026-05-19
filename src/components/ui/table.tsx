"use client";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function Table({
	className,
	children,
	compact,
	...rest
}: {
	className?: string;
	children: ReactNode;
	compact?: boolean;
} & React.HTMLAttributes<HTMLTableElement>) {
	return (
		<table
			className={cn(
				"w-full border-collapse text-sm",
				"[&_tbody_tr]:border-b [&_tbody_tr]:border-[var(--border)]",
				"[&_tbody_tr:hover]:bg-[var(--surface-raised)]",
				compact && "[&_td]:py-1.5 [&_th]:py-1.5",
				className,
			)}
			{...rest}
		>
			{children}
		</table>
	);
}

export function TH({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<th
			className={cn(
				"sticky top-0 z-[2] bg-[var(--surface)] px-3 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] border-b border-[var(--border-visible)] lg:px-4",
				className,
			)}
		>
			{children}
		</th>
	);
}

export function TD({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<td
			className={cn(
				"px-3 py-2.5 text-[var(--text-primary)] lg:px-4",
				className,
			)}
		>
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
		<LazyMotion features={domAnimation}>
			<tr onClick={onToggle} className={cn("cursor-pointer", className)}>
				<td className="px-1 py-2 lg:px-2 lg:py-3">
					<m.span
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="flex size-5 items-center justify-center text-[var(--text-secondary)]"
					>
						<ChevronDown size={14} />
					</m.span>
				</td>
			</tr>
			<AnimatePresence initial={false}>
				{isExpanded && (
					<tr key="expanded-content">
						<td colSpan={999} className="p-0">
							<m.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="overflow-hidden"
							>
								<div className="px-3 py-3 lg:px-4 lg:py-4">{children}</div>
							</m.div>
						</td>
					</tr>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
