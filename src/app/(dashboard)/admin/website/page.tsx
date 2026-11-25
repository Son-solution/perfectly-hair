import { Badge, Card, PageHeader, Table, Td, Th, btn } from "@/components/dashboard/ui";
import { getBusiness, getCategories, getEmployees, getGallery, listAllPages, listAllServices, listMedia } from "@/content/repository";
import { summarizeHours } from "@/lib/hours";
import { AUDIENCES, priceLabel } from "@/lib/pricing";

const PAGE_LABEL: Record<string, string> = {
  "": "Startseite", herren: "Herren", damen: "Damen", kinder: "Kinder", leistungen: "Leistungen", preise: "Preise", team: "Team",
  galerie: "Galerie", salon: "Salon", kontakt: "Kontakt", termin: "Termin", impressum: "Impressum", datenschutz: "Datenschutz",
  bildnachweise: "Bildnachweise", "3d-preview": "3D-Vorschau (Prototyp)",
};

/**
 * Website management shell. Reads the REAL content layer (src/content) — no duplicate CMS.
 * Editing (Server Actions → Supabase → revalidateTag) arrives in Phase 5B.
 */
export default async function AdminWebsitePage() {
  const [pages, services, business, categories, employees, inspiration, media] = await Promise.all([
    listAllPages(), listAllServices(), getBusiness(), getCategories(), getEmployees(), getGallery("inspiration"), listMedia(),
  ]);
  const edit = <button type="button" className={btn("secondary", "sm")} disabled title="Bearbeiten ab Phase 5B (Supabase)">Bearbeiten</button>;
  return (
    <>
      <PageHeader
        eyebrow="Verwaltung"
        title="Website"
        description="Inhalte der öffentlichen Website. Diese Übersicht liest die echten Inhalte aus der Content-Schicht; Bearbeiten wird mit der Datenbank-Anbindung freigeschaltet."
      />
      <div role="note" className="mb-6 rounded-lg border border-dashed border-dash-muted bg-dash-raised px-4 py-3 text-xs text-dash-muted">
        Echte Website-Inhalte (schreibgeschützt). Bearbeiten, Bild-Upload und Veröffentlichen folgen in Phase 5B – siehe docs/CMS_ARCHITECTURE.md.
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Seiten & Abschnitte" description={`${pages.length} Seiten`} padded>
          <Table label="Seiten">
            <thead><tr><Th>Seite</Th><Th>Status</Th><Th>SEO-Titel</Th><Th>Abschnitte</Th><Th className="text-right" /></tr></thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug}>
                  <Td className="font-medium">{PAGE_LABEL[p.slug] ?? p.slug}<span className="block text-xs font-normal text-dash-muted">/{p.slug}</span></Td>
                  <Td><span className="flex flex-wrap gap-1"><Badge tone={p.status === "published" ? "solid" : "dashed"}>{p.status === "published" ? "Veröffentlicht" : "Entwurf"}</Badge>{p.seo.noindex && <Badge tone="muted">noindex</Badge>}{!p.visible && <Badge tone="strike">Ausgeblendet</Badge>}</span></Td>
                  <Td className="max-w-56 truncate text-dash-muted">{p.seo.title ?? "Standardtitel"}</Td>
                  <Td className="tabular-nums">{p.sections.length}<span className="block text-xs text-dash-muted">{p.sections.filter((s) => !s.visible).length} ausgeblendet</span></Td>
                  <Td className="text-right">{edit}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card title="Kontakt & Öffnungszeiten" action={edit}>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-dash-muted">Adresse</dt><dd>{business.address.street}, {business.address.postalCode} {business.address.city}</dd></div>
              <div><dt className="text-xs text-dash-muted">Telefon</dt><dd>{business.phone.display}</dd></div>
              <div><dt className="text-xs text-dash-muted">E-Mail</dt><dd>{business.email ?? <span className="text-dash-muted">fehlt</span>}</dd></div>
              <div><dt className="text-xs text-dash-muted">Öffnungszeiten</dt><dd>{summarizeHours(business.hours).map((l) => <span key={l} className="block">{l}</span>)}</dd></div>
            </dl>
          </Card>
          <Card title="Team-Profile (Website)" action={edit}>
            <p className="text-sm">{employees.length === 0 ? "Noch keine veröffentlichten Profile." : `${employees.length} Profile`}</p>
            <p className="mt-1 text-xs text-dash-muted">Interne Mitarbeiterdaten (Dashboard) und öffentliche Profile bleiben getrennt.</p>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Leistungen & Preise" description="Eigener Preis je Bereich – bearbeiten unter „Leistungen & Preise“" action={<a href="/admin/services" className="text-xs font-medium underline underline-offset-2">Bearbeiten →</a>}>
          <Table label="Leistungen">
            <thead><tr><Th>Leistung</Th><Th>Herren</Th><Th>Damen</Th><Th>Kinder</Th><Th>Sichtbar</Th></tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <Td className="font-medium">{s.name}</Td>
                  {AUDIENCES.map((a) => <Td key={a} className="tabular-nums">{priceLabel(s.prices[a]) ?? <span className="text-dash-muted">–</span>}<span className="block text-xs text-dash-muted">{s.prices[a].available ? (s.prices[a].durationMin ? s.prices[a].durationMin + " Min." : "Dauer fehlt") : ""}</span></Td>)}
                  <Td>{s.visible ? "Ja" : "Nein"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <div className="space-y-4">
          <Card title="Bilder & Medien" action={edit}>
            <p className="text-sm">{media.length} Einträge · {media.filter((m) => m.src).length} mit Bild · {media.filter((m) => m.credit).length} Symbolbilder</p>
            <p className="mt-1 text-xs text-dash-muted">Upload über Supabase Storage (Phase 5B), automatisch in Schwarzweiß.</p>
          </Card>
          <Card title="Galerie" action={edit}><p className="text-sm">{inspiration.length} Inspirationsbilder · Portfolio: noch leer</p></Card>
          <Card title="Bereiche" action={edit}><p className="text-sm">{categories.map((c) => c.label).join(" · ")}</p></Card>
          <Card title="SEO" action={edit}><p className="text-sm">Titel, Beschreibung und noindex pro Seite (siehe Tabelle).</p></Card>
        </div>
      </div>
    </>
  );
}
