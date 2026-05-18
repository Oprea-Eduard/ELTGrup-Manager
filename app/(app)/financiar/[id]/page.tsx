import { InvoiceStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FgoStatusBadge } from "@/src/components/invoices/fgo-status-badge";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { sendInvoiceToFgo } from "../../facturi/actions";
import { deleteInvoice, updateInvoiceStatus } from "../actions";

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
	DRAFT: "Ciorna",
	SENT: "Trimisa",
	PARTIAL_PAID: "Platita partial",
	PAID: "Achitata",
	OVERDUE: "Restanta",
	CANCELED: "Anulata",
};

export default async function FinanciarDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, session] = await Promise.all([params, auth()]);
	const roleKeys = session?.user?.roleKeys || [];
	const userEmail = session?.user?.email || null;
	const canUpdate = hasPermission(roleKeys, "INVOICES", "UPDATE", userEmail);
	const canDelete = hasPermission(roleKeys, "INVOICES", "DELETE", userEmail);

	const invoice = await prisma.invoice.findUnique({
		where: { id, deletedAt: null },
		include: {
			client: { select: { id: true, name: true, email: true, phone: true } },
			project: { select: { id: true, code: true, title: true } },
		},
	});

	if (!invoice) notFound();

	const isOverdue =
		invoice.status === "OVERDUE" ||
		(invoice.dueDate < new Date() &&
			invoice.status !== "PAID" &&
			invoice.status !== "CANCELED");

	return (
		<PermissionGuard resource="INVOICES" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title={`Factura ${invoice.invoiceNumber}`}
					subtitle={`${invoice.project.code} · ${invoice.client.name}`}
					actions={
						<div className="flex flex-wrap gap-2">
							<Link href="/financiar">
								<Button variant="secondary">← Inapoi la lista</Button>
							</Link>
							{canUpdate && !invoice.fgoStatus && (
								<form action={sendInvoiceToFgo} className="inline">
									<input type="hidden" name="invoiceId" value={invoice.id} />
									<Button type="submit">Trimite in FGO</Button>
								</form>
							)}
							{canUpdate &&
								invoice.fgoStatus &&
								invoice.fgoStatus !== "SUBMITTED_OK" &&
								invoice.fgoStatus !== "SENT_TO_ANAF" &&
								invoice.fgoStatus !== "SIGNED" && (
									<form action={sendInvoiceToFgo} className="inline">
										<input type="hidden" name="invoiceId" value={invoice.id} />
										<Button type="submit">Retrimite FGO</Button>
									</form>
								)}
						</div>
					}
				/>

				{/* KPIs */}
				<section className="page-kpis">
					<KpiCard
						label="Status"
						value={invoiceStatusLabels[invoice.status]}
						severity={
							invoice.status === "PAID"
								? "done"
								: invoice.status === "OVERDUE"
									? "blocked"
									: invoice.status === "CANCELED"
										? "blocked"
										: "info"
						}
					/>
					<KpiCard
						label="Valoare Totala"
						value={formatCurrency(Number(invoice.totalAmount))}
						helper={`Baza: ${formatCurrency(Number(invoice.baseAmount))} + TVA: ${formatCurrency(Number(invoice.vatAmount))}`}
						severity="info"
					/>
					<KpiCard
						label="Scadenta"
						value={formatDate(invoice.dueDate)}
						helper={isOverdue ? "Restanta" : "In termen"}
						severity={isOverdue ? "blocked" : "active"}
					/>
					<KpiCard
						label="Rest de plata"
						value={formatCurrency(
							Number(invoice.totalAmount) - Number(invoice.paidAmount),
						)}
						helper={`Achitat: ${formatCurrency(Number(invoice.paidAmount))}`}
						severity={
							Number(invoice.totalAmount) - Number(invoice.paidAmount) > 0
								? "pending"
								: "done"
						}
					/>
				</section>

				{/* Detail cards */}
				<div className="grid gap-3 xl:grid-cols-2">
					<Card className="space-y-3">
						<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
							Detalii factura
						</p>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Numar</span>
								<span className="font-medium text-[var(--foreground)]">
									{invoice.invoiceNumber}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--muted)]">Status</span>
								<Badge
									tone={
										invoice.status === "OVERDUE"
											? "danger"
											: invoice.status === "PAID"
												? "success"
												: invoice.status === "CANCELED"
													? "neutral"
													: "warning"
									}
								>
									{invoiceStatusLabels[invoice.status]}
								</Badge>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Data emitere</span>
								<span className="text-[var(--foreground)]">
									{formatDate(invoice.issueDate)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Data scadenta</span>
								<span
									className={`font-medium ${isOverdue ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
								>
									{formatDate(invoice.dueDate)}
								</span>
							</div>
							{invoice.paidAt && (
								<div className="flex justify-between">
									<span className="text-[var(--muted)]">Incasata la</span>
									<span className="text-[var(--success)]">
										{formatDate(invoice.paidAt)}
									</span>
								</div>
							)}
						</div>

						<div className="border-t border-[var(--border)] pt-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted)]">
									Sincronizare FGO
								</span>
								<FgoStatusBadge status={invoice.fgoStatus} />
							</div>
							{invoice.fgoErrorCode && (
								<p className="mt-2 text-xs text-[var(--danger)] bg-[var(--danger)]/10 p-2 rounded">
									Eroare: {invoice.fgoErrorCode}
								</p>
							)}
						</div>

						{invoice.notes && (
							<div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
								<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
									Observatii
								</p>
								<p className="mt-1 text-sm text-[var(--foreground)] whitespace-pre-line">
									{invoice.notes}
								</p>
							</div>
						)}
					</Card>

					<Card className="space-y-3">
						<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
							Client & Proiect
						</p>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Client</span>
								<Link
									href={`/clienti/${invoice.client.id}`}
									className="font-medium text-[var(--accent)] hover:underline"
								>
									{invoice.client.name}
								</Link>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Proiect</span>
								<Link
									href={`/proiecte/${invoice.project.id}`}
									className="font-medium text-[var(--accent)] hover:underline"
								>
									{invoice.project.code}
								</Link>
							</div>
						</div>

						{/* Status change + actions */}
						{canUpdate && (
							<div className="border-t border-[var(--border)] pt-3 space-y-2">
								<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
									Schimba status
								</p>
								<form
									action={updateInvoiceStatus}
									className="flex items-center gap-2"
								>
									<input type="hidden" name="id" value={invoice.id} />
									<select
										name="status"
										defaultValue={invoice.status}
										className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm"
									>
										{Object.values(InvoiceStatus).map((status) => (
											<option key={status} value={status}>
												{invoiceStatusLabels[status]}
											</option>
										))}
									</select>
									<Button type="submit" size="sm" variant="secondary">
										Salveaza
									</Button>
								</form>
							</div>
						)}

						{canDelete && (
							<div className="border-t border-[var(--border)] pt-3">
								<form action={deleteInvoice}>
									<input type="hidden" name="id" value={invoice.id} />
									<ConfirmSubmitButton
										text="Sterge factura"
										confirmMessage={`Confirmi stergerea facturii ${invoice.invoiceNumber}?`}
										variant="destructive"
									/>
								</form>
							</div>
						)}
					</Card>
				</div>
			</div>
		</PermissionGuard>
	);
}
