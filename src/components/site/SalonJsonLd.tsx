import type { Business } from "@/content/schema";
import { siteUrl } from "@/lib/env";

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** schema.org HairSalon — only verified business data from the CMS. */
export function SalonJsonLd({ business: b }: { business: Business }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: b.name,
    url: siteUrl,
    telephone: b.phone.e164,
    ...(b.email ? { email: b.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address.street,
      postalCode: b.address.postalCode,
      addressLocality: b.address.city,
      addressCountry: b.address.country,
    },
    openingHoursSpecification: b.hours
      .filter((d) => d.opens && d.closes)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dayNames[d.weekday]}`,
        opens: d.opens,
        closes: d.closes,
      })),
    ...(b.social.length ? { sameAs: b.social.map((s) => s.href) } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" to prevent breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
