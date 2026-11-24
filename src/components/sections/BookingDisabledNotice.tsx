/** Shown on the Termin page when the booking mode is DISABLED: phone + walk-in, no forms. */
export function BookingDisabledNotice({ phone, walkIn }: { phone: { display: string; href: string }; walkIn: { title: string; text: string } | null }) {
  return (
    <section aria-label="Terminvereinbarung" className="bg-bone py-20 md:py-28">
      <div className="container-luxe max-w-5xl">
        <div className="border border-mist bg-white p-6 md:p-10">
          <p className="text-eyebrow font-medium uppercase text-stone">Termine</p>
          <h2 className="mt-[var(--space-label)] font-display text-display-lg">Bitte rufen Sie uns an.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-graphite">
            Termine vereinbaren wir derzeit ausschließlich telefonisch unter{" "}
            <a href={phone.href} className="underline underline-offset-4">{phone.display}</a>.
          </p>
          {walkIn && <p className="mt-4 max-w-xl leading-relaxed text-graphite"><span className="italic text-ink">{walkIn.title}.</span> {walkIn.text}</p>}
        </div>
      </div>
    </section>
  );
}
