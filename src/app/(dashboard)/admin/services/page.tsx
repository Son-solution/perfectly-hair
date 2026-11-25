import { ServicesEditor } from "@/components/dashboard/admin/ServicesEditor";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { listAllServices } from "@/content/repository";

/** Leistungen & Preise — reads the REAL content layer (src/content/data/catalogue.ts). */
export default async function ServicesPage() {
  const services = await listAllServices();
  return (
    <>
      <PageHeader
        eyebrow="Verwaltung"
        title="Leistungen & Preise"
        description="Jede Leistung hat für Herren, Damen und Kinder einen eigenen Preis, eine eigene Dauer und kann je Bereich angeboten oder ausgeblendet werden."
      />
      <DemoBanner>Echte Leistungsdaten der Website. Startwerte = Flyerpreise für alle Bereiche. Änderungen werden geprüft, aber erst mit Phase 5B gespeichert und auf der Website veröffentlicht.</DemoBanner>
      <ServicesEditor initial={services.map((s) => ({ id: s.id, name: s.name, visible: s.visible, order: s.order, source: s.source, prices: s.prices }))} />
    </>
  );
}
