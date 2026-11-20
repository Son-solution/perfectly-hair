import { businessHours, site } from "@/config/site";
import { siteUrl } from "@/lib/env";

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** schema.org HairSalon — only verified business data (address, phone, hours). */
export function SalonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: site.name,
    url: siteUrl,
    telephone: "+49 611 307674",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: businessHours
      .filter((d) => d.opens && d.closes)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dayNames[d.weekday]}`,
        opens: d.opens,
        closes: d.closes,
      })),
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" to prevent breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
