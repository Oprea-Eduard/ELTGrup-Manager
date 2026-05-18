"use client";

import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { useCallback, useState } from "react";

function getStoredValue(id: string, fallback: boolean): boolean {
	if (typeof window === "undefined") return fallback;
	try {
		const stored = localStorage.getItem(`panou:collapse:${id}`);
		return stored !== null ? stored === "true" : fallback;
	} catch {
		return fallback;
	}
}

function setStoredValue(id: string, value: boolean) {
	try {
		localStorage.setItem(`panou:collapse:${id}`, String(value));
	} catch {
		/* localStorage unavailable */
	}
}

export function CollapsibleSection({
	id,
	title,
	children,
	defaultOpen = true,
}: {
	id: string;
	title: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(() => getStoredValue(id, defaultOpen));

	const toggle = useCallback(() => {
		setOpen((prev) => {
			const next = !prev;
			setStoredValue(id, next);
			return next;
		});
	}, [id]);

	return (
		<div>
			<button
				type="button"
				onClick={toggle}
				className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--muted-strong)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
			>
				{open ? (
					<ChevronDown className="size-4 shrink-0" />
				) : (
					<ChevronRight className="size-4 shrink-0" />
				)}
				{title}
				<span className="ml-auto text-[11px] font-normal text-[var(--muted)]">
					{open ? "restrange" : "expand"}
				</span>
			</button>
			{open && <div className="pt-1">{children}</div>}
		</div>
	);
}

export function DashboardSearch({
	placeholder,
	onChange,
}: {
	placeholder?: string;
	onChange: (value: string) => void;
}) {
	const [value, setValue] = useState("");

	const handleSearchInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const v = e.target.value;
			setValue(v);
			onChange(v);
		},
		[onChange],
	);

	return (
		<div className="relative">
			<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
			<input
				value={value}
				onChange={handleSearchInput}
				placeholder={placeholder || "Cauta in panou..."}
				className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-8 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-strong)]"
			/>
			{value && (
				<button
					type="button"
					onClick={() => {
						setValue("");
						onChange("");
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
}
