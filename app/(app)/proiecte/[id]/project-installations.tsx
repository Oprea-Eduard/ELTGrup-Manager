"use client";

import { InstallationStatus } from "@prisma/client";
import { formatDate } from "@/src/lib/utils";
import { InstallationForm } from "../installations/installation-form";
import { InspectionForm } from "../installations/inspection-form";
import { ListItemSlim } from "@/src/components/ui/list-item";
import { Badge } from "@/src/components/ui/badge";
import { updateInstallationStatus, archiveInstallation } from "../installations/actions";

interface Installation {
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
}

export function ProjectInstallations({ installations, projectId }: { installations: Installation[]; projectId: string }) {
  return (
    <div className="mt-3 space-y-1">
      {installations.length === 0 ? (
        <ListItemSlim className="text-[var(--muted)]">
          Nu exista instalatii inregistrate pe acest proiect.
        </ListItemSlim>
      ) : null}
      {installations.map((inst) => {
        const isOverdue = inst.nextCheckAt && new Date(inst.nextCheckAt) < new Date();
        return (
          <div key={inst.id} className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface)] p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <p className="truncate font-semibold text-[var(--foreground)]">{inst.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {inst.manufacturer} {inst.model || ""} {inst.serialNumber ? `| S/N ${inst.serialNumber}` : ""}
                </p>
              </div>
              <Badge
                tone={
                  inst.status === InstallationStatus.CERTIFIED ? "success" :
                  inst.status === InstallationStatus.INSTALLED ? "info" :
                  inst.status === InstallationStatus.UNDER_TEST ? "warning" :
                  inst.status === InstallationStatus.UNDER_MAINTENANCE ? "danger" : "neutral"
                }
              >
                {inst.status === InstallationStatus.UNDER_TEST ? "Testare" :
                 inst.status === InstallationStatus.CERTIFIED ? "Certificat" :
                 inst.status === InstallationStatus.UNDER_MAINTENANCE ? "In service" :
                 inst.status === InstallationStatus.DECOMMISSIONED ? "Retras" : "Instalat"}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
              {inst.warrantyMonths ? <span>Garantie {inst.warrantyMonths} luni</span> : null}
              {inst.installedAt ? <span>Instalat {formatDate(inst.installedAt)}</span> : null}
              {inst.nextCheckAt ? (
                <span className={isOverdue ? "font-semibold text-[var(--danger)]" : ""}>
                  Urm. verificare {formatDate(inst.nextCheckAt)}
                  {isOverdue ? " (DEPASIT)" : ""}
                </span>
              ) : null}
            </div>
            <InstallationStatusButtons installation={inst} projectId={projectId} />
            {inst.notes ? <p className="mt-1.5 text-[11px] text-[var(--muted)]">{inst.notes}</p> : null}
            <div className="mt-2">
              <InspectionForm installationId={inst.id} />
            </div>
          </div>
        );
      })}
      <InstallationForm projectId={projectId} />
    </div>
  );
}

const installationStatusLabels: Record<string, string> = {
  INSTALLED: "Instalat",
  UNDER_TEST: "Testare",
  CERTIFIED: "Certificat",
  UNDER_MAINTENANCE: "In service",
  DECOMMISSIONED: "Retras",
};

function InstallationStatusButtons({ installation, projectId }: { installation: Installation; projectId: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {Object.values(InstallationStatus).map((s) => (
        <form key={s} action={updateInstallationStatus} className="contents">
          <input type="hidden" name="id" value={installation.id} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="status" value={s} />
          <button
            type="submit"
            className={`rounded-md border px-2 py-0.5 text-[10px] transition-colors ${
              installation.status === s
                ? "border-[var(--success)]/40 bg-[var(--success)]/15 text-[var(--success)]"
                : "border-[var(--border)]/60 text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {installationStatusLabels[s] || s}
          </button>
        </form>
      ))}
      <form action={archiveInstallation} className="contents">
        <input type="hidden" name="id" value={installation.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <button
          type="submit"
          className="rounded-md border border-[var(--border)]/60 px-2 py-0.5 text-[10px] text-[var(--muted)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
        >
          Arhiveaza
        </button>
      </form>
    </div>
  );
}
