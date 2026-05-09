import { get, set } from "idb-keyval";
import { toast } from "sonner";

export interface PendingTimeEntry {
  id: string; // local temporary id
  projectId: string;
  userId?: string;
  workOrderId?: string;
  shiftMode: "STANDARD" | "CUSTOM";
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  breakMinutes: number;
  note?: string;
  createdAt: number;
}

const SYNC_QUEUE_KEY = "eltgrup-pending-timesheets";

export async function saveTimeEntryOffline(entry: Omit<PendingTimeEntry, "id" | "createdAt">) {
  const newEntry: PendingTimeEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const currentQueue = (await get<PendingTimeEntry[]>(SYNC_QUEUE_KEY)) || [];
  currentQueue.push(newEntry);
  await set(SYNC_QUEUE_KEY, currentQueue);
  
  return newEntry;
}

export async function getPendingTimeEntries(): Promise<PendingTimeEntry[]> {
  return (await get<PendingTimeEntry[]>(SYNC_QUEUE_KEY)) || [];
}

export async function clearPendingTimeEntry(id: string) {
  const currentQueue = (await get<PendingTimeEntry[]>(SYNC_QUEUE_KEY)) || [];
  const filtered = currentQueue.filter((e) => e.id !== id);
  await set(SYNC_QUEUE_KEY, filtered);
}

import { type ActionState } from "@/src/lib/action-state";

export async function syncPendingTimeEntries(actionFn: (formData: FormData) => Promise<ActionState>) {
  if (!navigator.onLine) return;

  const entries = await getPendingTimeEntries();
  if (entries.length === 0) return;

  toast.loading(`Se sincronizează ${entries.length} pontaje...`, { id: "sync-toast" });

  let successCount = 0;
  let failCount = 0;

  for (const entry of entries) {
    try {
      const formData = new FormData();
      formData.set("projectId", entry.projectId);
      if (entry.userId) formData.set("userId", entry.userId);
      if (entry.workOrderId) formData.set("workOrderId", entry.workOrderId);
      formData.set("shiftMode", entry.shiftMode);
      formData.set("startDate", entry.startDate);
      formData.set("startTime", entry.startTime);
      if (entry.endDate) formData.set("endDate", entry.endDate);
      if (entry.endTime) formData.set("endTime", entry.endTime);
      formData.set("breakMinutes", String(entry.breakMinutes));
      if (entry.note) formData.set("note", entry.note);

      const result = await actionFn(formData);
      
      if (result && result.ok) {
        await clearPendingTimeEntry(entry.id);
        successCount++;
      } else {
        console.error("Failed to sync timesheet", entry, result);
        failCount++;
      }
    } catch (e) {
      console.error("Exception during timesheet sync", e);
      failCount++;
    }
  }

  toast.dismiss("sync-toast");
  if (successCount > 0) {
    toast.success(`${successCount} pontaje au fost sincronizate cu succes.`);
  }
  if (failCount > 0) {
    toast.error(`${failCount} pontaje nu au putut fi sincronizate. Vor fi reîncercate ulterior.`);
  }
}
