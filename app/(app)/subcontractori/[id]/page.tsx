import {
	AssignmentStatus,
	type SubcontractorApprovalStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { Table, TD, TH } from "@/src/components/ui/table";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { formatDate } from "@/src/lib/utils";
import {
	archiveSubcontractor,
	updateSubcontractorAction,
	updateSubcontractorStatus,
} from "../actions";
import { SUBCONTRACTOR_APPROVAL_STATUSES } from "../constants";

const statusMeta: Record<
	SubcontractorApprovalStatus,
	{ label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
	IN_VERIFICARE: { label: "In verificare", tone: "info" },
	APROBAT: { label: "Aprobat", tone: "success" },
	RESPINS: { label: "Respins", tone: "danger" },
	SUSPENDAT: { label: "Suspendat", tone: "warning" },
};

const assignmentStatusLabels: Record<AssignmentStatus, string> = {
	PLANIFICAT: "Planificat",
	ACTIV: "Activ",
	INTRERUPT: "Intrerupt",
	FINALIZAT: "Finalizat",
	ANULAT: "Anulat",
};

function assignmentTone(status: AssignmentStatus) {
	switch (status) {
		case "ACTIV":
			return "success";
		case "FINALIZAT":
			return "neutral";
		case "INTRERUPT":
			return "warning";
		case "PLANIFICAT":
			return "info";
		case "ANULAT":
			return "danger";
		default:
			return "neutral";
	}
}

type SubcontractorFull = {
	id: string;
	name: string;
	cui: string | null;
	contactName: string | null;
	email: string | null;
	phone: string | null;
	notes: string | null;
	approvalStatus: SubcontractorApprovalStatus;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	assignments: Array<{
		id: string;
		projectId: string;
		status: AssignmentStatus;
		contractRef: string | null;
		startDate: Date | null;
		endDate: Date | null;
		project: { id: string; code: string; title: string };
		workOrder: { id: string; title: string } | null;
	}>;
};

function SubcontractorKpiRow({
	subcontractor,
	activeAssignments,
	completedAssignments,
	uniqueProjects,
}: {
	subcontractor: SubcontractorFull;
	activeAssignments: SubcontractorFull["assignments"];
	completedAssignments: SubcontractorFull["assignments"];
	uniqueProjects: Set<string>;
}) {
	const meta = statusMeta[subcontractor.approvalStatus];
	return (
		<section className="page-kpis">
			<KpiCard
				label="Status"
				value={meta.label}
				severity={
					subcontractor.approvalStatus === "APROBAT"
						? "done"
						: subcontractor.approvalStatus === "RESPINS"
							? "blocked"
							: subcontractor.approvalStatus === "SUSPENDAT"
								? "pending"
								: "info"
				}
			/>
			<KpiCard
				label="Alocari active"
				value={String(activeAssignments.length)}
				helper="pe proiecte curente"
				severity={activeAssignments.length > 0 ? "active" : "info"}
			/>
			<KpiCard
				label="Proiecte implicate"
				value={String(uniqueProjects.size)}
				helper="total colaborari"
				severity="info"
			/>
			<KpiCard
				label="Finalizate"
				value={String(completedAssignments.length)}
				helper="alocari incheiate"
				severity="done"
			/>
		</section>
	);
}

function CompanyInfoCard({
	subcontractor,
	canUpdate,
	isArchived,
}: {
	subcontractor: SubcontractorFull;
	canUpdate: boolean;
	isArchived: boolean;
}) {
	return (
		<Card className="space-y-3">
			<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
				Date comerciale
			</p>
			{canUpdate && !isArchived ? (
				<form action={updateSubcontractorAction} className="grid gap-3">
					<input type="hidden" name="id" value={subcontractor.id} />
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
								Denumire firma
							</label>
							<Input name="name" defaultValue={subcontractor.name} required />
						</div>
						<div className="space-y-1">
							<label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
								CUI
							</label>
							<Input name="cui" defaultValue={subcontractor.cui || ""} />
						</div>
						<div className="space-y-1">
							<label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
								Persoana de contact
							</label>
							<Input
								name="contactName"
								defaultValue={subcontractor.contactName || ""}
							/>
						</div>
						<div className="space-y-1">
							<label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
								Email
							</label>
							<Input
								name="email"
								type="email"
								defaultValue={subcontractor.email || ""}
							/>
						</div>
						<div className="space-y-1">
							<label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
								Telefon
							</label>
							<Input name="phone" defaultValue={subcontractor.phone || ""} />
						</div>
					</div>
					<div className="flex justify-end">
						<Button type="submit" size="sm">
							Salveaza modificarile
						</Button>
					</div>
				</form>
			) : (
				<div className="grid gap-2 text-sm">
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">Denumire</span>
						<span className="font-medium text-[var(--foreground)]">
							{subcontractor.name}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">CUI</span>
						<span className="text-[var(--foreground)]">
							{subcontractor.cui || "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">Contact</span>
						<span className="text-[var(--foreground)]">
							{subcontractor.contactName || "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">Email</span>
						<span className="text-[var(--foreground)]">
							{subcontractor.email || "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">Telefon</span>
						<span className="text-[var(--foreground)]">
							{subcontractor.phone || "—"}
						</span>
					</div>
				</div>
			)}
			{subcontractor.notes && (
				<div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
						Observatii
					</p>
					<p className="mt-1 text-sm text-[var(--muted-strong)] whitespace-pre-line">
						{subcontractor.notes}
					</p>
				</div>
			)}
		</Card>
	);
}

function StatusActionsCard({
	subcontractor,
	canUpdate,
	canDelete,
	isArchived,
}: {
	subcontractor: SubcontractorFull;
	canUpdate: boolean;
	canDelete: boolean;
	isArchived: boolean;
}) {
	const meta = statusMeta[subcontractor.approvalStatus];
	return (
		<Card className="space-y-3">
			<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
				Status & Actiuni
			</p>
			<div className="grid gap-2 text-sm">
				<div className="flex justify-between">
					<span className="text-[var(--muted)]">Status curent</span>
					<Badge tone={meta.tone}>{meta.label}</Badge>
				</div>
				<div className="flex justify-between">
					<span className="text-[var(--muted)]">Creat la</span>
					<span className="text-[var(--foreground)]">
						{formatDate(subcontractor.createdAt)}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-[var(--muted)]">Ultima actualizare</span>
					<span className="text-[var(--foreground)]">
						{formatDate(subcontractor.updatedAt)}
					</span>
				</div>
				{isArchived && (
					<div className="flex justify-between">
						<span className="text-[var(--muted)]">Arhivat la</span>
						<span className="text-[var(--danger)]">
							{formatDate(subcontractor.deletedAt ?? "")}
						</span>
					</div>
				)}
			</div>
			{canUpdate && !isArchived && (
				<div className="border-t border-[var(--border)] pt-3 space-y-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
						Schimba status aprobare
					</p>
					<form
						action={updateSubcontractorStatus}
						className="flex items-center gap-2"
					>
						<input type="hidden" name="id" value={subcontractor.id} />
						<select
							name="approvalStatus"
							defaultValue={subcontractor.approvalStatus}
							className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm"
						>
							{SUBCONTRACTOR_APPROVAL_STATUSES.map((status) => (
								<option key={status} value={status}>
									{statusMeta[status].label}
								</option>
							))}
						</select>
						<Button type="submit" size="sm" variant="secondary">
							Actualizeaza
						</Button>
					</form>
				</div>
			)}
			{canDelete && !isArchived && (
				<div className="border-t border-[var(--border)] pt-3">
					<form action={archiveSubcontractor}>
						<input type="hidden" name="id" value={subcontractor.id} />
						<ConfirmSubmitButton
							text="Arhiveaza subcontractor"
							confirmMessage={`Confirmi arhivarea subcontractorului ${subcontractor.name}?`}
							variant="destructive"
						/>
					</form>
				</div>
			)}
			{isArchived && (
				<div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
					<p className="text-sm text-[var(--muted)]">
						Subcontractorul este arhivat. Datele sunt disponibile doar in mod
						read-only.
					</p>
				</div>
			)}
		</Card>
	);
}

function AssignmentsTable({
	subcontractor,
	activeAssignments,
}: {
	subcontractor: SubcontractorFull;
	activeAssignments: SubcontractorFull["assignments"];
}) {
	return (
		<Card className="flush">
			<div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
				<div>
					<p className="text-sm font-semibold text-[var(--foreground)]">
						Alocari pe proiecte
					</p>
					<p className="text-xs text-[var(--muted)]">
						{subcontractor.assignments.length} alocari totale ·{" "}
						{activeAssignments.length} active
					</p>
				</div>
				<Badge tone="info">{subcontractor.assignments.length} alocari</Badge>
			</div>
			{subcontractor.assignments.length === 0 ? (
				<div className="p-4">
					<p className="text-sm text-[var(--muted)]">
						Acest subcontractor nu a fost alocat pe niciun proiect.
					</p>
				</div>
			) : (
				<Table>
					<thead>
						<tr>
							<TH>Proiect</TH>
							<TH>Lucrare</TH>
							<TH>Ref. contract</TH>
							<TH>Inceput</TH>
							<TH>Sfarsit</TH>
							<TH>Status</TH>
						</tr>
					</thead>
					<tbody>
						{subcontractor.assignments.map((assignment) => (
							<tr key={assignment.id}>
								<TD>
									<Link
										href={`/proiecte/${assignment.project.id}`}
										className="font-medium text-[var(--accent)] hover:underline"
									>
										{assignment.project.code}
									</Link>
									<p className="text-xs text-[var(--muted)]">
										{assignment.project.title}
									</p>
								</TD>
								<TD className="text-[var(--muted)]">
									{assignment.workOrder ? (
										<Link
											href={`/lucrari/${assignment.workOrder.id}`}
											className="text-[var(--accent)] hover:underline"
										>
											{assignment.workOrder.title}
										</Link>
									) : (
										"—"
									)}
								</TD>
								<TD className="text-xs text-[var(--muted)]">
									{assignment.contractRef || "—"}
								</TD>
								<TD className="text-[var(--muted)]">
									{assignment.startDate
										? formatDate(assignment.startDate)
										: "—"}
								</TD>
								<TD className="text-[var(--muted)]">
									{assignment.endDate ? formatDate(assignment.endDate) : "—"}
								</TD>
								<TD>
									<Badge tone={assignmentTone(assignment.status)}>
										{assignmentStatusLabels[assignment.status]}
									</Badge>
								</TD>
							</tr>
						))}
					</tbody>
				</Table>
			)}
		</Card>
	);
}

export default async function SubcontractorDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, session] = await Promise.all([params, auth()]);
	const roleKeys = session?.user?.roleKeys || [];
	const userEmail = session?.user?.email || null;
	const canUpdate = hasPermission(roleKeys, "TASKS", "UPDATE", userEmail);
	const canDelete = hasPermission(roleKeys, "TASKS", "DELETE", userEmail);

	const subcontractor = (await prisma.subcontractor.findUnique({
		where: { id },
		include: {
			assignments: {
				include: {
					project: { select: { id: true, code: true, title: true } },
					workOrder: { select: { id: true, title: true } },
				},
				orderBy: [{ status: "asc" }, { startDate: "desc" }, { id: "asc" }],
			},
		},
	})) as SubcontractorFull | null;

	if (!subcontractor) notFound();

	const isArchived = Boolean(subcontractor.deletedAt);
	const activeAssignments = subcontractor.assignments.filter(
		(a) => a.status === AssignmentStatus.ACTIV,
	);
	const completedAssignments = subcontractor.assignments.filter(
		(a) => a.status === AssignmentStatus.FINALIZAT,
	);
	const uniqueProjects = new Set(
		subcontractor.assignments.map((a) => a.projectId),
	);

	return (
		<PermissionGuard resource="TASKS" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title={subcontractor.name}
					subtitle={`${subcontractor.cui ? `CUI: ${subcontractor.cui} · ` : ""}${statusMeta[subcontractor.approvalStatus].label}`}
					actions={
						<div className="flex flex-wrap gap-2">
							<Link href="/subcontractori">
								<Button variant="secondary">← Inapoi la lista</Button>
							</Link>
							{isArchived ? <Badge tone="warning">Arhivat</Badge> : null}
						</div>
					}
				/>
				<SubcontractorKpiRow
					subcontractor={subcontractor}
					activeAssignments={activeAssignments}
					completedAssignments={completedAssignments}
					uniqueProjects={uniqueProjects}
				/>
				<div className="grid gap-3 xl:grid-cols-2">
					<CompanyInfoCard
						subcontractor={subcontractor}
						canUpdate={canUpdate}
						isArchived={isArchived}
					/>
					<StatusActionsCard
						subcontractor={subcontractor}
						canUpdate={canUpdate}
						canDelete={canDelete}
						isArchived={isArchived}
					/>
				</div>
				<AssignmentsTable
					subcontractor={subcontractor}
					activeAssignments={activeAssignments}
				/>
			</div>
		</PermissionGuard>
	);
}
