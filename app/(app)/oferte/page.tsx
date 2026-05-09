import Link from "next/link";
import { OfferStatus } from "@prisma/client";
import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { KpiCard } from "@/src/components/ui/kpi-card";
import { PageHeader } from "@/src/components/ui/page-header";
import { TD, TH, Table } from "@/src/components/ui/table";
import { FormModal } from "@/src/components/forms/form-modal";
import { auth } from "@/src/lib/auth";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { prisma } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { archiveOffer, updateOfferStatus, convertOfferToProject } from "./actions";
import { OfferCreateForm } from "./offer-create-form";

const offerStatusMeta: Record<OfferStatus, { label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }> = {
  DRAFT: { label: "Ciorna", tone: "neutral" },
  SENT: { label: "Trimisa", tone: "info" },
  ACCEPTED: { label: "Acceptata", tone: "success" },
  REJECTED: { label: "Respinsa", tone: "danger" },
  EXPIRED: { label: "Expirata", tone: "warning" },
};

export default async function OfertePage() {
  const session = await auth();
  const roleKeys = session?.user?.roleKeys || [];
  const userEmail = session?.user?.email || null;
  const canCreate = hasPermission(roleKeys, "OFFERS", "CREATE", userEmail);
  const canUpdate = hasPermission(roleKeys, "OFFERS", "UPDATE", userEmail);
  const canDelete = hasPermission(roleKeys, "OFFERS", "DELETE", userEmail);

  const offers = await prisma.offer.findMany({
    where: { deletedAt: null },
    include: { client: { select: { name: true } }, items: { select: { id: true } }, project: { select: { code: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 50,
  });

  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Calculate KPIs
  const totalOffersValue = offers.reduce((sum, offer) => sum + Number(offer.totalAmount), 0);
  const activeOffers = offers.filter(o => o.status === OfferStatus.SENT).length;
  const acceptedOffers = offers.filter(o => o.status === OfferStatus.ACCEPTED).length;

  return (
    <PermissionGuard resource="OFFERS" action="VIEW">
      <div className="page-stack">
        <PageHeader
          title="Oferte tehnice"
          subtitle="Gestiunea pipeline-ului comercial"
          actions={
            canCreate && (
              <FormModal triggerLabel="Oferta noua" title="Creare oferta tehnica">
                <OfferCreateForm clients={clients} />
              </FormModal>
            )
          }
        />

        <section className="page-kpis">
          <KpiCard label="Oferte active" value={String(activeOffers)} helper="trimise clientilor" severity="pending" />
          <KpiCard label="Valoare totala" value={formatCurrency(totalOffersValue)} helper="potential comercial" severity="info" />
          <KpiCard label="Acceptate" value={String(acceptedOffers)} helper="convertite/de convertit" severity="active" />
          <KpiCard label="Rata succes" value={offers.length > 0 ? `${((acceptedOffers / offers.length) * 100).toFixed(0)}%` : "0%"} helper="din total oferte" severity="done" />
        </section>

        {offers.length === 0 ? (
          <EmptyState
            title="Nicio oferta"
            description="Creeaza prima oferta tehnica pentru un client. Pipeline-ul comercial porneste aici."
          />
        ) : (
          <Card className="flush">
            <Table>
              <thead>
                <tr>
                  <TH>Cod</TH>
                  <TH>Titlu</TH>
                  <TH>Client</TH>
                  <TH>Status</TH>
                  <TH className="text-center">Pozitii</TH>
                  <TH className="text-right">Valoare</TH>
                  <TH>Valabilitate</TH>
                  <TH>Proiect</TH>
                  <TH className="text-right">Actiuni</TH>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const meta = offerStatusMeta[offer.status];
                  return (
                    <tr key={offer.id} className="group">
                      <TD className="font-mono text-[10px] text-[var(--muted-strong)]">{offer.code}</TD>
                      <TD className="font-medium">{offer.title}</TD>
                      <TD className="text-[var(--muted)]">{offer.client?.name}</TD>
                      <TD>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </TD>
                      <TD className="text-center">{offer.items.length}</TD>
                      <TD className="text-right font-semibold tabular-nums">{formatCurrency(Number(offer.totalAmount))}</TD>
                      <TD className="text-[var(--muted)]">{formatDate(offer.validUntil)}</TD>
                      <TD>
                        {offer.project ? (
                          <Link href={`/proiecte/${offer.projectId}`} className="text-xs text-[var(--accent)] hover:underline">
                            {offer.project.code}
                          </Link>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                          {canUpdate && offer.status !== OfferStatus.ACCEPTED && (
                            <form action={updateOfferStatus}>
                              <input type="hidden" name="id" value={offer.id} />
                              <input type="hidden" name="status" value="SENT" />
                              <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                Trimite
                              </Button>
                            </form>
                          )}
                          {canUpdate && offer.status === OfferStatus.SENT && (
                            <form action={updateOfferStatus}>
                              <input type="hidden" name="id" value={offer.id} />
                              <input type="hidden" name="status" value="ACCEPTED" />
                              <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--success)]">
                                Accepta
                              </Button>
                            </form>
                          )}
                          {canUpdate && offer.status === OfferStatus.ACCEPTED && !offer.projectId && (
                            <form action={convertOfferToProject}>
                              <input type="hidden" name="id" value={offer.id} />
                              <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--accent)]">
                                → Proiect
                              </Button>
                            </form>
                          )}
                          {canDelete && (
                            <form action={archiveOffer}>
                              <input type="hidden" name="id" value={offer.id} />
                              <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--danger)]">
                                Arhivare
                              </Button>
                            </form>
                          )}
                        </div>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
