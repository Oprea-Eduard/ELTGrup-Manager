"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/src/components/ui/button";

function addDays(date: Date, n: number) {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function formatLabel(weekStart: Date) {
	const end = addDays(weekStart, 6);
	const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
	if (weekStart.getMonth() !== end.getMonth()) {
		return `${weekStart.toLocaleDateString("ro-RO", fmt)} – ${end.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}`;
	}
	return `${weekStart.toLocaleDateString("ro-RO", { day: "numeric" })} – ${end.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}`;
}

function getThisMonday() {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dow = today.getDay();
	const monday = new Date(today);
	monday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
	return monday;
}

export function WeekPicker(props: { weekStart: string; viewMode: string }) {
	return (
		<Suspense fallback={null}>
			<WeekPickerContent {...props} />
		</Suspense>
	);
}

function WeekPickerContent({
	weekStart,
	viewMode,
}: {
	weekStart: string;
	viewMode: string;
}) {
	const { push } = useRouter();
	const sp = useSearchParams();
	const start = new Date(weekStart);

	function go(direction: "prev" | "next" | "today") {
		const p = new URLSearchParams(sp.toString());
		if (direction === "today") {
			p.delete("week");
		} else {
			const offset = direction === "prev" ? -7 : 7;
			const target = addDays(start, offset);
			p.set("week", target.toISOString().split("T")[0]);
		}
		if (viewMode === "month") p.set("view", "month");
		push(`/calendar?${p.toString()}`);
	}

	const isCurrent = isSameDay(start, getThisMonday());

	return (
		<div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5">
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => go("prev")}
					aria-label="Saptamana precedenta"
				>
					<ChevronLeft className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => go("today")}
					className="text-xs"
				>
					{isCurrent ? "Sapt. curenta" : "Astazi"}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => go("next")}
					aria-label="Saptamana urmatoare"
				>
					<ChevronRight className="size-4" />
				</Button>
			</div>
			<span className="text-sm font-semibold text-[var(--foreground)]">
				{formatLabel(start)}
			</span>
		</div>
	);
}
