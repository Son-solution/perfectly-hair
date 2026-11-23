import { SalonJsonLd } from "@/components/site/SalonJsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getBusiness, getSiteChrome } from "@/content/repository";

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
    </>
  );
}
