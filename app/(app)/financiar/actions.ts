"use server";

import {
	CostType,
	InvoiceStatus,
	NotificationType,
	RoleKey,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertProjectAccess } from "@/src/lib/access-scope";
import { type ActionState, fromZodError } from "@/src/lib/action-state";
import { logActivity } from "@/src/lib/activity-log";
import { buildInvoiceStatusUpdateData } from "@/src/lib/financiar-invoice-status";
import { notifyRoles } from "@/src/lib/notifications";
import { requirePermission } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";

const costSchema = z.object({
	projectId: z.string().cuid(),
	type: z.nativeEnum(CostType),
	description: z.string().trim().min(2),
	amount: z.coerce.number().positive(),
	occurredAt: z.coerce.date(),
});

const updateInvoiceStatusSchema = z.object({
	id: z.string().cuid(),
	status: z.nativeEnum(InvoiceStatus),
});

const deleteInvoiceSchema = z.object({
	id: z.string().cuid(),
});

const deleteCostEntrySchema = z.object({
	id: z.string().cuid(),
});

async function createCostEntryInternal(formData: FormData) {
	const currentUser = await requirePermission("INVOICES", "CREATE");

	const parsed = costSchema.safeParse({
		projectId: formData.get("projectId"),
		type: formData.get("type"),
		description: formData.get("description"),
		amount: formData.get("amount"),
		occurredAt: formData.get("occurredAt"),
	});

	if (!parsed.success) throw parsed.error;
	await assertProjectAccess(currentUser, parsed.data.projectId);

	const entry = await prisma.costEntry.create({
		data: {
			projectId: parsed.data.projectId,
			type: parsed.data.type,
			description: parsed.data.description,
			amount: parsed.data.amount,
			occurredAt: parsed.data.occurredAt,
			approvedById: currentUser.id,
		},
	});

	await logActivity({
		userId: currentUser.id,
		entityType: "COST_ENTRY",
		entityId: entry.id,
		action: "COST_ENTRY_CREATED",
	});

	revalidatePath("/financiar");
	revalidatePath("/panou");
}

export async function createCostEntryAction(
	_: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await createCostEntryInternal(formData);
		return { ok: true, message: "Costul operational a fost adaugat." };
	} catch (error) {
		if (error instanceof z.ZodError) return fromZodError(error);
		return {
			ok: false,
			message:
				error instanceof Error ? error.message : "Eroare la salvare cost",
		};
	}
}

export async function updateInvoiceStatus(formData: FormData): Promise<void> {
	try {
		const currentUser = await requirePermission("INVOICES", "UPDATE");
		const parsed = updateInvoiceStatusSchema.safeParse({
			id: formData.get("id"),
			status: formData.get("status"),
		});
		if (!parsed.success) return;
		const { id, status } = parsed.data;

		const current = await prisma.invoice.findUnique({
			where: { id },
			select: { projectId: true, totalAmount: true, status: true },
		});
		if (!current) return;
		await assertProjectAccess(currentUser, current.projectId);

		const updateData = buildInvoiceStatusUpdateData(
			current.status,
			status,
			current.totalAmount,
		);
		if (!updateData) return;

		const updated = await prisma.invoice.update({
			where: { id },
			data: updateData,
		});

		await logActivity({
			userId: currentUser.id,
			entityType: "INVOICE",
			entityId: updated.id,
			action: "INVOICE_STATUS_UPDATED",
			diff: { status },
		});

		if (status === InvoiceStatus.OVERDUE) {
			await notifyRoles({
				roleKeys: [
					RoleKey.ACCOUNTANT,
					RoleKey.PROJECT_MANAGER,
					RoleKey.ADMINISTRATOR,
				],
				type: NotificationType.INVOICE_OVERDUE,
				title: "Factura restanta",
				message: `Factura ${updated.invoiceNumber} este restanta.`,
				actionUrl: "/financiar",
			});
		}

		revalidatePath("/financiar");
		revalidatePath("/financiar/[id]", "page");
		revalidatePath("/proiecte");
		revalidatePath("/panou");
	} catch {
		// silent fail — form actions bubble errors to error boundaries
	}
}

export async function deleteInvoice(formData: FormData): Promise<void> {
	try {
		const currentUser = await requirePermission("INVOICES", "DELETE");
		const parsed = deleteInvoiceSchema.safeParse({
			id: formData.get("id"),
		});
		if (!parsed.success) return;

		const invoice = await prisma.invoice.findUnique({
			where: { id: parsed.data.id },
			select: {
				id: true,
				projectId: true,
				invoiceNumber: true,
				status: true,
				totalAmount: true,
				deletedAt: true,
			},
		});
		if (!invoice || invoice.deletedAt) return;
		await assertProjectAccess(currentUser, invoice.projectId);

		await prisma.invoice.update({
			where: { id: invoice.id },
			data: { deletedAt: new Date() },
		});

		await logActivity({
			userId: currentUser.id,
			entityType: "INVOICE",
			entityId: invoice.id,
			action: "INVOICE_DELETED",
			diff: {
				invoiceNumber: invoice.invoiceNumber,
				status: invoice.status,
				totalAmount: invoice.totalAmount.toString(),
			},
		});

		revalidatePath("/financiar");
		revalidatePath("/proiecte");
		revalidatePath("/panou");
	} catch {
		// silent fail — form actions bubble errors to error boundaries
	}
}

export async function deleteCostEntry(formData: FormData): Promise<void> {
	try {
		const currentUser = await requirePermission("INVOICES", "DELETE");
		const parsed = deleteCostEntrySchema.safeParse({
			id: formData.get("id"),
		});
		if (!parsed.success) return;

		const costEntry = await prisma.costEntry.findUnique({
			where: { id: parsed.data.id },
			select: {
				id: true,
				projectId: true,
				type: true,
				description: true,
				amount: true,
				occurredAt: true,
				deletedAt: true,
			},
		});
		if (!costEntry || costEntry.deletedAt) return;
		await assertProjectAccess(currentUser, costEntry.projectId);

		await prisma.costEntry.update({
			where: { id: costEntry.id },
			data: { deletedAt: new Date() },
		});

		await logActivity({
			userId: currentUser.id,
			entityType: "COST_ENTRY",
			entityId: costEntry.id,
			action: "COST_ENTRY_DELETED",
			diff: {
				type: costEntry.type,
				description: costEntry.description,
				amount: costEntry.amount.toString(),
				occurredAt: costEntry.occurredAt.toISOString(),
			},
		});

		revalidatePath("/financiar");
		revalidatePath("/proiecte");
		revalidatePath("/panou");
	} catch {
		// silent fail — form actions bubble errors to error boundaries
	}
}
