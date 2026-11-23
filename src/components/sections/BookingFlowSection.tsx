import { Suspense } from "react";
import { BookingFlow, BookingFlowFromUrl, type BookingFlowProps } from "@/components/booking/BookingFlow";
import { Reveal } from "@/components/motion";
import type { Business, SectionOf, Service } from "@/content/schema";
import { openWeekdays } from "@/lib/hours";

export function BookingFlowSection({
  section, categories, services, employees, hours, phone,
}: {
  section: SectionOf<"booking-flow">;
  categories: BookingFlowProps["categories"];
  services: Service[];
  employees: BookingFlowProps["employees"];
  hours: Business["hours"];
  phone: BookingFlowProps["phone"];
}) {
  const props: BookingFlowProps = { categories, services, employees, phone, openWeekdays: [...openWeekdays(hours)] };
  return (
    <section aria-label="Online-Buchung (Vorschau)" className="bg-bone py-20 md:py-32">
      <div className="container-luxe max-w-5xl">
        <Reveal className="mb-10">
          <div role="note" className="border border-ink bg-white p-6 md:p-8">
            <p className="flex items-center gap-3 text-eyebrow font-medium uppercase">
              <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-ink" />
              Online-Buchung noch nicht verfügbar
            </p>
            <p className="mt-4 leading-relaxed text-graphite">
              {section.notice} Bitte vereinbaren Sie Ihren Termin telefonisch unter{" "}
              <a href={phone.href} className="underline underline-offset-4">{phone.display}</a>.
            </p>
          </div>
        </Reveal>
        {/* URL preselection (?kategorie=&leistung=&mitarbeiter=) is read on the client; the
            fallback renders the same flow without preselection, so nothing is hidden. */}
        <Suspense fallback={<BookingFlow {...props} />}>
          <BookingFlowFromUrl {...props} />
        </Suspense>
      </div>
    </section>
  );
}
