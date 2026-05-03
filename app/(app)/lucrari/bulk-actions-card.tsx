"use client";

import { WorkOrderStatus } from "@prisma/client";
import { useState } from "react";
import { Card } from "@/src/components/ui/card";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { bulkWorkOrdersAction } from "./actions";

const workOrderStatusOptions = Object.values(WorkOrderStatus).map((status) => ({
  value: status,
  label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export function BulkActionsCard({
  workOrders,
  canUpdate,
  canDelete,
}: {
  workOrders: { id: string; title: string }[];
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="bulk-zone">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--muted-strong)]"
      >
        Actiuni bulk lucrari
        <span className="text-xs text-[var(--muted)]">{open ? "Ascunde" : "Arata"}</span>
      </button>
      {open ? (
        <form action={bulkWorkOrdersAction} className="mt-3 space-y-3">
          <div className="bulk-controls grid gap-2 md:grid-cols-3">
            <select name="operation" defaultValue={canUpdate ? "SET_STATUS" : "DELETE"}>
              {canUpdate ? <option value="SET_STATUS">Actualizeaza status</option> : null}
              {canDelete ? <option value="DELETE">Sterge logic (CANCELED)</option> : null}
            </select>
            <select name="status" defaultValue={WorkOrderStatus.IN_PROGRESS} disabled={!canUpdate}>
              {workOrderStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ConfirmSubmitButton text="Executa bulk" confirmMessage="Confirmi actiunea bulk pe lucrarile selectate?" />
          </div>
          <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--border)]/70 bg-[var(--surface-card)] p-3">
            <div className="grid gap-1 md:grid-cols-2">
              {workOrders.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm text-[var(--muted-strong)]">
                  <input type="checkbox" name="ids" value={item.id} className="h-4 w-4" />
                  <span>{item.title}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      ) : null}
    </Card>
  );
}
