import { DocumentCategory, type Prisma, RoleKey } from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { FormModal } from "@/src/components/forms/form-modal";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Input } from "@/src/components/ui/input";
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
import { formatDate } from "@/src/lib/utils";
import { bulkDocumentsAction } from "./actions";
import { DocumentUploadForm } from "./document-upload-form";

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
const documentCategoryOrder = Object.values(DocumentCategory);

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function tokenizeQuery(query: string) {
	return Array.from(
		new Set(
			query.split(/\s+/).flatMap((token) => {
				const normalized = normalizeText(token);
				return normalized.length > 2 ? [normalized] : [];
			}),
		),
	);
}

function formatDocumentCategory(category: DocumentCategory) {
	return documentCategoryLabels[category] ?? category;
}

function buildDocumentsHref({
	page,
	q,
	category,
	projectId,
}: {
	page?: number;
	q?: string;
	category?: string | null;
	projectId?: string | null;
}) {
	return buildListHref("/documente", {
		page,
		q,
		category: category || undefined,
		projectId: projectId || undefined,
	});
}

function getDocumentContext(doc: {
	id: string;
	title: string;
	project: { id: string; title: string } | null;
	client: { id: string; name: string } | null;
	workOrder: { id: string; title: string } | null;
}) {
	if (doc.workOrder)
		return {
			key: `work-order:${doc.workOrder.id}`,
			kind: "Lucrare",
			label: doc.workOrder.title,
			href: `/lucrari/${doc.workOrder.id}`,
		};
	if (doc.project)
		return {
			key: `project:${doc.project.id}`,
			kind: "Proiect",
			label: doc.project.title,
			href: `/proiecte/${doc.project.id}`,
		};
	if (doc.client)
		return {
			key: `client:${doc.client.id}`,
			kind: "Client",
			label: doc.client.name,
			href: `/clienti/${doc.client.id}`,
		};
	return {
		key: `general:${doc.id}`,
		kind: "General",
		label: "Documente generale",
		href: null,
	};
}

type DocumentRow = {
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
};

function UploadCard({
	canCreate,
	projects,
	clients,
	workOrders,
	selectedProjectId,
	total,
	docs,
	expiringSoonCount,
	query: _query,
	categoryFilter: _categoryFilter,
	selectedProject: _selectedProject,
}: {
	canCreate: boolean;
	projects: { id: string; label: string }[];
	clients: { id: string; label: string }[];
	workOrders: { id: string; label: string }[];
	selectedProjectId: string;
	total: number;
	docs: DocumentRow[];
	expiringSoonCount: number;
	query: string;
	categoryFilter: DocumentCategory | null;
	selectedProject: { title: string } | null;
}) {
	if (!canCreate) return null;
	return (
		<Card className="space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
				<div>
					<h2 className="text-lg font-semibold text-[var(--foreground)]">
						Inregistreaza document
					</h2>
					<p className="mt-1 text-sm text-[var(--muted)]">
						Incarca rapid un fisier si leaga-l de proiect, lucrare sau client
						pentru a-l gasi mai usor.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge tone="info">{total} rezultate</Badge>
					<Badge tone="neutral">{docs.length} pe pagina</Badge>
					{expiringSoonCount > 0 ? (
						<Badge tone="warning">{expiringSoonCount} expira curand</Badge>
					) : null}
				</div>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-[var(--muted)]">
					Foloseste dialogul de incarcare pentru a adauga documente fara sa
					parasesti lista curenta.
				</p>
				<FormModal
					triggerLabel="Incarca document"
					title="Inregistrare document"
					description="Ataseaza fisierul si completeaza contextul proiect/client/lucrare."
				>
					<DocumentUploadForm
						projects={projects}
						clients={clients}
						workOrders={workOrders}
						defaultProjectId={selectedProjectId || undefined}
					/>
				</FormModal>
			</div>
		</Card>
	);
}

function FiltersCard({
	query,
	categoryFilter,
	selectedProjectId,
	selectedProject,
	docs: _docs,
	projects,
	documentCategoryOrder,
}: {
	query: string;
	categoryFilter: DocumentCategory | null;
	selectedProjectId: string;
	selectedProject: { title: string } | null;
	docs: DocumentRow[];
	projects: { id: string; title: string }[];
	documentCategoryOrder: DocumentCategory[];
}) {
	return (
		<Card className="space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
				<div>
					<h2 className="text-lg font-semibold text-[var(--foreground)]">
						Filtre si cautare
					</h2>
					<p className="mt-1 text-sm text-[var(--muted)]">
						Cauta in titlu, nume fisier si tag-uri. Foloseste proiectul sau
						categoria pentru a restrange rapid rezultatele.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{query ? <Badge tone="info">Cautare: {query}</Badge> : null}
					{categoryFilter ? (
						<Badge tone="neutral">
							Categorie: {formatDocumentCategory(categoryFilter)}
						</Badge>
					) : null}
					{selectedProject ? (
						<Badge tone="neutral">Proiect: {selectedProject.title}</Badge>
					) : null}
				</div>
			</div>
			<form className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)_auto_auto]">
				<input type="hidden" name="page" value="1" />
				<Input
					name="q"
					placeholder="Cauta document, fisier sau tag"
					defaultValue={query}
				/>
				<select
					name="category"
					defaultValue={categoryFilter || ""}
					className="h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm text-[var(--foreground)]"
				>
					<option value="">Toate categoriile</option>
					{documentCategoryOrder.map((cat) => (
						<option key={cat} value={cat}>
							{formatDocumentCategory(cat)}
						</option>
					))}
				</select>
				<select
					name="projectId"
					defaultValue={selectedProjectId}
					className="h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm text-[var(--foreground)]"
				>
					<option value="">Toate proiectele</option>
					{projects.map((p) => (
						<option key={p.id} value={p.id}>
							{p.title}
						</option>
					))}
				</select>
				<Button type="submit" variant="secondary" className="h-11 px-4">
					Filtreaza
				</Button>
				<Link
					href="/documente"
					className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-4 text-sm font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
				>
					Reseteaza
				</Link>
			</form>
		</Card>
	);
}

function BulkActionsSection({
	canUpdate,
	canDelete,
	docs,
}: {
	canUpdate: boolean;
	canDelete: boolean;
	docs: DocumentRow[];
}) {
	if (!canUpdate && !canDelete) return null;
	return (
		<details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
			<summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-[var(--foreground)] sm:px-5">
				Actiuni bulk pe pagina curenta
			</summary>
			<div className="space-y-4 border-t border-[var(--border)] px-4 py-4 sm:px-5">
				<p className="text-sm text-[var(--muted)]">
					Selecteaza documentele vizibile aici si executa o singura actiune
					pentru toate.
				</p>
				<form action={bulkDocumentsAction} className="space-y-4">
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
						<select
							name="operation"
							defaultValue={canUpdate ? "MAKE_PRIVATE" : "DELETE"}
							className="h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm text-[var(--foreground)]"
						>
							{canUpdate && (
								<option value="MAKE_PRIVATE">Marcheaza privat</option>
							)}
							{canUpdate && (
								<option value="MAKE_PUBLIC">Marcheaza public</option>
							)}
							{canDelete && <option value="DELETE">Sterge definitiv</option>}
						</select>
						<div className="flex md:justify-end">
							<ConfirmSubmitButton
								text="Executa bulk"
								confirmMessage="Confirmi actiunea bulk pe documentele selectate?"
							/>
						</div>
					</div>
					<div className="max-h-72 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-3">
						<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
							{docs.map((doc) => {
								const context = getDocumentContext(doc);
								return (
									<label
										key={doc.id}
										className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--border)]/70 bg-[var(--surface)] px-3 py-2 text-sm hover:border-[var(--border-strong)]"
									>
										<input
											className="mt-1 size-4 shrink-0"
											type="checkbox"
											name="ids"
											value={doc.id}
										/>
										<span className="min-w-0">
											<span className="block font-medium text-[var(--foreground)]">
												{doc.title}
											</span>
											<span className="block text-xs text-[var(--muted)]">
												{context.kind}: {context.label}
											</span>
										</span>
									</label>
								);
							})}
						</div>
					</div>
				</form>
			</div>
		</details>
	);
}

function DocumentGroupCard({
	group,
	reminderThreshold,
}: {
	group: {
		key: string;
		kind: string;
		label: string;
		href: string | null;
		docs: DocumentRow[];
	};
	reminderThreshold: Date;
}) {
	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-panel)]">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
						{group.kind}
					</p>
					<h3 className="text-base font-semibold text-[var(--foreground)]">
						{group.label}
					</h3>
				</div>
				<Badge tone="neutral">{group.docs.length} documente</Badge>
			</div>
			<div className="mt-3 space-y-2">
				{group.docs.map((doc) => {
					const context = getDocumentContext(doc);
					const expiryBadge = doc.expiresAt
						? {
								tone:
									doc.expiresAt < reminderThreshold
										? ("warning" as const)
										: ("info" as const),
								label:
									doc.expiresAt < reminderThreshold
										? `Expira ${formatDate(doc.expiresAt)}`
										: `Valabil pana ${formatDate(doc.expiresAt)}`,
							}
						: null;
					return (
						<div
							key={doc.id}
							className="rounded-2xl border border-[var(--border)]/70 bg-[var(--surface)] p-4"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 space-y-1">
									<p className="truncate text-sm font-semibold text-[var(--foreground)]">
										{doc.title}
									</p>
									<p className="text-xs text-[var(--muted)]">
										{doc.fileName} • v{doc.version} • Creat{" "}
										{formatDate(doc.createdAt)}
									</p>
									<p className="text-xs text-[var(--muted)]">
										{doc.project?.title
											? `Proiect: ${doc.project.title}`
											: doc.client?.name
												? `Client: ${doc.client.name}`
												: "Fara context de proiect"}
									</p>
								</div>
								<div className="flex flex-wrap justify-end gap-2">
									<Badge tone="info">
										{formatDocumentCategory(doc.category)}
									</Badge>
									<Badge tone={doc.isPrivate ? "neutral" : "success"}>
										{doc.isPrivate ? "Privat" : "Public"}
									</Badge>
									{expiryBadge ? (
										<Badge tone={expiryBadge.tone}>{expiryBadge.label}</Badge>
									) : null}
								</div>
							</div>
							<div className="mt-3 flex flex-wrap gap-2">
								{doc.tags.length ? (
									doc.tags.slice(0, 4).map((tag) => (
										<span
											key={tag}
											className="rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-strong)]"
										>
											{tag}
										</span>
									))
								) : (
									<span className="text-xs text-[var(--muted)]">
										Fara tag-uri
									</span>
								)}
								{doc.tags.length > 4 ? (
									<span className="rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-strong)]">
										+{doc.tags.length - 4}
									</span>
								) : null}
							</div>
							<div className="mt-4 flex flex-wrap gap-2">
								<a
									href={`/api/documents/${doc.id}/download`}
									target="_blank"
									rel="noreferrer noopener"
									className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)]"
								>
									Deschide
								</a>
								{context.href ? (
									<Link
										href={context.href}
										className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent px-3.5 text-sm font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
									>
										{context.kind}
									</Link>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default async function DocumentePage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		category?: string;
		page?: string;
		projectId?: string;
	}>;
}) {
	const params = await searchParams;
	const query = params.q?.trim() || "";
	const categoryFilter =
		parseEnumParam(params.category, documentCategoryOrder) ?? null;
	const selectedProjectId = params.projectId?.trim() || "";
	const page = parsePositiveIntParam(params.page);
	const pageSize = 24;
	const reminderThreshold = new Date();
	reminderThreshold.setDate(reminderThreshold.getDate() + 30);
	const session = await auth();
	const scope = session?.user
		? await resolveAccessScope({
				id: session.user.id,
				email: session.user.email,
				roleKeys: session.user.roleKeys || [],
			})
		: { projectIds: null, teamId: null };
	const scopedProjectFilter =
		scope.projectIds === null
			? null
			: { in: scope.projectIds.length ? scope.projectIds : ["__none__"] };
	const roleKeys = session?.user?.roleKeys || [];
	const userEmail = session?.user?.email || null;
	const isExternalViewer =
		roleKeys.includes(RoleKey.CLIENT_VIEWER) ||
		roleKeys.includes(RoleKey.SUBCONTRACTOR);
	const canCreate = hasPermission(roleKeys, "DOCUMENTS", "CREATE", userEmail);
	const canUpdate = hasPermission(roleKeys, "DOCUMENTS", "UPDATE", userEmail);
	const canDelete = hasPermission(roleKeys, "DOCUMENTS", "DELETE", userEmail);
	const scopedProjectIds =
		scope.projectIds && scope.projectIds.length > 0
			? scope.projectIds
			: ["__none__"];
	const searchTokens = tokenizeQuery(query);

	const where: Prisma.DocumentWhereInput = {};
	const andFilters: Prisma.DocumentWhereInput[] = [];
	if (scope.projectIds !== null)
		andFilters.push({
			OR: [
				{ projectId: { in: scopedProjectIds } },
				{ workOrder: { projectId: { in: scopedProjectIds } } },
				...(session?.user?.id
					? [{ projectId: null, uploadedById: session.user.id }]
					: []),
			],
		});
	if (isExternalViewer) andFilters.push({ isPrivate: false });
	if (selectedProjectId)
		andFilters.push({
			OR: [
				{ projectId: selectedProjectId },
				{ workOrder: { projectId: selectedProjectId } },
			],
		});
	if (query)
		andFilters.push({
			OR: [
				{ title: { contains: query, mode: "insensitive" as const } },
				{ fileName: { contains: query, mode: "insensitive" as const } },
				...(searchTokens.length ? [{ tags: { hasSome: searchTokens } }] : []),
			],
		});
	if (categoryFilter) andFilters.push({ category: categoryFilter });
	if (andFilters.length > 0) where.AND = andFilters;

	const [projects, clients, workOrders, total] = await Promise.all([
		prisma.project.findMany({
			where: {
				deletedAt: null,
				...(scope.projectIds === null
					? {}
					: { id: scopedProjectFilter as { in: string[] } }),
			},
			select: { id: true, title: true },
			orderBy: [{ title: "asc" }, { id: "asc" }],
		}),
		prisma.client.findMany({
			where:
				scope.projectIds === null
					? { deletedAt: null }
					: {
							deletedAt: null,
							projects: {
								some: { id: scopedProjectFilter as { in: string[] } },
							},
						},
			select: { id: true, name: true },
			orderBy: [{ name: "asc" }, { id: "asc" }],
		}),
		prisma.workOrder.findMany({
			where: {
				deletedAt: null,
				...(scope.projectIds === null
					? {}
					: { projectId: scopedProjectFilter as { in: string[] } }),
			},
			select: { id: true, title: true, project: { select: { title: true } } },
			orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
			take: 100,
		}),
		prisma.document.count({ where }),
	]);
	const { totalPages, currentPage, skip, take } = resolvePagination({
		page,
		totalItems: total,
		pageSize,
	});
	const docs = (await prisma.document.findMany({
		where,
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
		orderBy: [{ createdAt: "desc" }, { id: "asc" }],
		skip,
		take,
	})) as DocumentRow[];
	const selectedProject = selectedProjectId
		? projects.find((project) => project.id === selectedProjectId) || null
		: null;
	const expiringSoonCount = docs.filter(
		(doc) => doc.expiresAt && doc.expiresAt < reminderThreshold,
	).length;
	const privateCount = docs.filter((doc) => doc.isPrivate).length;
	const publicCount = docs.length - privateCount;

	const groupedDocuments = new Map<
		string,
		{
			key: string;
			kind: string;
			label: string;
			href: string | null;
			docs: DocumentRow[];
		}
	>();
	for (const doc of docs) {
		const context = getDocumentContext(doc);
		const existing = groupedDocuments.get(context.key);
		if (existing) {
			existing.docs.push(doc);
		} else {
			groupedDocuments.set(context.key, { ...context, docs: [doc] });
		}
	}
	const documentGroups = Array.from(groupedDocuments.values());

	return (
		<PermissionGuard resource="DOCUMENTS" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title="Documente"
					subtitle="Contracte, anexe, facturi, rapoarte, conformitate, permise"
				/>
				<UploadCard
					canCreate={canCreate}
					projects={projects.map((p) => ({ id: p.id, label: p.title }))}
					clients={clients.map((c) => ({ id: c.id, label: c.name }))}
					workOrders={workOrders.map((wo) => ({
						id: wo.id,
						label: `${wo.title} • ${wo.project.title}`,
					}))}
					selectedProjectId={selectedProjectId}
					total={total}
					docs={docs}
					expiringSoonCount={expiringSoonCount}
					query={query}
					categoryFilter={categoryFilter}
					selectedProject={selectedProject}
				/>
				<FiltersCard
					query={query}
					categoryFilter={categoryFilter}
					selectedProjectId={selectedProjectId}
					selectedProject={selectedProject}
					docs={docs}
					projects={projects}
					documentCategoryOrder={documentCategoryOrder}
				/>
				<BulkActionsSection
					canUpdate={canUpdate}
					canDelete={canDelete}
					docs={docs}
				/>
				<Card className="space-y-4">
					<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								Rezultate
							</h2>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Documentele sunt grupate dupa context pentru deschidere si
								navigare mai rapida.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge tone="info">{total} total</Badge>
							<Badge tone="neutral">{docs.length} pe pagina</Badge>
							<Badge tone="neutral">{privateCount} private</Badge>
							<Badge tone="success">{publicCount} publice</Badge>
						</div>
					</div>
					{docs.length === 0 ? (
						<EmptyState
							title="Nu exista documente pentru filtrele selectate"
							description="Incearca alte filtre sau adauga un document nou."
						/>
					) : (
						<div className="grid gap-4 xl:grid-cols-2">
							{documentGroups.map((group) => (
								<DocumentGroupCard
									key={group.key}
									group={group}
									reminderThreshold={reminderThreshold}
								/>
							))}
						</div>
					)}
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
						<span>
							Pagina {currentPage} din {totalPages}
						</span>
						<div className="flex gap-2">
							{currentPage > 1 && (
								<Link
									className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-[var(--border-strong)]"
									href={buildDocumentsHref({
										page: currentPage - 1,
										q: query || undefined,
										category: categoryFilter || undefined,
										projectId: selectedProjectId || undefined,
									})}
								>
									Anterior
								</Link>
							)}
							{currentPage < totalPages && (
								<Link
									className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-[var(--border-strong)]"
									href={buildDocumentsHref({
										page: currentPage + 1,
										q: query || undefined,
										category: categoryFilter || undefined,
										projectId: selectedProjectId || undefined,
									})}
								>
									Urmator
								</Link>
							)}
						</div>
					</div>
				</Card>
			</div>
		</PermissionGuard>
	);
}
