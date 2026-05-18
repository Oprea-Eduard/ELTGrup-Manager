"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { initialActionState } from "@/src/lib/action-state";
import { createEquipmentAction } from "./actions";

export function EquipmentCreateForm() {
	const [state, formAction, pending] = useActionState(
		createEquipmentAction,
		initialActionState,
	);

	useEffect(() => {
		if (state.ok && state.message) toast.success(state.message);
		if (!state.ok && state.message) toast.error(state.message);
	}, [state]);

	return (
		<form
			action={formAction}
			className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
		>
			<div>
				<Input name="code" placeholder="Cod intern" required />
				{state.errors?.code ? (
					<p className="mt-1 text-xs text-[var(--danger)]">
						{state.errors.code[0]}
					</p>
				) : null}
			</div>
			<div>
				<Input name="name" placeholder="Denumire" required />
				{state.errors?.name ? (
					<p className="mt-1 text-xs text-[var(--danger)]">
						{state.errors.name[0]}
					</p>
				) : null}
			</div>
			<Input name="serialNumber" placeholder="Serie" />
			<Input name="category" placeholder="Categorie" />
			<Input name="maintenanceDueAt" type="date" />
			<div className="md:col-span-2 xl:col-span-4 flex justify-end">
				<Button type="submit" disabled={pending}>
					{pending ? "Se salveaza..." : "Adauga"}
				</Button>
			</div>
		</form>
	);
}
