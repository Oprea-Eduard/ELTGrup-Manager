import {
	EquipmentStatus,
	type MaterialRequestStatus,
	type StockMovementType,
} from "@prisma/client";
import Link from "next/link";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { FormModal } from "@/src/components/forms/form-modal";
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
import {
	archiveEquipment,
	updateEquipmentStatus,
} from "../echipamente/actions";
import { EquipmentCreateForm } from "../echipamente/equipment-create-form";
import { approveMaterialRequest, archiveMaterial } from "./actions";
import { ApprovedTodayCount } from "./client-today-count";
import {
	MaterialCreateForm,
	MaterialRequestForm,
	StockMovementForm,
} from "./material-forms";

const requestStatusLabels: Record<MaterialRequestStatus, string> = {
	PENDING: "In asteptare",
	APPROVED: "Aprobata",
	REJECTED: "Respinsa",
	ISSUED: "Emisa din stoc",
	PARTIAL: "Partial emisa",
};
const movementLabels: Record<StockMovementType, string> = {
	IN: "Intrare",
	OUT: "Iesire",
	TRANSFER: "Transfer",
	RETURN: "Returnare",
	WASTE: "Casare",
	ADJUSTMENT: "Ajustare",
};
const equipmentStatusLabels: Record<EquipmentStatus, string> = {
	AVAILABLE: "Disponibil",
	IN_USE: "In utilizare",
	SERVICE: "In service",
	LOST: "Pierdut",
};

function TabNav({ currentTab }: { currentTab: string }) {
	const tabs = [
		{ id: "stoc", label: "STOC MATERIALE" },
		{ id: "cereri", label: "CERERI" },
		{ id: "miscari", label: "MISCARI" },
		{ id: "echipamente", label: "ECHIPAMENTE" },
	];
	return (
		<nav
			className="flex h-[30px] items-stretch gap-0 overflow-hidden border-b border-[var(--b1)] bg-[var(--s2)]"
			aria-label="Sectiuni gestiune"
		>
			{tabs.map((tab) => (
				<Link
					key={tab.id}
					href={`/materiale?tab=${tab.id}`}
					className={`flex items-center border-b-2 px-3 text-[8px] font-bold tracking-[1.5px] transition-colors ${currentTab === tab.id ? "border-[var(--amber)] text-[var(--amber)]" : "border-transparent text-[var(--t3)] hover:text-[var(--t)]"}`}
					aria-current={currentTab === tab.id ? "page" : undefined}
				>
					{tab.label}
				</Link>
			))}
		</nav>
	);
}

function MaterieFirstockTab({
	materials,
	warehouses,
	query,
	category,
	canCreate: _canCreate,
	canDelete,
	projects: _projects,
	allMaterials: _allMaterials,
}: {
	materials: unknown[];
	warehouses: unknown[];
	query: string;
	category: string;
	canCreate: boolean;
	canDelete: boolean;
	projects: unknown[];
	allMaterials: unknown[];
}) {
	const typedMaterials = materials as {
		stockMovements: { type: string; quantity: string }[];
		minStockLevel: number | null;
	}[];
	const lowStockCount = typedMaterials.filter((m) => {
		const stock = m.stockMovements.reduce(
			(acc, mov) =>
				acc +
				(mov.type === "IN" ? Number(mov.quantity) : -Number(mov.quantity)),
			0,
		);
		return m.minStockLevel && stock < Number(m.minStockLevel);
	}).length;
	return (
		<>
			<section className="page-kpis">
				<KpiCard
					label="Total materiale"
					value={String(materials.length)}
					severity="info"
				/>
				<KpiCard
					label="Sub prag minim"
					value={String(lowStockCount)}
					severity={lowStockCount > 0 ? "blocked" : "done"}
				/>
				<KpiCard
					label="Depozite active"
					value={String(warehouses.length)}
					severity="active"
				/>
			</section>
			<Card className="flush">
				<div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-3">
					<div className="flex-1 min-w-[200px]">
						<Input
							name="q"
							placeholder="Cauta dupa nume sau cod..."
							defaultValue={query}
							className="h-9"
							aria-label="Cauta materiale"
						/>
					</div>
					<select
						name="category"
						defaultValue={category}
						className="h-9 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none"
						aria-label="Filtreaza dupa categorie"
					>
						<option value="">Toate categoriile</option>
						{[
							...new Set(
								materials.flatMap((m) =>
									(m as { category: string }).category
										? [(m as { category: string }).category]
										: [],
								),
							),
						].map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</div>
				<Table>
					<thead>
						<tr>
							<TH>Cod</TH>
							<TH>Denumire</TH>
							<TH>Categorie</TH>
							<TH className="text-right">Stoc curent</TH>
							<TH>U.M.</TH>
							<TH className="text-right">Prag</TH>
							<TH className="text-right">Actiuni</TH>
						</tr>
					</thead>
					<tbody>
						{(
							materials as {
								id: string;
								code: string;
								name: string;
								stockMovements: { type: string; quantity: string }[];
								minStockLevel: number | null;
								category: string;
								unitOfMeasure: string;
							}[]
						).map((m) => {
							const stock = m.stockMovements.reduce(
								(acc: number, mov) =>
									acc +
									(mov.type === "IN"
										? Number(mov.quantity)
										: -Number(mov.quantity)),
								0,
							);
							const isLow = m.minStockLevel && stock < Number(m.minStockLevel);
							return (
								<tr key={m.id} className="group">
									<TD className="font-mono text-[10px] text-[var(--muted-strong)]">
										{m.code}
									</TD>
									<TD className="font-medium">{m.name}</TD>
									<TD className="text-[var(--muted)]">{m.category || "—"}</TD>
									<TD
										className={`text-right font-bold tabular-nums ${isLow ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
									>
										{stock.toFixed(2)}
									</TD>
									<TD className="text-[var(--muted)]">{m.unitOfMeasure}</TD>
									<TD className="text-right text-[var(--muted)]">
										{m.minStockLevel ? Number(m.minStockLevel).toFixed(2) : "—"}
									</TD>
									<TD className="text-right">
										{canDelete && (
											<form
												action={archiveMaterial}
												className="opacity-0 group-hover:opacity-100"
											>
												<input type="hidden" name="id" value={m.id} />
												<Button
													type="submit"
													variant="ghost"
													size="sm"
													className="h-7 px-2 text-[var(--danger)]"
												>
													Arhiva
												</Button>
											</form>
										)}
									</TD>
								</tr>
							);
						})}
					</tbody>
				</Table>
			</Card>
		</>
	);
}

function RequestsTab({
	requests,
	allMaterials: _allMaterials,
	projects: _projects,
	canCreate: _canCreate,
	canUpdate,
}: {
	requests: unknown[];
	allMaterials: unknown[];
	projects: unknown[];
	canCreate: boolean;
	canUpdate: boolean;
}) {
	return (
		<>
			<section className="page-kpis">
				<KpiCard
					label="Cereri in asteptare"
					value={String(
						(requests as { status: string }[]).filter(
							(r) => r.status === "PENDING",
						).length,
					)}
					severity="pending"
				/>
				<ApprovedTodayCount
					requests={requests as { status: string; updatedAt: Date }[]}
				/>
			</section>
			<Card className="flush">
				<Table>
					<thead>
						<tr>
							<TH>Data</TH>
							<TH>Proiect</TH>
							<TH>Material</TH>
							<TH className="text-right">Cantitate</TH>
							<TH>Status</TH>
							<TH>Solicitant</TH>
							<TH className="text-right">Actiuni</TH>
						</tr>
					</thead>
					<tbody>
						{(
							requests as {
								id: string;
								createdAt: Date;
								project: { code: string };
								status: string;
								requestedBy: { firstName: string; lastName: string };
								material: { name: string; code: string; unitOfMeasure: string };
								quantity: number;
								unitOfMeasure: string;
							}[]
						).map((r) => (
							<tr key={r.id} className="group">
								<TD className="text-[var(--muted)]">
									{r.createdAt.toLocaleDateString("ro-RO")}
								</TD>
								<TD className="font-mono text-xs">{r.project.code}</TD>
								<TD>
									<div className="font-medium">{r.material.name}</div>
									<div className="text-[10px] text-[var(--muted)]">
										{r.material.code}
									</div>
								</TD>
								<TD className="text-right font-semibold tabular-nums">
									{Number(r.quantity).toFixed(2)} {r.material.unitOfMeasure}
								</TD>
								<TD>
									<Badge
										tone={
											r.status === "PENDING"
												? "warning"
												: r.status === "APPROVED"
													? "success"
													: "neutral"
										}
									>
										{requestStatusLabels[r.status as MaterialRequestStatus]}
									</Badge>
								</TD>
								<TD className="text-xs">
									{r.requestedBy.firstName} {r.requestedBy.lastName}
								</TD>
								<TD className="text-right">
									{r.status === "PENDING" && canUpdate && (
										<div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
											<form action={approveMaterialRequest}>
												<input type="hidden" name="id" value={r.id} />
												<Button
													type="submit"
													variant="ghost"
													size="sm"
													className="h-7 px-2 text-[var(--success)]"
												>
													Aproba
												</Button>
											</form>
										</div>
									)}
								</TD>
							</tr>
						))}
					</tbody>
				</Table>
			</Card>
		</>
	);
}

function MovementsTab({ movements }: { movements: unknown[] }) {
	return (
		<Card className="flush">
			<Table>
				<thead>
					<tr>
						<TH>Data</TH>
						<TH>Tip</TH>
						<TH>Material</TH>
						<TH className="text-right">Cantitate</TH>
						<TH>Depozit</TH>
						<TH>Proiect</TH>
					</tr>
				</thead>
				<tbody>
					{(
						movements as {
							id: string;
							createdAt: Date;
							type: string;
							material: { name: string; code: string };
							quantity: number;
							warehouse: { name: string };
							project: { title: string; code: string } | null;
						}[]
					).map((m) => (
						<tr key={m.id}>
							<TD className="text-[var(--muted)]">
								{m.createdAt.toLocaleDateString("ro-RO")}
							</TD>
							<TD>
								<Badge
									tone={
										m.type === "IN"
											? "info"
											: m.type === "OUT"
												? "warning"
												: "neutral"
									}
								>
									{movementLabels[m.type as StockMovementType]}
								</Badge>
							</TD>
							<TD>
								<div className="font-medium">{m.material.name}</div>
								<div className="text-[10px] text-[var(--muted)]">
									{m.material.code}
								</div>
							</TD>
							<TD
								className={`text-right font-bold tabular-nums ${m.type === "IN" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
							>
								{m.type === "IN" ? "+" : "-"}
								{Number(m.quantity).toFixed(2)}
							</TD>
							<TD className="text-xs">{m.warehouse.name}</TD>
							<TD className="font-mono text-[10px]">
								{m.project?.code || "—"}
							</TD>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	);
}

function EquipmentTab({
	equipment,
	canCreate: _canCreate,
	canDelete,
}: {
	equipment: unknown[];
	canCreate: boolean;
	canDelete: boolean;
}) {
	const typedEquipment = equipment as { status: string }[];
	const inServiceCount = typedEquipment.filter(
		(e) => e.status === EquipmentStatus.SERVICE,
	).length;
	const availableCount = typedEquipment.filter(
		(e) => e.status === EquipmentStatus.AVAILABLE,
	).length;
	return (
		<>
			<section className="page-kpis">
				<KpiCard
					label="Total echipamente"
					value={String(equipment.length)}
					severity="info"
				/>
				<KpiCard
					label="In service"
					value={String(inServiceCount)}
					severity="blocked"
				/>
				<KpiCard
					label="Disponibile"
					value={String(availableCount)}
					severity="active"
				/>
			</section>
			<Card className="flush">
				<Table>
					<thead>
						<tr>
							<TH>Cod</TH>
							<TH>Denumire</TH>
							<TH>Serie</TH>
							<TH>Categorie</TH>
							<TH>Status</TH>
							<TH>Mentenanta</TH>
							<TH className="text-right">Actiuni</TH>
						</tr>
					</thead>
					<tbody>
						{(
							equipment as {
								id: string;
								code: string;
								name: string;
								serialNumber: string | null;
								category: string | null;
								status: string;
								maintenanceDueAt: Date | null;
							}[]
						).map((e) => (
							<tr key={e.id} className="group">
								<TD className="font-mono text-xs">{e.code}</TD>
								<TD className="font-medium">{e.name}</TD>
								<TD className="text-xs text-[var(--muted)]">
									{e.serialNumber || "—"}
								</TD>
								<TD className="text-xs">{e.category || "—"}</TD>
								<TD>
									<Badge
										tone={
											e.status === EquipmentStatus.AVAILABLE
												? "success"
												: e.status === EquipmentStatus.IN_USE
													? "info"
													: "neutral"
										}
									>
										{equipmentStatusLabels[e.status as EquipmentStatus]}
									</Badge>
								</TD>
								<TD className="text-xs">
									{e.maintenanceDueAt
										? e.maintenanceDueAt.toLocaleDateString("ro-RO")
										: "—"}
								</TD>
								<TD className="text-right">
									<div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
										<form action={updateEquipmentStatus}>
											<input type="hidden" name="id" value={e.id} />
											<input
												type="hidden"
												name="status"
												value={EquipmentStatus.SERVICE}
											/>
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												className="h-7 px-2"
											>
												Service
											</Button>
										</form>
										{canDelete && (
											<form action={archiveEquipment}>
												<input type="hidden" name="id" value={e.id} />
												<Button
													type="submit"
													variant="ghost"
													size="sm"
													className="h-7 px-2 text-[var(--danger)]"
												>
													Arhiva
												</Button>
											</form>
										)}
									</div>
								</TD>
							</tr>
						))}
					</tbody>
				</Table>
			</Card>
		</>
	);
}

export default async function MaterialePage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		category?: string;
		status?: string;
		page?: string;
		tab?: string;
		warehouseId?: string;
	}>;
}) {
	const params = await searchParams;
	const currentTab = params.tab || "stoc";
	const query = params.q || "";
	const category = params.category || "";
	const session = await auth();
	const roleKeys = session?.user?.roleKeys || [];
	const userEmail = session?.user?.email || null;
	const canCreate = hasPermission(roleKeys, "MATERIALS", "CREATE", userEmail);
	const canUpdate = hasPermission(roleKeys, "MATERIALS", "UPDATE", userEmail);
	const canDelete = hasPermission(roleKeys, "MATERIALS", "DELETE", userEmail);

	const [warehouses, projects, allMaterials] = await Promise.all([
		prisma.warehouse.findMany({
			where: { deletedAt: null },
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		}),
		prisma.project.findMany({
			where: { deletedAt: null },
			select: { id: true, code: true, title: true },
			orderBy: { code: "desc" },
			take: 50,
		}),
		prisma.material.findMany({
			where: { deletedAt: null },
			select: { id: true, name: true, code: true },
			orderBy: { name: "asc" },
		}),
	]);

	let tabContent = null;
	let tabActions = null;

	if (currentTab === "stoc") {
		const materials = await prisma.material.findMany({
			where: {
				deletedAt: null,
				...(query
					? {
							OR: [
								{ name: { contains: query, mode: "insensitive" } },
								{ code: { contains: query, mode: "insensitive" } },
							],
						}
					: {}),
				...(category ? { category } : {}),
			},
			include: { stockMovements: { select: { quantity: true, type: true } } },
			orderBy: { name: "asc" },
		});
		tabActions = canCreate ? (
			<div className="flex items-center gap-2">
				<FormModal triggerLabel="Adauga material" title="Creare material nou">
					<MaterialCreateForm />
				</FormModal>
				<FormModal
					triggerLabel="Miscare stoc"
					title="Inregistrare miscare stoc"
				>
					<StockMovementForm
						projects={projects.map((p) => ({
							id: p.id,
							label: `${p.code} - ${p.title}`,
						}))}
						materials={allMaterials.map((m) => ({
							id: m.id,
							label: `${m.code} - ${m.name}`,
						}))}
						warehouses={warehouses.map((w) => ({ id: w.id, label: w.name }))}
					/>
				</FormModal>
			</div>
		) : null;
		tabContent = (
			<MaterieFirstockTab
				materials={materials}
				warehouses={warehouses}
				query={query}
				category={category}
				canCreate={canCreate}
				canDelete={canDelete}
				projects={projects}
				allMaterials={allMaterials}
			/>
		);
	}

	if (currentTab === "cereri") {
		const requests = await prisma.materialRequest.findMany({
			include: {
				material: { select: { name: true, code: true, unitOfMeasure: true } },
				project: { select: { code: true } },
				requestedBy: { select: { firstName: true, lastName: true } },
			},
			orderBy: { createdAt: "desc" },
		});
		tabActions = canCreate && (
			<FormModal
				triggerLabel="Cere material"
				title="Creare cerere de materiale"
			>
				<MaterialRequestForm
					projects={projects.map((p) => ({
						id: p.id,
						label: `${p.code} - ${p.title}`,
					}))}
					materials={allMaterials.map((m) => ({
						id: m.id,
						label: `${m.code} - ${m.name}`,
					}))}
				/>
			</FormModal>
		);
		tabContent = (
			<RequestsTab
				requests={requests}
				allMaterials={allMaterials}
				projects={projects}
				canCreate={canCreate}
				canUpdate={canUpdate}
			/>
		);
	}

	if (currentTab === "miscari") {
		const movements = await prisma.stockMovement.findMany({
			include: {
				material: { select: { name: true, code: true, unitOfMeasure: true } },
				warehouse: { select: { name: true } },
				project: { select: { code: true } },
			},
			orderBy: { createdAt: "desc" },
			take: 100,
		});
		tabContent = <MovementsTab movements={movements} />;
	}

	if (currentTab === "echipamente") {
		const equipment = await prisma.equipment.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: "desc" },
		});
		tabActions = canCreate && (
			<FormModal
				triggerLabel="Echipament nou"
				title="Adaugare echipament/scula"
			>
				<EquipmentCreateForm />
			</FormModal>
		);
		tabContent = (
			<EquipmentTab
				equipment={equipment}
				canCreate={canCreate}
				canDelete={canDelete}
			/>
		);
	}

	return (
		<PermissionGuard resource="MATERIALS" action="VIEW">
			<div className="page-stack">
				<PageHeader
					title="Gestiune Materiale & Echipamente"
					subtitle="Stocuri, cereri de materiale si inventar scule"
					actions={tabActions}
				/>
				<TabNav currentTab={currentTab} />
				{tabContent}
			</div>
		</PermissionGuard>
	);
}
