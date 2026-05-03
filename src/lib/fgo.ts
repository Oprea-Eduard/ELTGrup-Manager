import { FgoInvoiceStatus } from "@prisma/client";
import type { FgoConfig, FgoInvoicePayload, FgoResult } from "./fgo.types";

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;

function config(): FgoConfig {
  const sandbox = process.env.FGO_ENV !== "production";
  return {
    oauthUrl:
      process.env.FGO_OAUTH_URL ||
      (sandbox ? "https://sandbox.anaf.ro/oauth" : "https://logincert.anaf.ro/oauth"),
    apiUrl:
      process.env.FGO_API_URL ||
      (sandbox ? "https://sandbox.anaf.ro/api" : "https://api.anaf.ro/prod"),
    clientId: process.env.FGO_CLIENT_ID || "",
    clientSecret: process.env.FGO_CLIENT_SECRET || "",
  };
}

function isEnabled(): boolean {
  return process.env.EFATURA_ENABLED === "true";
}

function isSandbox(): boolean {
  return process.env.FGO_ENV !== "production";
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function ok(trackingId: string, status: FgoInvoiceStatus): FgoResult {
  return { ok: true, trackingId, status };
}

function err(status: FgoInvoiceStatus, code: string, message: string): FgoResult {
  return { ok: false, status, errors: [{ code, message }] };
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(): Promise<string | null> {
  if (isSandbox()) return "sandbox-token";

  const cached = tokenCache.get("fgo");
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const cfg = config();
  if (!cfg.clientId || !cfg.clientSecret) return null;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    scope: "upload",
  });

  try {
    const res = await fetch(`${cfg.oauthUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;

    const expiresAt = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
    tokenCache.set("fgo", { token: data.access_token, expiresAt });
    return data.access_token;
  } catch {
    return null;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = RETRY_COUNT,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15_000),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (res.ok || res.status < 500) {
        return { ok: res.ok, status: res.status, data };
      }
    } catch {
      // transient error, retry
    }
    if (attempt < maxRetries) await delay(RETRY_DELAY_MS * (attempt + 1));
  }
  return { ok: false, status: 503, data: {} };
}

function sandboxInvoiceResponse(payload: FgoInvoicePayload): FgoResult {
  const roll = Math.random();
  if (roll < 0.6) {
    // 60% success
    return ok(`SANDBOX-${Date.now()}-${Math.floor(Math.random() * 100000)}`, "SUBMITTED_OK");
  }
  if (roll < 0.8) {
    // 20% validation errors
    return err("VALIDATION_ERRORS", "VALIDATION_001", "CIF client invalid in baza ANAF");
  }
  if (roll < 0.9) {
    // 10% pending
    return ok(`SANDBOX-PENDING-${Date.now()}`, "PENDING_VALIDATION");
  }
  // 10% rejected
  return err("REJECTED", "REJECTION_001", "Factura respinsa: data emiterii incorecta");
}

function buildAnafXmlPayload(payload: FgoInvoicePayload): string {
  const itemsXml = payload.items
    .map(
      (item, i) => `
    <detaliuFactura>
      <numarCrt>${i + 1}</numarCrt>
      <denumire>${escapeXml(item.name)}</denumire>
      <cantitate>${item.quantity}</cantitate>
      <pretUnitar>${item.unitPrice.toFixed(2)}</pretUnitar>
      <valoare>${item.totalPrice.toFixed(2)}</valoare>
    </detaliuFactura>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<factura xmlns="http://www.anaf.ro/FGO">
  <antet>
    <numarFactura>${escapeXml(payload.invoiceNumber)}</numarFactura>
    <dataEmiterii>${payload.issueDate}</dataEmiterii>
    <dataScadentei>${payload.dueDate}</dataScadentei>
    <moneda>${payload.currency}</moneda>
  </antet>
  <furnizor>
    <denumire>${escapeXml(payload.client.name)}</denumire>
    <cui>${escapeXml(payload.client.cui)}</cui>
    <nrRegCom>${escapeXml(payload.client.registrationNumber)}</nrRegCom>
    <codTVA>${escapeXml(payload.client.vatCode)}</codTVA>
    <adresa>${escapeXml(payload.client.address)}</adresa>
  </furnizor>
  <dateFactura>
    ${itemsXml}
  </dateFactura>
  <totaluri>
    <bazaImpozabila>${payload.baseAmount.toFixed(2)}</bazaImpozabila>
    <cotaTVA>${payload.vatRate.toFixed(2)}</cotaTVA>
    <valoareTVA>${payload.vatAmount.toFixed(2)}</valoareTVA>
    <totalFactura>${payload.totalAmount.toFixed(2)}</totalFactura>
  </totaluri>
</factura>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildJsonPayload(payload: FgoInvoicePayload): string {
  return JSON.stringify({
    invoiceNumber: payload.invoiceNumber,
    issueDate: payload.issueDate,
    dueDate: payload.dueDate,
    currency: payload.currency,
    client: {
      name: payload.client.name,
      cui: payload.client.cui,
      registrationNumber: payload.client.registrationNumber,
      vatCode: payload.client.vatCode,
      address: payload.client.address,
    },
    total: {
      baseAmount: payload.baseAmount,
      vatRate: payload.vatRate,
      vatAmount: payload.vatAmount,
      totalAmount: payload.totalAmount,
    },
    items: payload.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    projectCode: payload.project.code,
  });
}

export async function uploadInvoiceToFgo(payload: FgoInvoicePayload): Promise<FgoResult> {
  if (!isEnabled()) {
    return err("DRAFT_UPLOADED", "FGO_DISABLED", "eFactura este dezactivata in .env");
  }

  if (isSandbox()) {
    await delay(600 + Math.random() * 900);
    return sandboxInvoiceResponse(payload);
  }

  const token = await getAccessToken();
  if (!token) {
    return err("DRAFT_UPLOADED", "OAUTH_FAILED", "Nu s-a putut obtine token de acces FGO");
  }

  const body = process.env.FGO_FORMAT === "XML" ? buildAnafXmlPayload(payload) : buildJsonPayload(payload);
  const contentType = process.env.FGO_FORMAT === "XML" ? "application/xml" : "application/json";

  const response = await fetchWithRetry(`${config().apiUrl}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body,
  });

  if (!response.ok) {
    return err("SUBMITTED_ERRORS", `HTTP_${response.status}`, "Eroare la transmiterea facturii catre ANAF");
  }

  const trackingId = (response.data.trackingId ?? response.data.id ?? crypto.randomUUID()) as string;
  return ok(trackingId, "SUBMITTED_OK");
}

export async function checkFgoStatus(trackingId: string): Promise<FgoResult> {
  if (!isEnabled()) {
    return err("DRAFT_UPLOADED", "FGO_DISABLED", "eFactura dezactivata");
  }

  if (isSandbox()) {
    await delay(300 + Math.random() * 500);
    return ok(trackingId, "SUBMITTED_OK");
  }

  const token = await getAccessToken();
  if (!token) {
    return err("DRAFT_UPLOADED", "OAUTH_FAILED", "Token FGO indisponibil");
  }

  const response = await fetchWithRetry(`${config().apiUrl}/status/${trackingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return err("SUBMITTED_ERRORS", `HTTP_${response.status}`, "Eroare la verificarea statusului FGO");
  }

  const rawStatus = (response.data.status as string | undefined) ?? "SUBMITTED_OK";
  const status = rawStatus.toUpperCase();

  const validStatuses: FgoInvoiceStatus[] = [
    "DRAFT_UPLOADED", "PENDING_VALIDATION", "VALIDATION_OK", "VALIDATION_ERRORS",
    "SENT_TO_ANAF", "SIGNED", "SUBMITTED_OK", "SUBMITTED_ERRORS", "REJECTED",
  ];

  const mappedStatus: FgoInvoiceStatus = validStatuses.includes(status as FgoInvoiceStatus)
    ? (status as FgoInvoiceStatus)
    : "SUBMITTED_OK";

  return ok(trackingId, mappedStatus);
}

export async function cancelFgoInvoice(trackingId: string): Promise<FgoResult> {
  if (!isEnabled()) return err("DRAFT_UPLOADED", "FGO_DISABLED", "eFactura dezactivata");
  if (isSandbox()) return ok(trackingId, "REJECTED");

  const token = await getAccessToken();
  if (!token) return err("DRAFT_UPLOADED", "OAUTH_FAILED", "Token FGO indisponibil");

  const response = await fetchWithRetry(`${config().apiUrl}/cancel/${trackingId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return err("SUBMITTED_ERRORS", `HTTP_${response.status}`, "Eroare la anularea facturii FGO");
  }

  return ok(trackingId, "REJECTED");
}
