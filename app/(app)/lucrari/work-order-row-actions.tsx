"use client";

import { WorkOrderStatus } from "@prisma/client";
import { Button } from "@/src/components/ui/button";
import { updateWorkOrderStatus, deleteWorkOrder } from "./actions";

const workOrderStatusOptions = Object.values(WorkOrderStatus).map((status) => ({
  value: status,
  label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export function WorkOrderRowActions({
  workOrderId,
  currentStatus,
  canUpdate,
  canDelete,
}: {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  if (!canUpdate && !canDelete) {
    return <span className="text-xs text-[var(--muted)]">Fara drept de editare</span>;
  }

  return (
    <div className="flex gap-2">
      {canUpdate ? (
        <form action={updateWorkOrderStatus}>
          <input type="hidden" name="id" value={workOrderId} />
          <select name="status" defaultValue={currentStatus} className="h-9 rounded-md px-2 text-xs">
            {workOrderStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button variant="ghost" size="sm" className="ml-1" type="submit">
            Salveaza
          </Button>
        </form>
      ) : null}
      {canDelete ? (
        <form action={deleteWorkOrder}>
          <input type="hidden" name="id" value={workOrderId} />
          <Button variant="destructive" size="sm" type="submit">
            Sterge
          </Button>
        </form>
      ) : null}
    </div>
  );
}
