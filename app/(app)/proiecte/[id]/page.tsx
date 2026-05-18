import {
	type DocumentCategory,
	type InstallationStatus,
	InventoryAssignmentStatus,
	InventoryItemStatus,
	type PermitApplicationStatus,
	type PermitType,
	type Prisma,
	type ProjectStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ActivityTimeline } from "@/src/components/ui/activity-timeline";
import { Badge } from "@/src/components/ui/badge";
import { Breadcrumbs } from "@/src/components/ui/breadcrumbs";
import { Card } from "@/src/components/ui/card";
import { ErrorBoundary } from "@/src/components/ui/error-boundary";
import { ListItemSlim } from "@/src/components/ui/list-item";
import { PageHeader } from "@/src/components/ui/page-header";
import { assertProjectAccess } from "@/src/lib/access-scope";
import { auth } from "@/src/lib/auth";
import { inventoryItemStatusLabels } from "@/src/lib/inventory-labels";
import { prisma } from "@/src/lib/prisma";
import { buildProjectTimeline } from "@/src/lib/timeline";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { PermitTracker } from "../avize/permit-tracker";
import { ExpiryBadge, PhaseOverdueBadge } from "./client-status-badges";
import { ProjectInstallations } from "./project-installations";
import { ProjectPlansSection } from "./project-plans-section";

const documentCategoryLabels: Record<DocumentCategory, string> = {
	CONTRACT: "Contract",
	ANNEX: "Anexa",
	OFFER: "Oferta",
	INVOICE: "Factura",
	DELIVERY_NOTE: "Aviz livrare",
	SITE_REPORT: "Raport santier",
	PHOTO: "Foto",
	COMPLIANCE: "Conformitate",
	PERMIT: "Autorizatie",
	HANDOVER: "Predare",
	OTHER: "Altele",
};

const projectStatusLabels: Record<ProjectStatus, string> = {
	DRAFT: "Schita",
	PLANNED: "Planificat",
	ACTIVE: "Activ",
	BLOCKED: "Blocat",
	COMPLETED: "Finalizat",
	CANCELED: "Anulat",
};

const planSections = [
	{
		key: "fire-detection",
		label: "Detectie incendiu",
		description: "Alarme, detectoare, sprinklere si scenarii de interventie.",
		sampleTag: "plan:fire-detection",
		searchTerms: [
			"fire detection",
			"detecție incendiu",
			"incendiu",
			"sprinkler",
			"alarm",
			"idf",
		],
	},
	{
		key: "electrical",
		label: "Instalatii electrice",
		description: "Circuite de putere, iluminat, tablouri si alimentari.",
		sampleTag: "plan:electrical",
		searchTerms: [
			"electrical",
			"instalatii electrice",
			"electric",
			"tablou",
			"iluminat",
			"power",
		],
	},
	{
		key: "hvac",
		label: "HVAC",
		description: "Ventilatie, climatizare, incalzire si echipamente HVAC.",
		sampleTag: "plan:hvac",
		searchTerms: [
			"hvac",
			"ventilatie",
			"climatizare",
			"aer conditionat",
			"incalzire",
			"vent",
		],
	},
	{
		key: "sanitary-plumbing",
		label: "Sanitar / plumbing",
		description: "Apa, canalizare, drenaj si instalatii sanitare.",
		sampleTag: "plan:sanitary-plumbing",
		searchTerms: [
			"sanitar",
			"plumbing",
			"instalatii sanitare",
			"apa",
			"canalizare",
			"drain",
		],
	},
	{
		key: "low-current",
		label: "Curenti slabi",
		description: "CCTV, acces, interfon, date, BMS si retele low-voltage.",
		sampleTag: "plan:low-current",
		searchTerms: [
			"curenti slabi",
			"low current",
			"low voltage",
			"cctv",
			"interfon",
			"bms",
			"network",
		],
	},
	{
		key: "architecture",
		label: "Arhitectura",
		description:
			"Planse de arhitectura, fatade, sectiuni si detalii de amenajare.",
		sampleTag: "plan:architecture",
		searchTerms: [
			"architecture",
			"arhitectura",
			"arh",
			"fatada",
			"section",
			"layout",
		],
	},
	{
		key: "structure",
		label: "Structura",
		description: "Fundatii, cadre, placi, armare si detalii de rezistenta.",
		sampleTag: "plan:structure",
		searchTerms: [
			"structure",
			"structura",
			"rezistenta",
			"fundatie",
			"beton",
			"armare",
		],
	},
] as const;

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function matchesPlanSection(
	document: {
		title: string;
		fileName: string;
		category: DocumentCategory;
		tags: string[];
	},
	section: (typeof planSections)[number],
) {
	const haystack = normalizeText(
		[
			document.title,
			document.fileName,
			document.category,
			...document.tags,
		].join(" "),
	);
	return (
		document.tags.some((tag) => normalizeText(tag) === section.sampleTag) ||
		section.searchTerms.some((term) => haystack.includes(normalizeText(term)))
	);
}

type ProjectData = {
	id: string;
	title: string;
	code: string;
	siteAddress: string | null;
	status: ProjectStatus;
	contractValue: Prisma.Decimal | null;
	estimatedBudget: Prisma.Decimal | null;
	client: { id: string; name: string } | null;
	manager: { id: string; firstName: string; lastName: string } | null;
	phases: Array<{
		id: string;
		title: string;
		type: string;
		position: number;
		completed: boolean;
		startDate: Date | null;
		endDate: Date | null;
	}>;
	workOrders: Array<{
		id: string;
		title: string;
		status: string;
		priority: string;
		dueDate: Date | null;
	}>;
	materialUsage: Array<{
		id: string;
		quantityUsed: Prisma.Decimal;
		material: { name: string; unitOfMeasure: string };
	}>;
	invoices: Array<{
		id: string;
		invoiceNumber: string;
		totalAmount: Prisma.Decimal;
		dueDate: Date;
		status: string;
	}>;
	costs: Array<{
		id: string;
		amount: Prisma.Decimal;
		type: string;
		description: string;
		occurredAt: Date;
	}>;
	documents: Array<{
		id: string;
		title: string;
		category: DocumentCategory;
		fileName: string;
		version: number;
		isPrivate: boolean;
		createdAt: Date;
		tags: string[];
		expiresAt: Date | null;
		project: { id: string; title: string } | null;
		client: { id: string; name: string } | null;
		workOrder: { id: string; title: string } | null;
	}>;
	dailyReports: Array<{ id: string; reportDate: Date; workCompleted: string }>;
	subcontractors: Array<{
		id: string;
		status: string;
		contractRef: string | null;
		subcontractor: { name: string };
	}>;
	installations: Array<unknown>;
	permitApplications: Array<unknown>;
	inventoryAssignments: Array<unknown>;
};

function StatusCardsRow({
	project,
	totalCost,
	totalInvoiced,
	revenueBasis: _revenueBasis,
	estimatedMargin,
	estimatedMarginPercent,
}: {
	project: ProjectData;
	totalCost: number;
	totalInvoiced: number;
	revenueBasis: number;
	estimatedMargin: number;
	estimatedMarginPercent: number;
}) {
	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
			<Card>
				<p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
					Status
				</p>
				<div className="mt-2">
					<Badge
						tone={
							project.status === "ACTIVE"
								? "success"
								: project.status === "BLOCKED"
									? "danger"
									: "neutral"
						}
					>
						{projectStatusLabels[project.status]}
					</Badge>
				</div>
			</Card>
			<Card>
				<p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
					Buget estimat
				</p>
				<p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
					{formatCurrency(project.estimatedBudget?.toString() || 0)}
				</p>
			</Card>
			<Card>
				<p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
					Cost real
				</p>
				<p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
					{formatCurrency(totalCost)}
				</p>
			</Card>
			<Card>
				<p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
					Facturat
				</p>
				<p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
					{formatCurrency(totalInvoiced)}
				</p>
			</Card>
			<Card>
				<p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
					Marja estimata
				</p>
				<p
					className={`mt-2 text-xl font-semibold ${estimatedMargin < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
				>
					{formatCurrency(estimatedMargin)}
				</p>
				<p className="mt-1 text-xs text-[var(--muted)]">
					{estimatedMarginPercent.toFixed(1)}% din venit
				</p>
			</Card>
		</section>
	);
}

function WorkOrdersAndPhasesSection({ project }: { project: ProjectData }) {
	return (
		<section className="grid gap-4 xl:grid-cols-3">
			<Card className="xl:col-span-2">
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Lucrari active
				</h2>
				<div className="mt-3 space-y-2">
					{project.workOrders.length === 0 ? (
						<ListItemSlim className="text-[var(--muted)]">
							Nu exista lucrari active pe acest proiect.
						</ListItemSlim>
					) : null}
					{project.workOrders.map((task) => (
						<ListItemSlim key={task.id} className="flex-col items-start gap-1">
							<p className="font-semibold text-[var(--foreground)]">
								{task.title}
							</p>
							<p className="text-xs text-[var(--muted-strong)]">
								Status {task.status} • Prioritate {task.priority} • Termen{" "}
								{task.dueDate ? formatDate(task.dueDate) : "-"}
							</p>
						</ListItemSlim>
					))}
				</div>
			</Card>
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Faze proiect
				</h2>
				<div className="mt-3 space-y-2">
					{project.phases.length === 0 ? (
						<ListItemSlim className="text-[var(--muted)]">
							Nu exista faze definite pentru acest proiect.
						</ListItemSlim>
					) : null}
					{project.phases.map((phase) => {
						const phaseTypeLabels: Record<string, string> = {
							OFERTARE: "Ofertare",
							PROIECTARE: "Proiectare",
							AVIZ_ISU: "Aviz ISU",
							AVIZ_SSM: "Aviz SSM",
							AVIZ_POMPIERI: "Aviz Pompieri",
							EXECUTIE: "Executie",
							RECEPTIE_PSI: "Receptie PSI",
							MENTENANTA: "Mentenanta",
						};
						return (
							<ListItemSlim
								key={phase.id}
								className={`flex-col items-start gap-1.5 ${phase.completed ? "border-l-2 border-l-[var(--success)]/30" : ""}`}
							>
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-[var(--muted)]">
										{String(phase.position).padStart(2, "0")}
									</span>
									<p className="font-semibold text-[var(--foreground)]">
										{phase.title}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${phase.completed ? "bg-[var(--success)]/15 text-[var(--success)]" : phase.type === "AVIZ_ISU" ? "bg-[var(--danger)]/15 text-[var(--danger)]" : "bg-[var(--info)]/15 text-[var(--info)]"}`}
									>
										{phaseTypeLabels[phase.type] || phase.type}
									</span>
									{phase.startDate ? (
										<span className="text-[11px] text-[var(--muted)]">
											{formatDate(phase.startDate)}
											{phase.endDate ? ` → ${formatDate(phase.endDate)}` : ""}
										</span>
									) : null}
									<PhaseOverdueBadge
										endDate={phase.endDate}
										phaseCompleted={phase.completed}
										formatDate={formatDate}
									/>
								</div>
							</ListItemSlim>
						);
					})}
				</div>
			</Card>
		</section>
	);
}

function InventorySection({ project }: { project: ProjectData }) {
	return (
		<Card>
			<div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
				<div>
					<h2 className="text-lg font-semibold text-[var(--foreground)]">
						Scule si echipamente pe proiect
					</h2>
					<p className="mt-1 text-sm text-[var(--muted)]">
						Trasabilitate pentru ce este in teren, la cine este predat si ce
						stoc mai ramane disponibil.
					</p>
				</div>
				<Link
					href={`/gestiune-scule?q=${encodeURIComponent(project.code)}`}
					className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
				>
					Deschide gestiune scule
				</Link>
			</div>
			<div className="mt-3 space-y-1">
				{project.inventoryAssignments.length === 0 ? (
					<ListItemSlim className="text-[var(--muted)]">
						Nu exista scule active alocate pe acest proiect.
					</ListItemSlim>
				) : null}
				{(
					project.inventoryAssignments as {
						id: string;
						quantity: number;
						item: {
							name: string;
							internalCode: string;
							status: string;
							unitOfMeasure: string;
							quantityAvailable: number;
						};
						issuedToUser: { firstName: string; lastName: string };
					}[]
				).map((assignment) => (
					<ListItemSlim
						key={assignment.id}
						className="flex-col items-start gap-1"
					>
						<div className="flex flex-wrap items-center justify-between gap-2 w-full">
							<p className="font-semibold text-[var(--foreground)]">
								{assignment.item.name} ({assignment.item.internalCode})
							</p>
							<Badge
								tone={
									assignment.item.status === InventoryItemStatus.AVAILABLE
										? "success"
										: assignment.item.status === InventoryItemStatus.ASSIGNED
											? "info"
											: "warning"
								}
							>
								{
									inventoryItemStatusLabels[
										assignment.item.status as InventoryItemStatus
									]
								}
							</Badge>
						</div>
						<p className="text-xs text-[var(--muted)]">
							Predat catre {assignment.issuedToUser.firstName}{" "}
							{assignment.issuedToUser.lastName} • Cantitate{" "}
							{Number(assignment.quantity).toFixed(2)}{" "}
							{assignment.item.unitOfMeasure}
						</p>
						<p className="text-xs text-[var(--muted)]">
							Disponibil in stoc:{" "}
							{Number(assignment.item.quantityAvailable).toFixed(2)}{" "}
							{assignment.item.unitOfMeasure}
						</p>
					</ListItemSlim>
				))}
			</div>
		</Card>
	);
}

function DocumentsSection({
	project,
	generalDocuments,
}: {
	project: ProjectData;
	generalDocuments: unknown[];
}) {
	return (
		<section className="grid gap-4 xl:grid-cols-2">
			<Card className="xl:col-span-2">
				<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
					<div>
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							Documente asociate
						</h2>
						<p className="mt-1 text-sm text-[var(--muted)]">
							Contracte, rapoarte, imagini, avize si alte fisiere care nu se
							incadreaza in sectiunea de planuri.
						</p>
					</div>
					<Link
						href={`/documente?projectId=${project.id}`}
						className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3.5 text-sm font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
					>
						Deschide in Documente
					</Link>
				</div>
				<div className="mt-3 grid gap-3 md:grid-cols-2">
					{generalDocuments.length === 0 ? (
						<p className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm text-[var(--muted)] md:col-span-2">
							Nu exista alte documente asociate acestui proiect.
						</p>
					) : null}
					{(
						generalDocuments as {
							id: string;
							title: string;
							fileName: string;
							createdAt: Date;
							isPrivate: boolean;
							category: DocumentCategory;
							expiresAt: Date | null;
							workOrder: { id: string; title: string } | null;
							client: { id: string; name: string } | null;
						}[]
					).map((doc) => (
						<div
							key={doc.id}
							className="rounded-2xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-4 text-sm"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 space-y-1">
									<p className="truncate font-semibold text-[var(--foreground)]">
										{doc.title}
									</p>
									<p className="text-xs text-[var(--muted)]">
										{doc.fileName} • {formatDate(doc.createdAt)}
									</p>
								</div>
								<Badge tone={doc.isPrivate ? "neutral" : "success"}>
									{doc.isPrivate ? "Privat" : "Public"}
								</Badge>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								<Badge tone="info">
									{documentCategoryLabels[doc.category as DocumentCategory]}
								</Badge>
								<ExpiryBadge
									expiresAt={doc.expiresAt}
									formatDate={formatDate}
								/>
							</div>
							<div className="mt-3 flex flex-wrap gap-2">
								<a
									href={`/api/documents/${doc.id}/download`}
									target="_blank"
									rel="noreferrer noopener"
									className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)]"
								>
									Deschide
								</a>
								{doc.workOrder && (
									<Link
										href={`/lucrari/${doc.workOrder.id}`}
										className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
									>
										Lucrare
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</Card>
		</section>
	);
}

function ConsumablesAndInvoicesSection({ project }: { project: ProjectData }) {
	return (
		<section className="grid gap-4 xl:grid-cols-2">
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Consum materiale
				</h2>
				<div className="mt-3 space-y-2 text-sm">
					{project.materialUsage.length === 0 ? (
						<p className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm text-[var(--muted)]">
							Nu exista consum de materiale inregistrat.
						</p>
					) : null}
					{project.materialUsage.map((item) => (
						<div
							key={item.id}
							className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3"
						>
							<p className="font-semibold text-[var(--foreground)]">
								{item.material.name}
							</p>
							<p className="text-xs text-[var(--muted-strong)]">
								Consum: {item.quantityUsed.toString()}{" "}
								{item.material.unitOfMeasure}
							</p>
						</div>
					))}
				</div>
			</Card>
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Facturi
				</h2>
				<div className="mt-3 space-y-2 text-sm">
					{project.invoices.length === 0 ? (
						<p className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm text-[var(--muted)]">
							Nu exista facturi asociate acestui proiect.
						</p>
					) : null}
					{project.invoices.map((invoice) => (
						<div
							key={invoice.id}
							className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3"
						>
							<p className="font-semibold text-[var(--foreground)]">
								{invoice.invoiceNumber}
							</p>
							<p className="text-xs text-[var(--muted-strong)]">
								{formatCurrency(invoice.totalAmount.toString())} • Scadenta{" "}
								{formatDate(invoice.dueDate)} • {invoice.status}
							</p>
						</div>
					))}
				</div>
			</Card>
		</section>
	);
}

function ReportsAndSubcontractorsSection({
	project,
}: {
	project: ProjectData;
}) {
	return (
		<section className="grid gap-4 xl:grid-cols-2">
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Rapoarte zilnice
				</h2>
				<div className="mt-3 space-y-2 text-sm">
					{project.dailyReports.length === 0 ? (
						<p className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm text-[var(--muted)]">
							Nu exista rapoarte zilnice in acest moment.
						</p>
					) : null}
					{project.dailyReports.map((report) => (
						<div
							key={report.id}
							className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3"
						>
							<p className="font-semibold text-[var(--foreground)]">
								{formatDate(report.reportDate)}
							</p>
							<p className="text-xs text-[var(--muted-strong)]">
								{report.workCompleted}
							</p>
						</div>
					))}
				</div>
			</Card>
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Subcontractori
				</h2>
				<div className="mt-3 grid gap-2 md:grid-cols-2">
					{project.subcontractors.length === 0 ? (
						<p className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm text-[var(--muted)] md:col-span-2">
							Nu exista subcontractori alocati pe acest proiect.
						</p>
					) : null}
					{project.subcontractors.map((assignment) => (
						<div
							key={assignment.id}
							className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3 text-sm"
						>
							<p className="font-semibold text-[var(--foreground)]">
								{assignment.subcontractor.name}
							</p>
							<p className="text-xs text-[var(--muted-strong)]">
								Status {assignment.status} • Contract{" "}
								{assignment.contractRef || "-"}
							</p>
						</div>
					))}
				</div>
			</Card>
		</section>
	);
}

async function ProjectDetailContent({ id }: { id: string }) {
	const project = (await prisma.project.findUnique({
		where: { id, deletedAt: null },
		select: {
			id: true,
			title: true,
			code: true,
			siteAddress: true,
			status: true,
			contractValue: true,
			estimatedBudget: true,
			client: { select: { id: true, name: true } },
			manager: { select: { id: true, firstName: true, lastName: true } },
			phases: {
				select: {
					id: true,
					title: true,
					type: true,
					position: true,
					completed: true,
					startDate: true,
					endDate: true,
				},
				orderBy: [{ position: "asc" }, { id: "asc" }],
			},
			workOrders: {
				where: { deletedAt: null },
				select: {
					id: true,
					title: true,
					status: true,
					priority: true,
					dueDate: true,
				},
				orderBy: [{ dueDate: "asc" }, { id: "asc" }],
				take: 15,
			},
			materialUsage: {
				select: {
					id: true,
					quantityUsed: true,
					material: { select: { name: true, unitOfMeasure: true } },
				},
				orderBy: [{ loggedAt: "desc" }, { id: "asc" }],
				take: 10,
			},
			invoices: {
				select: {
					id: true,
					invoiceNumber: true,
					totalAmount: true,
					dueDate: true,
					status: true,
				},
				orderBy: [{ dueDate: "desc" }, { id: "asc" }],
				take: 10,
			},
			costs: {
				select: {
					id: true,
					amount: true,
					type: true,
					description: true,
					occurredAt: true,
				},
				orderBy: [{ occurredAt: "desc" }, { id: "asc" }],
				take: 12,
			},
			documents: {
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				take: 30,
				select: {
					id: true,
					title: true,
					category: true,
					fileName: true,
					version: true,
					isPrivate: true,
					createdAt: true,
					tags: true,
					expiresAt: true,
					project: { select: { id: true, title: true } },
					client: { select: { id: true, name: true } },
					workOrder: { select: { id: true, title: true } },
				},
			},
			dailyReports: {
				select: { id: true, reportDate: true, workCompleted: true },
				orderBy: [{ reportDate: "desc" }, { id: "asc" }],
				take: 10,
			},
			subcontractors: {
				select: {
					id: true,
					status: true,
					contractRef: true,
					subcontractor: { select: { name: true } },
				},
				orderBy: { id: "asc" },
				take: 10,
			},
			installations: {
				where: { deletedAt: null },
				select: {
					id: true,
					name: true,
					manufacturer: true,
					model: true,
					serialNumber: true,
					warrantyMonths: true,
					installedAt: true,
					certifiedAt: true,
					nextCheckAt: true,
					status: true,
					notes: true,
				},
				orderBy: [{ status: "asc" }, { name: "asc" }],
			},
			permitApplications: {
				select: {
					id: true,
					type: true,
					status: true,
					submittedAt: true,
					responseDate: true,
					notes: true,
					rejectionReason: true,
				},
				orderBy: [{ submittedAt: "desc" }, { id: "asc" }],
			},
			inventoryAssignments: {
				where: {
					status: {
						in: [
							InventoryAssignmentStatus.ACTIVE,
							InventoryAssignmentStatus.PARTIAL_RETURNED,
						],
					},
				},
				select: {
					id: true,
					quantity: true,
					item: {
						select: {
							id: true,
							name: true,
							internalCode: true,
							quantityAvailable: true,
							unitOfMeasure: true,
							status: true,
						},
					},
					issuedToUser: { select: { firstName: true, lastName: true } },
				},
				orderBy: [{ issuedAt: "desc" }, { id: "asc" }],
				take: 15,
			},
		},
	})) as ProjectData | null;

	if (!project) notFound();

	const totalCost = project.costs.reduce(
		(sum, cost) => sum + Number(cost.amount),
		0,
	);
	const totalInvoiced = project.invoices.reduce(
		(sum, invoice) => sum + Number(invoice.totalAmount),
		0,
	);
	const revenueBasis =
		totalInvoiced > 0 ? totalInvoiced : Number(project.contractValue || 0);
	const estimatedMargin = revenueBasis - totalCost;
	const estimatedMarginPercent =
		revenueBasis > 0 ? (estimatedMargin / revenueBasis) * 100 : 0;
	const timeline = await buildProjectTimeline(id, 40);
	const planDocumentIds = new Set<string>();
	const planGroups = planSections.map((section) => {
		const docs = project.documents.filter(
			(doc) => !planDocumentIds.has(doc.id) && matchesPlanSection(doc, section),
		);
		docs.forEach((doc) => {
			planDocumentIds.add(doc.id);
		});
		return { ...section, docs };
	});
	const generalDocuments = project.documents.filter(
		(doc) => !planDocumentIds.has(doc.id),
	);
	const planDocumentCount = planGroups.reduce(
		(sum, group) => sum + group.docs.length,
		0,
	);

	return (
		<>
			<StatusCardsRow
				project={project}
				totalCost={totalCost}
				totalInvoiced={totalInvoiced}
				revenueBasis={revenueBasis}
				estimatedMargin={estimatedMargin}
				estimatedMarginPercent={estimatedMarginPercent}
			/>
			<WorkOrdersAndPhasesSection project={project} />
			<InventorySection project={project} />
			<PermissionGuard resource="PROJECTS" action="UPDATE">
				<Card>
					<div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								Instalatii tehnice
							</h2>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Echipamente instalate, certificari si urmatoare verificari.
							</p>
						</div>
					</div>
					<ErrorBoundary
						fallback={
							<p className="text-sm text-[var(--danger)]">
								Eroare la incarcarea instalatiilor.
							</p>
						}
					>
						<ProjectInstallations
							installations={
								project.installations as {
									id: string;
									name: string;
									manufacturer: string;
									model: string | null;
									serialNumber: string | null;
									warrantyMonths: number | null;
									installedAt: Date | null;
									certifiedAt: Date | null;
									nextCheckAt: Date | null;
									status: InstallationStatus;
									notes: string | null;
								}[]
							}
							projectId={project.id}
						/>
					</ErrorBoundary>
				</Card>
			</PermissionGuard>
			<ErrorBoundary
				fallback={
					<p className="text-sm text-[var(--danger)]">
						Eroare la incarcarea avizelor.
					</p>
				}
			>
				<PermitTracker
					permits={
						project.permitApplications as {
							id: string;
							type: PermitType;
							status: PermitApplicationStatus;
							submittedAt: Date | null;
							responseDate: Date | null;
							rejectionReason: string | null;
							notes: string | null;
						}[]
					}
					projectId={project.id}
				/>
			</ErrorBoundary>
			<ErrorBoundary
				fallback={
					<p className="text-sm text-[var(--danger)]">
						Eroare la incarcarea planurilor.
					</p>
				}
			>
				<ProjectPlansSection
					planGroups={planGroups}
					generalDocuments={generalDocuments}
					planDocumentCount={planDocumentCount}
					projectId={project.id}
				/>
			</ErrorBoundary>
			<DocumentsSection project={project} generalDocuments={generalDocuments} />
			<ConsumablesAndInvoicesSection project={project} />
			<ReportsAndSubcontractorsSection project={project} />
			<Card>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Timeline proiect (operational)
				</h2>
				<p className="mt-1 text-xs text-[var(--muted)]">
					Un singur fir cronologic pentru update-uri, documente, costuri,
					materiale, lucrari si facturi.
				</p>
				<div className="mt-3">
					<ActivityTimeline events={timeline} />
				</div>
			</Card>
		</>
	);
}

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, session] = await Promise.all([params, auth()]);
	if (session?.user) {
		await assertProjectAccess(
			{
				id: session.user.id,
				email: session.user.email,
				roleKeys: session.user.roleKeys || [],
			},
			id,
		).catch(() => notFound());
	}

	const project = await prisma.project.findUnique({
		where: { id, deletedAt: null },
		select: {
			id: true,
			title: true,
			code: true,
			siteAddress: true,
			status: true,
			client: { select: { name: true } },
		},
	});
	if (!project) notFound();

	return (
		<PermissionGuard resource="PROJECTS" action="VIEW">
			<div className="space-y-6">
				<Breadcrumbs
					items={[
						{ label: "Proiecte", href: "/proiecte" },
						{ label: `${project.code} — ${project.title}` },
					]}
				/>
				<PageHeader
					title={project.title}
					subtitle={`${project.code} • ${project.client.name} • ${project.siteAddress}`}
					actions={
						<div className="flex flex-wrap gap-2">
							<Link
								href={`/calendar?projectId=${project.id}`}
								className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
							>
								Calendar
							</Link>
							<Link
								href={`/pontaj?projectId=${project.id}`}
								className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
							>
								Pontaj
							</Link>
							<Link
								href={`/rapoarte-zilnice?projectId=${project.id}`}
								className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
							>
								Rapoarte
							</Link>
							<Link
								href="/proiecte"
								className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-semibold text-[var(--muted-strong)] hover:border-[var(--border-strong)]"
							>
								Inapoi
							</Link>
						</div>
					}
				/>
				<ErrorBoundary
					fallback={
						<p className="text-sm text-[var(--danger)]">
							Eroare la incarcarea detaliilor proiectului.
						</p>
					}
				>
					<Suspense fallback={<div className="shimmer h-96 rounded-2xl" />}>
						<ProjectDetailContent id={id} />
					</Suspense>
				</ErrorBoundary>
			</div>
		</PermissionGuard>
	);
}
