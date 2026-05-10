import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferStatus } from "@prisma/client";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { TD, TH, Table } from "@/src/components/ui/table";
import { ConfirmSubmitButton } from "@/src/components/forms/confirm-submit-button";
import { auth } from "@/src/lib/auth";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { hasPermission } from "@/src/lib/rbac";
import { prisma } from "@/src/lib/prisma";
import {
  archiveOffer,
  updateOfferStatus,
  convertOfferToProject,
} from "../actions";

const offerStatusMeta: Record<
  OfferStatus,
  { label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }
> = {
  DRAFT: { label: "Ciorna", tone: "neutral" },
  SENT: { label: "Trimisa", tone: "info" },
  ACCEPTED: { label: "Acceptata", tone: "success" },
  REJECTED: { label: "Respinsa", tone: "danger" },
  EXPIRED: { label: "Expirata", tone: "warning" },
};

export default async function OfertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const roleKeys = session?.user?.roleKeys || [];
  const userEmail = session?.user?.email || null;
  const canUpdate = hasPermission(roleKeys, "OFFERS", "UPDATE", userEmail);
  const canDelete = hasPermission(roleKeys, "OFFERS", "DELETE", userEmail);

  const offer = await prisma.offer.findUnique({
    where: { id, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      project: { select: { id: true, code: true, title: true } },
      items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });

  if (!offer) notFound();

  const meta = offerStatusMeta[offer.status];
  const itemsTotal = offer.items.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0,
  );
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (offer.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpired = daysUntilExpiry < 0;

  return (
    <PermissionGuard resource="OFFERS" action="VIEW">
      <div className="page-stack">
        <PageHeader
          title={offer.title}
          subtitle={`${offer.code} · ${offer.client.name}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href="/oferte">
                <Button variant="secondary">← Inapoi la lista</Button>
              </Link>
              {canUpdate && offer.status === OfferStatus.DRAFT && (
                <form action={updateOfferStatus}>
                  <input type="hidden" name="id" value={offer.id} />
                  <input type="hidden" name="status" value="SENT" />
                  <Button type="submit">Trimite oferta</Button>
                </form>
              )}
              {canUpdate && offer.status === OfferStatus.SENT && (
                <form action={updateOfferStatus}>
                  <input type="hidden" name="id" value={offer.id} />
                  <input type="hidden" name="status" value="ACCEPTED" />
                  <Button type="submit" className="bg-[var(--success)] text-white hover:bg-[var(--success)]/90">
                    Marcheaza acceptata
                  </Button>
                </form>
              )}
              {canUpdate &&
                offer.status === OfferStatus.ACCEPTED &&
                !offer.projectId && (
                  <form action={convertOfferToProject}>
                    <input type="hidden" name="id" value={offer.id} />
                    <Button type="submit">→ Converteste in proiect</Button>
                  </form>
                )}
            </div>
          }
        />

        {/* KPIs */}
        <section className="page-kpis">
          <KpiCard
            label="Status"
            value={meta.label}
            severity={
              offer.status === "ACCEPTED"
                ? "done"
                : offer.status === "REJECTED"
                  ? "blocked"
                  : offer.status === "SENT"
                    ? "pending"
                    : "info"
            }
          />
          <KpiCard
            label="Valoare totala"
            value={formatCurrency(Number(offer.totalAmount))}
            helper={`${offer.items.length} pozitii`}
            severity="info"
          />
          <KpiCard
            label="Valabilitate"
            value={
              isExpired
                ? `Expirata`
                : `${daysUntilExpiry} zile`
            }
            helper={formatDate(offer.validUntil)}
            severity={isExpired ? "blocked" : daysUntilExpiry <= 7 ? "pending" : "active"}
          />
          <KpiCard
            label="Proiect asociat"
            value={offer.project ? offer.project.code : "—"}
            helper={offer.project ? offer.project.title : "Neconvertita"}
            severity={offer.project ? "done" : "info"}
          />
        </section>

        {/* Offer details */}
        <div className="grid gap-3 xl:grid-cols-2">
          <Card className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Detalii oferta
            </p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Cod</span>
                <span className="font-medium text-[var(--foreground)]">{offer.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Data emitere</span>
                <span className="text-[var(--foreground)]">{formatDate(offer.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Valabila pana</span>
                <span className={`font-medium ${isExpired ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}>
                  {formatDate(offer.validUntil)}
                </span>
              </div>
              {offer.acceptedAt && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Acceptata la</span>
                  <span className="text-[var(--success)]">{formatDate(offer.acceptedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Moneda</span>
                <span className="text-[var(--foreground)]">{offer.currency}</span>
              </div>
            </div>
            {offer.description && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Descriere</p>
                <p className="mt-1 text-sm text-[var(--foreground)] whitespace-pre-line">{offer.description}</p>
              </div>
            )}
            {offer.notes && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Observatii</p>
                <p className="mt-1 text-sm text-[var(--muted-strong)] whitespace-pre-line">{offer.notes}</p>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Client
            </p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Denumire</span>
                <Link
                  href={`/clienti/${offer.client.id}`}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {offer.client.name}
                </Link>
              </div>
              {offer.client.email && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Email</span>
                  <span className="text-[var(--foreground)]">{offer.client.email}</span>
                </div>
              )}
              {offer.client.phone && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Telefon</span>
                  <span className="text-[var(--foreground)]">{offer.client.phone}</span>
                </div>
              )}
            </div>
            {offer.project && (
              <>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    Proiect generat
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Cod</span>
                    <Link
                      href={`/proiecte/${offer.project.id}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {offer.project.code}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Titlu</span>
                    <span className="text-[var(--foreground)]">{offer.project.title}</span>
                  </div>
                </div>
              </>
            )}

            {/* Status change + actions */}
            {canUpdate && (
              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Schimba status
                </p>
                <form
                  action={updateOfferStatus}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={offer.id} />
                  <select
                    name="status"
                    defaultValue={offer.status}
                    className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-sm"
                  >
                    {Object.values(OfferStatus).map((status) => (
                      <option key={status} value={status}>
                        {offerStatusMeta[status].label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="secondary">
                    Salveaza
                  </Button>
                </form>
              </div>
            )}
            {canDelete && (
              <div className="border-t border-[var(--border)] pt-3">
                <form action={archiveOffer}>
                  <input type="hidden" name="id" value={offer.id} />
                  <ConfirmSubmitButton
                    text="Arhiveaza oferta"
                    confirmMessage={`Confirmi arhivarea ofertei ${offer.code}?`}
                    variant="destructive"
                  />
                </form>
              </div>
            )}
          </Card>
        </div>

        {/* Items table */}
        <Card className="flush">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Pozitii oferta
              </p>
              <p className="text-xs text-[var(--muted)]">
                {offer.items.length} pozitii · Total calculat:{" "}
                {formatCurrency(itemsTotal)}
              </p>
            </div>
            <Badge tone="info">{offer.items.length} pozitii</Badge>
          </div>
          {offer.items.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-[var(--muted)]">
                Aceasta oferta nu are pozitii detaliate. Valoarea totala a fost
                introdusa manual.
              </p>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TH className="w-10">#</TH>
                  <TH>Denumire</TH>
                  <TH>Categorie</TH>
                  <TH className="text-right">Cant.</TH>
                  <TH className="text-right">Pret unitar</TH>
                  <TH className="text-right">Total</TH>
                </tr>
              </thead>
              <tbody>
                {offer.items.map((item, idx) => (
                  <tr key={item.id}>
                    <TD className="text-center text-xs text-[var(--muted)]">
                      {idx + 1}
                    </TD>
                    <TD>
                      <p className="font-medium text-[var(--foreground)]">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {item.description}
                        </p>
                      )}
                    </TD>
                    <TD className="text-xs text-[var(--muted)]">
                      {item.category || "—"}
                    </TD>
                    <TD className="text-right tabular-nums">
                      {Number(item.quantity).toFixed(2)}
                    </TD>
                    <TD className="text-right tabular-nums text-[var(--muted-strong)]">
                      {formatCurrency(Number(item.unitPrice))}
                    </TD>
                    <TD className="text-right font-semibold tabular-nums">
                      {formatCurrency(Number(item.totalPrice))}
                    </TD>
                  </tr>
                ))}
                <tr className="border-t-2 border-[var(--border)]">
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-[var(--foreground)]">
                    Total pozitii
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-[var(--foreground)]">
                    {formatCurrency(itemsTotal)}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </PermissionGuard>
  );
}
