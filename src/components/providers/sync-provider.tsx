"use client";

import { useEffect } from "react";
import { createTimeEntryAction } from "@/app/(app)/pontaj/actions";
import { syncPendingTimeEntries } from "@/src/lib/offline-sync";

// We need to pass a mock ActionState to createTimeEntryAction since it expects (_: ActionState, formData: FormData)
const mockActionState = { ok: true, message: "" };

export function SyncProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const handleOnline = async () => {
			// Small delay to ensure connection is stable
			setTimeout(async () => {
				await syncPendingTimeEntries(async (formData) => {
					return await createTimeEntryAction(mockActionState, formData);
				});
			}, 2000);
		};

		window.addEventListener("online", handleOnline);

		// Also try to sync on initial load if online
		if (navigator.onLine) {
			handleOnline();
		}

		return () => {
			window.removeEventListener("online", handleOnline);
		};
	}, []);

	return <>{children}</>;
}
