import type { z } from "zod";

export type FieldErrors = Record<string, string[]>;

export type ActionState = {
	ok: boolean;
	message?: string;
	errors?: FieldErrors;
};

export const initialActionState: ActionState = { ok: false };

export function successAction(message?: string): ActionState {
	return { ok: true, message };
}

export function fromZodError(error: z.ZodError): ActionState {
	return {
		ok: false,
		message: "Date invalide. Verifica campurile marcate.",
		errors: error.flatten().fieldErrors,
	};
}
