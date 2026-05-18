"use client";

import { CostType } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { initialActionState } from "@/src/lib/action-state";
import { createCostEntryAction } from "./actions";

type Option = { id: string; label: string };
const costTypeLabels: Record<CostType, string> = {
	LABOR: "Manopera",
	MATERIAL: "Materiale",
	SUBCONTRACTOR: "Subcontractor",
	EQUIPMENT: "Echipamente",
	OTHER: "Altele",
};

function formatDateForInput(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function CostEntryForm({ projects }: { projects: Option[] }) {
	const [state, formAction, pending] = useActionState(
		createCostEntryAction,
		initialActionState,
	);
	const dateInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (dateInputRef.current) {
			dateInputRef.current.value = formatDateForInput(new Date());
		}
	}, []);

	useEffect(() => {
		if (state.ok && state.message) toast.success(state.message);
		if (!state.ok && state.message) toast.error(state.message);
	}, [state]);

	return (
		<form action={formAction} className="mt-3 space-y-4">
			<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
				Cost Registration
			</p>
			<p className="text-xs text-[var(--muted)]">
				Inregistreaza costuri validate in santier sau birou pentru actualizarea
				marjei in timp real.
			</p>
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
				<div className="space-y-1">
					<label>Proiect</label>
					<select name="projectId" required disabled={projects.length === 0}>
						<option value="">Proiect</option>
						{projects.map((project) => (
							<option key={project.id} value={project.id}>
								{project.label}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<label>Tip cost</label>
					<select name="type" defaultValue={CostType.OTHER}>
						{Object.values(CostType).map((type) => (
							<option key={type} value={type}>
								{costTypeLabels[type]}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<label>Descriere</label>
					<Input name="description" placeholder="Descriere" required />
				</div>
				<div className="space-y-1">
					<label>Suma</label>
					<Input
						name="amount"
						type="number"
						step="0.01"
						placeholder="Suma"
						required
					/>
				</div>
				<div className="space-y-1">
					<label>Data</label>
					<Input
						ref={dateInputRef}
						name="occurredAt"
						type="date"
						defaultValue=""
						required
					/>
				</div>
			</div>
			<div className="flex justify-end md:col-span-2 xl:col-span-5">
				<Button type="submit" disabled={pending || projects.length === 0}>
					{pending
						? "Se salveaza..."
						: projects.length === 0
							? "Nu exista proiecte active"
							: "Salveaza cost"}
				</Button>
			</div>
			{state.errors?.amount ? (
				<p className="md:col-span-2 xl:col-span-5 text-xs text-[var(--danger)]">
					{state.errors.amount[0]}
				</p>
			) : null}
		</form>
	);
}
