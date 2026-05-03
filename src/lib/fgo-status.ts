import { FgoInvoiceStatus } from "@prisma/client";

const STATUS_MAP: Record<string, FgoInvoiceStatus> = {
  DRAFT_UPLOADED: "DRAFT_UPLOADED",
  PENDING_VALIDATION: "PENDING_VALIDATION",
  VALIDATION_OK: "VALIDATION_OK",
  VALIDATION_ERRORS: "VALIDATION_ERRORS",
  SENT_TO_ANAF: "SENT_TO_ANAF",
  SIGNED: "SIGNED",
  SUBMITTED_OK: "SUBMITTED_OK",
  SUBMITTED_ERRORS: "SUBMITTED_ERRORS",
  REJECTED: "REJECTED",
};

const VALID_STATUSES = new Set(Object.keys(STATUS_MAP));

export function toFgoInvoiceStatus(raw: string | null | undefined): FgoInvoiceStatus | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (VALID_STATUSES.has(upper)) return STATUS_MAP[upper];
  return null;
}
