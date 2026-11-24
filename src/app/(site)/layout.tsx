import { SalonJsonLd } from "@/components/site/SalonJsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getBusiness, getSiteChrome } from "@/content/repository";
import { demoReady } from "@/features/demo/config";

/** Global chrome is CMS content too: loaded once here and passed down as props. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [chrome, business] = await Promise.all([getSiteChrome(), getBusiness()]);
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3 focus:text-ink"
      >
        Zum Inhalt springen
      </a>
      <SiteHeader chrome={chrome} />
      <main id="inhalt">{children}</main>
      <SiteFooter chrome={chrome} />
      <SalonJsonLd business={business} />
      {demoReady && (
        // Protected client demo: quick access to the dashboards + logout (not rendered in production).
        <div className="fixed bottom-4 left-4 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-0.5 rounded-full border border-white/20 bg-ink/90 p-1 text-[0.6875rem] uppercase tracking-[0.14em] text-white shadow-xl backdrop-blur">
          <span className="hidden px-3 sm:inline">Kundenvorschau</span>
          <a href="/admin" className="rounded-full px-2.5 py-1.5 hover:bg-white/15 sm:px-3">Admin</a>
          <a href="/staff" className="rounded-full px-2.5 py-1.5 hover:bg-white/15 sm:px-3">Mitarbeiter</a>
          <form method="post" action="/demo-zugang/logout"><button type="submit" className="rounded-full px-2.5 py-1.5 hover:bg-white/15 sm:px-3">Abmelden</button></form>
        </div>
      )}
    </>
  );
}
