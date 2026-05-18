import { type FgoInvoiceStatus, InvoiceStatus } from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ClientProfitabilityChart } from "@/src/components/dashboard/client-profitability-chart";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FormModal } from "@/src/components/forms/form-modal";
import { FgoStatusBadge } from "@/src/components/invoices/fgo-status-badge";
import { FgoSummaryCard } from "@/src/components/invoices/fgo-widget";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { ListItemSlim } from "@/src/components/ui/list-item";
import { PageHeader } from "@/src/components/ui/page-header";
import { resolveAccessScope } from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
	buildListHref,
	parseEnumParam,
	parsePositiveIntParam,
	resolvePagination,
} from "@/src/lib/query-params";
import { hasPermission } from "@/src/lib/rbac";
import { formatCurrency } from "@/src/lib/utils";
import { sendInvoiceToFgo } from "../facturi/actions";
import { deleteCostEntry, deleteInvoice, updateInvoiceStatus } from "./actions";
import { CostEntryForm } from "./cost-entry-form";

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
	DRAFT: "Draft",
	SENT: "Trimisa",
	PARTIAL_PAID: "Partial achitata",
	PAID: "Achitata",
	OVERDUE: "Restanta",
	CANCELED: "Anulata",
};
const dateFormatter = new Intl.DateTimeFormat("ro-RO");
const invoiceWorkflowOrder: InvoiceStatus[] = [
	InvoiceStatus.DRAFT,
	InvoiceStatus.SENT,
	InvoiceStatus.PARTIAL_PAID,
	InvoiceStatus.OVERDUE,
	InvoiceStatus.PAID,
	InvoiceStatus.CANCELED,
];

function buildFinanciarHref({
	page,
	status,
	projectId,
}: {
	page?: number;
	status?: InvoiceStatus | null;
	projectId?: string;
}) {
	return buildListHref("/financiar", {
		page,
		status: status || undefined,
		projectId,
	});
}

function InvoiceFilters({
	statusFilter,
	params,
	projects,
}: {
	statusFilter: InvoiceStatus | undefined;
	params: { projectId?: string };
	projects: { id: string; title: string }[];
}) {
	return (
		<form className="grid gap-2 sm:grid-cols-[auto_auto_auto]">
			<input type="hidden" name="page" value="1" />
			<select
				name="status"
				defaultValue={statusFilter || ""}
				className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] sm:h-11"
			>
				<option value="">Toate statusurile</option>
				{Object.values(InvoiceStatus).map((s) => (
					<option key={s} value={s}>
						{invoiceStatusLabels[s]}
					</option>
				))}
			</select>
			<select
				name="projectId"
				defaultValue={params.projectId || ""}
				className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--foreground)] sm:h-11"
			>
				<option value="">Toate proiectele</option>
				{projects.map((p) => (
					<option key={p.id} value={p.id}>
						{p.title}
					</option>
				))}
			</select>
			<Button type="submit" variant="secondary">
				Filtreaza
			</Button>
		</form>
	);
}

function InvoiceListItem({
	invoice,
	canUpdateInvoice,
	canDeleteFinancial,
}: {
	invoice: {
		invoiceNumber: string;
		project: { title: string };
		client: { name: string };
		dueDate: Date;
		issueDate: Date | null;
		paidAt: Date | null;
		fgoStatus: FgoInvoiceStatus | null;
		totalAmount: { toString(): string };
		status: string;
		id: string;
	};
	canUpdateInvoice: boolean;
	canDeleteFinancial: boolean;
}) {
	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] p-3 text-sm">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<span className="font-medium text-[var(--foreground)]">
						{invoice.invoiceNumber} · {invoice.project.title} ·{" "}
						{invoice.client.name}
					</span>
					<p className="mt-0.5 text-xs text-[var(--muted)]">
						Scadenta {dateFormatter.format(invoice.dueDate)}
						{invoice.issueDate
							? ` · Emisa ${dateFormatter.format(invoice.issueDate)}`
							: ""}
						{invoice.paidAt
							? ` · Incasata ${dateFormatter.format(invoice.paidAt)}`
							: ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<FgoStatusBadge status={invoice.fgoStatus} />
					<span className="font-semibold tabular-nums text-[var(--foreground)]">
						{formatCurrency(invoice.totalAmount.toString())}
					</span>
					<Badge
						tone={
							invoice.status === "OVERDUE"
								? "danger"
								: invoice.status === "PAID"
									? "success"
									: "warning"
						}
					>
						{invoiceStatusLabels[invoice.status as InvoiceStatus]}
					</Badge>
				</div>
			</div>
			{(canUpdateInvoice || canDeleteFinancial) && (
				<div className="mt-2 flex flex-wrap items-center gap-2">
					{canUpdateInvoice && (
						<form
							action={updateInvoiceStatus}
							className="flex items-center gap-1"
						>
							<input type="hidden" name="id" value={invoice.id} />
							<select
								name="status"
								defaultValue={invoice.status}
								className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-1)] px-2 text-xs"
							>
								{Object.values(InvoiceStatus).map((s) => (
									<option key={s} value={s}>
										{invoiceStatusLabels[s]}
									</option>
								))}
							</select>
							<Button type="submit" size="sm" variant="secondary">
								Actualizeaza
							</Button>
						</form>
					)}
					{canUpdateInvoice && !invoice.fgoStatus && (
						<form action={sendInvoiceToFgo} className="inline">
							<input type="hidden" name="invoiceId" value={invoice.id} />
							<Button size="sm" variant="secondary">
								FGO
							</Button>
						</form>
					)}
					{canUpdateInvoice &&
						invoice.fgoStatus &&
						!["SUBMITTED_OK", "SENT_TO_ANAF", "SIGNED"].includes(
							invoice.fgoStatus,
						) && (
							<form action={sendInvoiceToFgo} className="inline">
								<input type="hidden" name="invoiceId" value={invoice.id} />
								<Button size="sm" variant="secondary">
									Retrimite
								</Button>
							</form>
						)}
					{canDeleteFinancial && (
						<form action={deleteInvoice}>
							<input type="hidden" name="id" value={invoice.id} />
							<ConfirmSubmitButton
								text="Sterge"
								variant="destructive"
								confirmMessage={`Confirmi stergerea facturii ${invoice.invoiceNumber}?`}
							/>
						</form>
					)}
				</div>
			)}
		</div>
	);
}

function CostCard({
	entry,
	canDeleteFinancial,
}: {
	entry: {
		description: string;
		project: { title: string };
		type: string;
		occurredAt: Date;
		amount: { toString(): string };
		id: string;
	};
	canDeleteFinancial: boolean;
}) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="font-semibold text-[var(--foreground)]">
						{entry.description}
					</p>
					<p className="text-xs text-[var(--muted)]">
						{entry.project.title} • {entry.type} •{" "}
						{dateFormatter.format(entry.occurredAt)}
					</p>
				</div>
				<div className="text-right">
					<p className="font-semibold text-[var(--foreground)]">
						{formatCurrency(entry.amount.toString())}
					</p>
					{canDeleteFinancial && (
						<form action={deleteCostEntry} className="mt-2">
							<input type="hidden" name="id" value={entry.id} />
							<ConfirmSubmitButton
								text="Sterge cost"
								variant="destructive"
								confirmMessage="Confirmi stergerea definitiva a acestui cost?"
							/>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

export default async function FinanciarPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; status?: string; projectId?: string }>;
}) {
	const params = await searchParams;
	const page = parsePositiveIntParam(params.page);
	const statusFilter = parseEnumParam(
		params.status,
		Object.values(InvoiceStatus),
	);
	const pageSize = 15;
	const session = await auth();
	const scope = session?.user
		? await resolveAccessScope({
				id: session.user.id,
				email: session.user.email,
				roleKeys: session.user.roleKeys || [],
			})
		: { projectIds: null, teamId: null };
	const roleKeys = session?.user?.roleKeys || [];
	const userEmail = session?.user?.email || null;
	const canCreateCost = hasPermission(
		roleKeys,
		"INVOICES",
		"CREATE",
		userEmail,
	);
	const canUpdateInvoice = hasPermission(
		roleKeys,
		"INVOICES",
		"UPDATE",
		userEmail,
	);
	const canDeleteFinancial = hasPermission(
		roleKeys,
		"INVOICES",
		"DELETE",
		userEmail,
	);
	const canExportInvoices = hasPermission(
		roleKeys,
		"INVOICES",
		"EXPORT",
		userEmail,
	);
	const scopedProjectFilter =
		scope.projectIds === null
			? undefined
			: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] };
	const invoiceScopeWhere = {
		...(scope.projectIds === null ? {} : { projectId: scopedProjectFilter }),
		...(params.projectId
			? {
					projectId:
						scope.projectIds === null ||
						scope.projectIds.includes(params.projectId)
							? params.projectId
							: "__none__",
				}
			: {}),
	};
	const invoiceWhere = { ...invoiceScopeWhere, status: statusFilter };

	const [
		totalInvoices,
		costs,
		projects,
		invoiceStatusSummary,
		recentCostEntries,
		fgoStatusSummary,
	] = await Promise.all([
		prisma.invoice.count({ where: invoiceWhere }),
		prisma.costEntry.groupBy({
			by: ["type"],
			where:
				scope.projectIds === null
					? undefined
					: { projectId: scopedProjectFilter },
			_sum: { amount: true },
		}),
		prisma.project.findMany({
			where: {
				deletedAt: null,
				...(scope.projectIds === null ? {} : { id: scopedProjectFilter }),
			},
			select: { id: true, title: true },
			orderBy: [{ title: "asc" }, { id: "asc" }],
		}),
		prisma.invoice.groupBy({
			by: ["status"],
			where: invoiceScopeWhere,
			_count: { _all: true },
			_sum: { totalAmount: true, paidAmount: true },
		}),
		prisma.costEntry.findMany({
			where:
				scope.projectIds === null
					? undefined
					: { projectId: scopedProjectFilter },
			select: {
				id: true,
				type: true,
				description: true,
				amount: true,
				occurredAt: true,
				project: { select: { title: true } },
			},
			orderBy: [{ occurredAt: "desc" }, { id: "asc" }],
			take: 20,
		}),
		prisma.invoice.groupBy({
			by: ["fgoStatus"],
			where: { ...invoiceScopeWhere, fgoStatus: { not: null } },
			_count: { _all: true },
		}),
	]);
	const { totalPages, currentPage, skip, take } = resolvePagination({
		page,
		totalItems: totalInvoices,
		pageSize,
	});
	const [invoices, projectCostSums, projectInvoiceSums] = await Promise.all([
		prisma.invoice.findMany({
			where: invoiceWhere,
			select: {
				id: true,
				invoiceNumber: true,
				totalAmount: true,
				dueDate: true,
				issueDate: true,
				fgoSentAt: true,
				fgoStatus: true,
				fgoTrackingId: true,
				paidAt: true,
				status: true,
				project: { select: { id: true, title: true } },
				client: { select: { name: true } },
			},
			orderBy: [{ dueDate: "asc" }, { id: "asc" }],
			skip,
			take,
		}),
		prisma.costEntry.groupBy({
			by: ["projectId"],
			where:
				scope.projectIds === null
					? undefined
					: { projectId: scopedProjectFilter },
			_sum: { amount: true },
		}),
		prisma.invoice.groupBy({
			by: ["projectId"],
			where:
				scope.projectIds === null
					? undefined
					: { projectId: scopedProjectFilter },
			_sum: { totalAmount: true },
		}),
	]);
	const costByProject = new Map(
		projectCostSums.map((item) => [
			item.projectId,
			Number(item._sum.amount || 0),
		]),
	);
	const invoicedByProject = new Map(
		projectInvoiceSums.map((item) => [
			item.projectId,
			Number(item._sum.totalAmount || 0),
		]),
	);
	const statusSummaryMap = new Map(
		invoiceStatusSummary.map((item) => [item.status, item]),
	);

	const chartData = projects.flatMap((project) => {
		const revenue = invoicedByProject.get(project.id) || 0;
		const costsVal = costByProject.get(project.id) || 0;
		const profit = revenue - costsVal;
		return revenue > 0 || costsVal > 0
			? [
					{
						name:
							project.title.length > 20
								? `${project.title.substring(0, 20)}...`
								: project.title,
						revenue,
						costs: costsVal,
						profit,
					},
				]
			: [];
	});
	const outstandingAmount = invoiceStatusSummary
		.filter(
			(item) =>
				item.status !== InvoiceStatus.PAID &&
				item.status !== InvoiceStatus.CANCELED,
		)
		.reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0);
	const _paidAmount = invoiceStatusSummary
		.filter((item) => item.status === InvoiceStatus.PAID)
		.reduce((sum, item) => sum + Number(item._sum.paidAmount || 0), 0);
	const totalInvoiced = invoiceStatusSummary.reduce(
		(sum, s) => sum + Number(s._sum.totalAmount || 0),
		0,
	);
	const totalCosts = costs.reduce(
		(sum, c) => sum + Number(c._sum.amount || 0),
		0,
	);
	const netProfit = totalInvoiced - totalCosts;

	return (
		<PermissionGuard resource="INVOICES" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title="Financiar"
					subtitle="Facturi, costuri, marja si cashflow"
					actions={
						<div className="flex gap-2">
							{canExportInvoices && (
								<Link href="/api/export/financiar">
									<Button variant="secondary">Export CSV</Button>
								</Link>
							)}
							{canCreateCost && (
								<FormModal
									triggerLabel="Adauga cost"
									title="Cost operational nou"
									description="Asociaza costul unui proiect."
								>
									<CostEntryForm
										projects={projects.map((p) => ({
											id: p.id,
											label: p.title,
										}))}
									/>
								</FormModal>
							)}
						</div>
					}
				/>
				<section className="page-kpis">
					<KpiCard
						label="Total facturat"
						value={formatCurrency(totalInvoiced)}
						helper="facturi emise"
						severity="info"
					/>
					<KpiCard
						label="Costuri"
						value={formatCurrency(totalCosts)}
						helper="operationale"
						severity={totalCosts > totalInvoiced ? "blocked" : "pending"}
					/>
					<KpiCard
						label="Profit net"
						value={formatCurrency(netProfit)}
						helper={`marja ${totalInvoiced > 0 ? ((netProfit / totalInvoiced) * 100).toFixed(1) : "0.0"}%`}
						severity={netProfit >= 0 ? "active" : "blocked"}
					/>
					<KpiCard
						label="Restante"
						value={formatCurrency(outstandingAmount)}
						helper="neincasat"
						severity={outstandingAmount > 0 ? "pending" : "done"}
					/>
				</section>
				{chartData.length > 0 && <ClientProfitabilityChart data={chartData} />}
				<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					<Card>
						<div className="flex flex-wrap gap-1.5">
							{invoiceWorkflowOrder.map((status) => {
								const count = statusSummaryMap.get(status)?._count._all || 0;
								return (
									<Link
										key={status}
										href={buildFinanciarHref({
											page: 1,
											status,
											projectId: params.projectId,
										})}
										className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)] transition-colors"
									>
										{invoiceStatusLabels[status]} ({count})
									</Link>
								);
							})}
						</div>
					</Card>
				</section>
				{fgoStatusSummary.length > 0 && (
					<FgoSummaryCard
						stats={{
							sent: fgoStatusSummary
								.filter((s) =>
									["SUBMITTED_OK", "SENT_TO_ANAF", "SIGNED"].includes(
										s.fgoStatus ?? "",
									),
								)
								.reduce((a, s) => a + s._count._all, 0),
							pending: fgoStatusSummary
								.filter((s) =>
									[
										"DRAFT_UPLOADED",
										"PENDING_VALIDATION",
										"VALIDATION_OK",
									].includes(s.fgoStatus ?? ""),
								)
								.reduce((a, s) => a + s._count._all, 0),
							errors: fgoStatusSummary
								.filter((s) =>
									[
										"VALIDATION_ERRORS",
										"SUBMITTED_ERRORS",
										"REJECTED",
									].includes(s.fgoStatus ?? ""),
								)
								.reduce((a, s) => a + s._count._all, 0),
						}}
					/>
				)}
				<InvoiceFilters
					statusFilter={statusFilter}
					params={params}
					projects={projects}
				/>
				{invoices.length === 0 ? (
					<Card>
						<p className="text-sm text-[var(--muted)]">
							Nu exista facturi pentru filtrele curente.
						</p>
					</Card>
				) : (
					<Card>
						<div className="space-y-1">
							{invoices.map((invoice) => (
								<InvoiceListItem
									key={invoice.id}
									invoice={invoice}
									canUpdateInvoice={canUpdateInvoice}
									canDeleteFinancial={canDeleteFinancial}
								/>
							))}
						</div>
					</Card>
				)}
				<div className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
					<span>
						Pagina{" "}
						<span className="font-medium text-[var(--foreground)]">
							{currentPage}
						</span>{" "}
						din{" "}
						<span className="font-medium text-[var(--foreground)]">
							{totalPages}
						</span>
					</span>
					<div className="flex gap-2">
						{currentPage > 1 && (
							<Link
								href={buildFinanciarHref({
									page: currentPage - 1,
									status: statusFilter,
									projectId: params.projectId,
								})}
								className="flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--surface-2)]"
							>
								Anterior
							</Link>
						)}
						{currentPage < totalPages && (
							<Link
								href={buildFinanciarHref({
									page: currentPage + 1,
									status: statusFilter,
									projectId: params.projectId,
								})}
								className="flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--surface-2)]"
							>
								Urmator
							</Link>
						)}
					</div>
				</div>
				<Card>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
								Costuri
							</p>
							<h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
								Costuri recente
							</h2>
						</div>
						<Badge tone={recentCostEntries.length > 0 ? "info" : "neutral"}>
							{recentCostEntries.length} inregistrari
						</Badge>
					</div>
					<div className="mt-3 space-y-2">
						{recentCostEntries.length === 0 ? (
							<p className="text-sm text-[var(--muted)]">
								Nu exista costuri recente in aria ta.
							</p>
						) : (
							recentCostEntries.map((entry) => (
								<CostCard
									key={entry.id}
									entry={entry}
									canDeleteFinancial={canDeleteFinancial}
								/>
							))
						)}
					</div>
				</Card>
				<Card>
					<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
						Marje
					</p>
					<h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
						Cashflow si marja estimata pe proiect
					</h2>
					<div className="mt-3 space-y-1">
						{projects.length === 0 ? (
							<ListItemSlim className="text-[var(--muted)]">
								Nu exista proiecte in aria ta pentru calculul de marja.
							</ListItemSlim>
						) : null}
						{projects.map((project) => {
							const costTotal = costByProject.get(project.id) || 0;
							const invoiced = invoicedByProject.get(project.id) || 0;
							const margin = invoiced - costTotal;
							return (
								<div
									key={project.id}
									className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]"
								>
									<p className="font-semibold text-[var(--foreground)]">
										{project.title}
									</p>
									<p className="text-xs text-[var(--muted)]">
										Cost: {formatCurrency(costTotal)} • Facturat:{" "}
										{formatCurrency(invoiced)} • Marja: {formatCurrency(margin)}
									</p>
								</div>
							);
						})}
					</div>
				</Card>
			</div>
		</PermissionGuard>
	);
}
