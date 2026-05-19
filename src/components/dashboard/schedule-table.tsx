"use client";

import type { WorkOrderStatus } from "@prisma/client";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Table, TD, TH } from "@/src/components/ui/table";

type Item = {
	id: string;
	title: string;
	startLabel: string;
	projectTitle: string;
	teamName: string;
	status: WorkOrderStatus;
	description: string;
};

function getStatusTone(
	status: WorkOrderStatus,
): "neutral" | "info" | "danger" | "success" {
	if (status === "IN_PROGRESS") return "info";
	if (status === "BLOCKED") return "danger";
	if (status === "DONE") return "success";
	return "neutral";
}

const columnHelper = createColumnHelper<Item>();

const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
	TODO: "DE FACUT",
	IN_PROGRESS: "IN LUCRU",
	BLOCKED: "BLOCAT",
	REVIEW: "IN VERIFICARE",
	DONE: "FINALIZAT",
	CANCELED: "ANULAT",
};

export const DashboardScheduleTable = memo(function DashboardScheduleTable({
	items,
}: {
	items: Item[];
}) {
	const [active, setActive] = useState<Item | null>(null);
	const handleClose = useCallback(() => setActive(null), []);
	const handleOpen = useCallback((item: Item) => setActive(item), []);
	const columns = useMemo(
		() => [
			columnHelper.accessor("startLabel", {
				id: "startLabel",
				header: "ORA",
				cell: ({ getValue }) => getValue(),
			}),
			columnHelper.accessor("title", {
				id: "title",
				header: "LUCRARE",
				cell: ({ getValue }) => (
					<span className="font-mono text-[var(--text-primary)]">{getValue()}</span>
				),
			}),
			columnHelper.accessor("projectTitle", {
				id: "projectTitle",
				header: "PROIECT",
				cell: ({ getValue }) => getValue(),
			}),
			columnHelper.accessor("teamName", {
				id: "teamName",
				header: "ECHIPA",
				cell: ({ getValue }) => getValue(),
			}),
			columnHelper.accessor("status", {
				id: "status",
				header: "STATUS",
				cell: ({ getValue }) => {
					const status = getValue();
					return (
						<Badge tone={getStatusTone(status)}>
							{workOrderStatusLabels[status]}
						</Badge>
					);
				},
			}),
		],
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table hook is safe in this client component.
	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (items.length === 0) {
		return (
			<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
				NU EXISTA LUCRARI PROGRAMATE PENTRU INTERVALUL CURENT.
			</div>
		);
	}

	return (
		<>
			<div className="space-y-2 md:hidden">
				{items.map((item) => (
					<button
						key={item.id}
						type="button"
						className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--border-visible)]"
						onClick={() => handleOpen(item)}
					>
						<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
							{item.startLabel}
						</p>
						<p className="mt-1 text-sm font-medium text-[var(--text-display)]">
							{item.title}
						</p>
						<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
							{item.projectTitle}
						</p>
						<div className="mt-2 flex items-center justify-between gap-2">
							<p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
								{item.teamName}
							</p>
							<Badge tone={getStatusTone(item.status)}>
								{workOrderStatusLabels[item.status]}
							</Badge>
						</div>
					</button>
				))}
			</div>

			<div className="hidden overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] md:block">
				<Table>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TH key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TH>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="cursor-pointer hover:bg-[var(--surface-raised)]"
								onClick={() => handleOpen(row.original)}
							>
								{row.getVisibleCells().map((cell) => (
									<TD key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TD>
								))}
							</tr>
						))}
					</tbody>
				</Table>
			</div>

			{active ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4"
					onClick={handleClose}
					onKeyDown={(e) => {
						if (e.key === "Escape") handleClose();
					}}
					role="dialog"
					aria-modal="true"
				>
					<div
						className="w-full max-w-xl rounded-[var(--radius-xl)] border border-[var(--border-visible)] bg-[var(--surface)] p-5 max-h-[90vh] overflow-y-auto"
						onClick={(event) => event.stopPropagation()}
						onKeyDown={(event) => event.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-label="Detalii lucrare programata"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex flex-col gap-1">
								<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
									DETALII LUCRARE PROGRAMATA
								</p>
								<h3 className="text-lg font-medium text-[var(--text-display)]">
									{active.title}
								</h3>
							</div>
							<button
								type="button"
								className="rounded-[var(--radius-sm)] border border-[var(--border-visible)] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] hover:text-[var(--text-display)]"
								onClick={handleClose}
							>
								[INCHIDE]
							</button>
						</div>
						<div className="mt-3 grid gap-3 md:grid-cols-2">
							{[["DATA/ORA", active.startLabel], ["PROIECT", active.projectTitle], ["ECHIPA", active.teamName], ["STATUS", <Badge key="status" tone={getStatusTone(active.status)}>{workOrderStatusLabels[active.status]}</Badge>]].map(([label, value]) => (
								<div key={label as string}>
									<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label as string}</p>
									<p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">{value as React.ReactNode}</p>
								</div>
							))}
							<div className="md:col-span-2">
								<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">DESCRIERE</p>
								<p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-primary)]">
									{active.description || "FARA DETALII ADITIONALE."}
								</p>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
});
