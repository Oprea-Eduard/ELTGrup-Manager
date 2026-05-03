import { DocumentCategory } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";

interface Document {
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
}

interface PlanSection {
  key: string;
  label: string;
  description: string;
  sampleTag: string;
  searchTerms: readonly string[];
}

interface PlanGroup extends PlanSection {
  docs: Document[];
}

export function ProjectPlansSection({ planGroups, generalDocuments, planDocumentCount, projectId }: {
  planGroups: PlanGroup[];
  generalDocuments: Document[];
  planDocumentCount: number;
  projectId: string;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Planuri proiect</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Documentele deja incarcate sunt grupate automat pe discipline. Adauga tag-ul disciplinei (ex. <span className="font-semibold text-[var(--foreground)]">{planGroups[0]?.sampleTag}</span>) pentru clasificare corecta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">{planDocumentCount} planuri</Badge>
          <Badge tone="neutral">{generalDocuments.length} alte documente</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {planGroups.map((group) => (
          <div key={group.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-panel)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Plan</p>
                <h3 className="text-base font-semibold text-[var(--foreground)]">{group.label}</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">{group.description}</p>
              </div>
              <Badge tone={group.docs.length ? "success" : "neutral"}>{group.docs.length}</Badge>
            </div>

            {group.docs.length > 0 ? (
              <div className="mt-3 space-y-2">
                {group.docs.slice(0, 3).map((document) => (
                  <div key={document.id} className="rounded-xl border border-[var(--border)]/70 bg-[var(--surface)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{document.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {document.fileName} • {document.project?.title || document.workOrder?.title || "Document"}
                        </p>
                      </div>
                      <Badge tone={document.isPrivate ? "neutral" : "success"}>{document.isPrivate ? "Privat" : "Public"}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`/api/documents/${document.id}/download`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)]"
                      >
                        Deschide
                      </a>
                      <Link
                        href={`/documente?projectId=${projectId}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                      >
                        Incarca alt plan
                      </Link>
                    </div>
                  </div>
                ))}
                {group.docs.length > 3 ? <p className="text-xs text-[var(--muted)]">+ {group.docs.length - 3} alte documente in aceasta categorie.</p> : null}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                Nu am gasit documente pentru aceasta disciplina. Adauga tag-ul <span className="font-semibold text-[var(--foreground)]">{group.sampleTag}</span> sau include disciplina in titlu.
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
