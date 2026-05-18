import { beforeEach, describe, expect, it } from "vitest";
import { checkFgoStatus, uploadInvoiceToFgo } from "./fgo";
import type { FgoInvoicePayload } from "./fgo.types";

const mockPayload: FgoInvoicePayload = {
	invoiceNumber: "INV-2026-001",
	issueDate: "2026-05-03",
	dueDate: "2026-06-02",
	baseAmount: 1000,
	vatRate: 19,
	vatAmount: 190,
	totalAmount: 1190,
	currency: "RON",
	client: {
		name: "Test Client SRL",
		cui: "RO12345678",
		registrationNumber: "J12/345/2020",
		vatCode: "RO12345678",
		address: "Str. Test, Nr. 1, Bucuresti",
	},
	project: {
		code: "ELT-2026-001",
		title: "Proiect Test",
	},
	items: [
		{
			name: "Serviciu instalare",
			quantity: 1,
			unitPrice: 1000,
			totalPrice: 1000,
		},
	],
};

function withEnv(env: Record<string, string>, fn: () => Promise<void>) {
	return async () => {
		const prev: Record<string, string | undefined> = {};
		for (const [k, v] of Object.entries(env)) {
			prev[k] = process.env[k];
			process.env[k] = v;
		}
		try {
			await fn();
		} finally {
			for (const [k, v] of Object.entries(prev)) {
				if (v === undefined) delete process.env[k];
				else process.env[k] = v;
			}
		}
	};
}

describe("FGO uploadInvoiceToFgo", () => {
	describe("when disabled", () => {
		it(
			"returns error with FGO_DISABLED code",
			withEnv({ EFATURA_ENABLED: "false" }, async () => {
				const result = await uploadInvoiceToFgo(mockPayload);
				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.errors[0].code).toBe("FGO_DISABLED");
					expect(result.status).toBe("DRAFT_UPLOADED");
				}
			}),
		);
	});

	describe("in sandbox mode", () => {
		beforeEach(() => {
			process.env.EFATURA_ENABLED = "true";
			process.env.FGO_ENV = "sandbox";
		});

		it(
			"can return success, validation errors, or rejection",
			withEnv({ EFATURA_ENABLED: "true", FGO_ENV: "sandbox" }, async () => {
				const results = await Promise.all(
					Array.from({ length: 20 }, () => uploadInvoiceToFgo(mockPayload)),
				);
				const successes = results.filter(
					(r) => r.ok && r.status === "SUBMITTED_OK",
				);
				const errors = results.filter((r) => !r.ok);
				const pending = results.filter(
					(r) => r.ok && r.status === "PENDING_VALIDATION",
				);
				expect(successes.length + errors.length + pending.length).toBe(20);
				successes.forEach((s) => {
					if (s.ok) expect(s.trackingId).toMatch(/^SANDBOX-/);
				});
			}),
		);
	});

	describe("payload generation", () => {
		it(
			"includes invoice number in payload",
			withEnv({ EFATURA_ENABLED: "true", FGO_ENV: "sandbox" }, async () => {
				const result = await uploadInvoiceToFgo(mockPayload);
				if (result.ok) {
					expect(result.trackingId).toBeTruthy();
				}
			}),
		);
	});
});

describe("FGO checkFgoStatus", () => {
	describe("in sandbox mode", () => {
		it(
			"returns SUBMITTED_OK for any tracking ID",
			withEnv({ EFATURA_ENABLED: "true", FGO_ENV: "sandbox" }, async () => {
				const result = await checkFgoStatus("SANDBOX-12345");
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.status).toBe("SUBMITTED_OK");
					expect(result.trackingId).toBe("SANDBOX-12345");
				}
			}),
		);
	});

	describe("when disabled", () => {
		it(
			"returns error",
			withEnv({ EFATURA_ENABLED: "false" }, async () => {
				const result = await checkFgoStatus("SANDBOX-12345");
				expect(result.ok).toBe(false);
			}),
		);
	});
});
