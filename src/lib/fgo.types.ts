import type { FgoInvoiceStatus } from "@prisma/client";

export type FgoResult =
	| { ok: true; trackingId: string; status: FgoInvoiceStatus }
	| {
			ok: false;
			status: FgoInvoiceStatus;
			errors: Array<{ code: string; message: string }>;
	  };

export type FgoConfig = {
	oauthUrl: string;
	apiUrl: string;
	clientId: string;
	clientSecret: string;
};

export type FgoInvoicePayload = {
	invoiceNumber: string;
	issueDate: string;
	dueDate: string;
	baseAmount: number;
	vatRate: number;
	vatAmount: number;
	totalAmount: number;
	currency: string;
	client: {
		name: string;
		cui: string;
		registrationNumber: string;
		vatCode: string;
		address: string;
	};
	project: {
		code: string;
		title: string;
	};
	items: Array<{
		name: string;
		quantity: number;
		unitPrice: number;
		totalPrice: number;
	}>;
};

export const FGO_STATUS_LABELS: Record<FgoInvoiceStatus, string> = {
	DRAFT_UPLOADED: "Incarcata in sistem",
	PENDING_VALIDATION: "In validare ANAF",
	VALIDATION_OK: "Validata",
	VALIDATION_ERRORS: "Erori de validare",
	SENT_TO_ANAF: "Trimisa la ANAF",
	SIGNED: "Semnata",
	SUBMITTED_OK: "Transmisa cu succes",
	SUBMITTED_ERRORS: "Eroare la transmitere",
	REJECTED: "Respinsa",
};

export const FGO_STATUS_TONES: Record<
	FgoInvoiceStatus,
	"neutral" | "info" | "warning" | "danger" | "success"
> = {
	DRAFT_UPLOADED: "neutral",
	PENDING_VALIDATION: "info",
	VALIDATION_OK: "success",
	VALIDATION_ERRORS: "danger",
	SENT_TO_ANAF: "info",
	SIGNED: "success",
	SUBMITTED_OK: "success",
	SUBMITTED_ERRORS: "danger",
	REJECTED: "danger",
};

export const FGO_STATUS_ORDER: FgoInvoiceStatus[] = [
	"DRAFT_UPLOADED",
	"PENDING_VALIDATION",
	"VALIDATION_OK",
	"SENT_TO_ANAF",
	"SIGNED",
	"SUBMITTED_OK",
	"VALIDATION_ERRORS",
	"SUBMITTED_ERRORS",
	"REJECTED",
];

export function getFgoProgressPercent(status: FgoInvoiceStatus): number {
	const idx = FGO_STATUS_ORDER.indexOf(status);
	if (idx === -1) return 0;
	const terminalErrorIdx = FGO_STATUS_ORDER.indexOf("VALIDATION_ERRORS");
	if (idx >= terminalErrorIdx) return 100;
	return Math.round((idx / FGO_STATUS_ORDER.indexOf("SUBMITTED_OK")) * 100);
}
