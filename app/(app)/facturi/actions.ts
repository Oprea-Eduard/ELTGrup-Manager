"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/src/lib/activity-log";
import { uploadInvoiceToFgo } from "@/src/lib/fgo";
import type { FgoInvoicePayload } from "@/src/lib/fgo.types";
import { requirePermission } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";

const sendSchema = z.object({
	invoiceId: z.string().min(1, "ID factura lipsa"),
});

export async function sendInvoiceToFgo(formData: FormData): Promise<void> {
	try {
		const user = await requirePermission("INVOICES", "UPDATE");

		const parsed = sendSchema.safeParse({
			invoiceId: formData.get("invoiceId"),
		});
		if (!parsed.success) {
			throw new Error("ID factura invalid");
		}

		const invoice = await prisma.invoice.findUnique({
			where: { id: parsed.data.invoiceId },
			include: {
				project: { select: { code: true, title: true, siteAddress: true } },
				client: {
					select: {
						name: true,
						cui: true,
						vatCode: true,
						registrationNumber: true,
						billingAddress: true,
					},
				},
			},
		});

		if (!invoice) throw new Error("Factura negasita");

		if (
			invoice.fgoStatus === "SUBMITTED_OK" ||
			invoice.fgoStatus === "SENT_TO_ANAF" ||
			invoice.fgoStatus === "SIGNED"
		) {
			throw new Error("Factura a fost deja transmisa la ANAF");
		}

		const payload: FgoInvoicePayload = {
			invoiceNumber: invoice.invoiceNumber,
			issueDate: invoice.issueDate.toISOString().split("T")[0],
			dueDate: invoice.dueDate.toISOString().split("T")[0],
			baseAmount: Number(invoice.baseAmount),
			vatRate: Number(invoice.vatRate),
			vatAmount: Number(invoice.vatAmount),
			totalAmount: Number(invoice.totalAmount),
			currency: "RON",
			client: {
				name: invoice.client.name,
				cui: invoice.client.cui || "",
				registrationNumber: invoice.client.registrationNumber || "",
				vatCode: invoice.client.vatCode || "",
				address: invoice.client.billingAddress || "",
			},
			project: {
				code: invoice.project.code,
				title: invoice.project.title,
			},
			items: [
				{
					name: `Servicii proiect ${invoice.project.code}`,
					quantity: 1,
					unitPrice: Number(invoice.totalAmount),
					totalPrice: Number(invoice.totalAmount),
				},
			],
		};

		const result = await uploadInvoiceToFgo(payload);

		await prisma.invoice.update({
			where: { id: parsed.data.invoiceId },
			data: {
				fgoTrackingId: result.ok ? result.trackingId : undefined,
				fgoStatus: result.status,
				fgoErrorCode: result.ok ? null : (result.errors[0]?.code ?? null),
				fgoSentAt: new Date(),
				fgoRespondedAt: new Date(),
			},
		});

		await logActivity({
			userId: user.id,
			entityType: "INVOICE",
			entityId: parsed.data.invoiceId,
			action: result.ok ? "INVOICE_SENT_FGO" : "INVOICE_FGO_ERROR",
			diff: {
				trackingId: result.ok ? result.trackingId : undefined,
				status: result.status,
				errors: result.ok ? undefined : result.errors,
			},
		});

		revalidatePath("/financiar");
		if (invoice.projectId) revalidatePath(`/proiecte/${invoice.projectId}`);
	} catch (error) {
		console.error("FGO send error:", error);
	}
}
