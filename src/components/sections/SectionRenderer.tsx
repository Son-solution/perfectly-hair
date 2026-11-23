import type { ReactNode } from "react";
import { BookingFinale } from "@/components/experience/BookingFinale";
import { CategoryPanels } from "@/components/experience/CategoryPanels";
import { CinematicGallery } from "@/components/experience/CinematicGallery";
import { EditorialStory } from "@/components/experience/EditorialStory";
import { HeroCinematic } from "@/components/experience/HeroCinematic";
import { MaskLines } from "@/components/motion/MaskLines";
import { PageHero } from "@/components/site/PageHero";
import {
  getBusiness, getCategories, getEmployees, getGallery, getMediaResolver, getServices,
  getSiteChrome, getStockMedia,
} from "@/content/repository";
import type { Page, Section } from "@/content/schema";
import { emphasis } from "@/lib/emphasis";
import { BookingFlowSection } from "./BookingFlowSection";
import { ContactDetailsSection, LocationSection } from "./contact";
import {
  AudienceIndexSection, EditorialSplitSection, MarqueeSection, NoticeSection,
  OtherAudiencesSection, PrinciplesSection, ValuesSection,
} from "./editorial";
import { GalleryGridSection } from "./GalleryGridSection";
import { CreditsSection, LegalTextSection } from "./legal";
import { PriceListSection, ServiceListSection } from "./services";
import { TeamSection } from "./TeamSection";

/**
 * Renders a CMS page: each section `type` maps to one presentation component.
 * Content is loaded here (server) and passed down as props — presentation components
 * never fetch data themselves. Unknown/invisible sections are skipped by the repository.
 */
export async function SectionRenderer({ page }: { page: Page }) {
  const [business, chrome, categories, employees, inspiration, portfolio, media, stock] = await Promise.all([
    getBusiness(), getSiteChrome(), getCategories(), getEmployees(),
    getGallery("inspiration"), getGallery("portfolio"), getMediaResolver(), getStockMedia(),
  ]);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const allServices = await getServices();
  const servicesFor = async (a: Parameters<typeof getServices>[0]) => getServices(a);

  /** "tel:" in CMS content is shorthand for the salon phone number. */
  const resolveHref = (href: string) => (href === "tel:" ? chrome.phone.href : href);
  const finaleContact = {
    phone: chrome.phone, hoursLines: chrome.hoursLines, street: chrome.street,
    cityLine: chrome.cityLine, mapsUrl: chrome.mapsUrl, onlineBookingActive: chrome.onlineBookingActive,
  };
  const galleryCards = inspiration.map((g) => ({
    id: g.id, image: media(g.imageId), ratio: g.ratio,
    label: g.caption ?? categoryBySlug.get(g.group as never)?.label ?? "Salon",
  }));

  async function render(section: Section, index: number): Promise<ReactNode> {
    switch (section.type) {
      case "hero-cinematic":
        return (
          <HeroCinematic
            eyebrow={section.eyebrow}
            edgeLabel={section.edgeLabel}
            stockLabel={`${chrome.stockLabel}er`}
            brandFirst={chrome.shortName.split(" ")[0]}
            brandSecond={chrome.shortName.split(" ").slice(1).join(" ")}
            brandSuffix={chrome.byline}
            slides={section.slides.map((sl, i) => {
              const c = categoryBySlug.get(sl.audience)!;
              return {
                slug: c.slug, label: c.label, titleItalic: c.titleItalic,
                chapter: String(i + 1).padStart(2, "0"),
                bg: media(sl.imageId), inset: media(sl.insetImageId),
              };
            })}
          />
        );

      case "audience-panels":
        return (
          <section aria-labelledby={section.id} className="bg-ink pb-2 pt-24 text-white md:pt-36">
            <div className="container-luxe mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
              <MaskLines
                id={section.id}
                className="font-display text-[clamp(3rem,8vw,8rem)] font-normal leading-[0.9]"
                lines={section.titleLines.map((l) => emphasis(l, "italic text-outline-light"))}
              />
              <p className="max-w-sm leading-relaxed text-white/65">{section.intro}</p>
            </div>
            <div className="px-1.5 md:px-2">
              <CategoryPanels
                stockLabel={chrome.stockLabel}
                panels={categories.map((c) => ({ ...c, hero: media(c.heroImageId) }))}
              />
            </div>
          </section>
        );

      case "editorial-story":
        return (
          <EditorialStory
            eyebrow={section.eyebrow}
            titleLines={section.titleLines}
            paragraphs={section.paragraphs}
            addressLine={`${chrome.addressLine}.`}
            hoursLine={chrome.hoursLines.join(" · ")}
            values={section.values}
            cta={section.cta}
            images={[media(section.imageIds[0]), media(section.imageIds[1]), media(section.imageIds[2])]}
            marqueeWords={section.marqueeWords}
            collageWords={categories.map((c) => c.label)}
            creditLine={`${chrome.stockLabel}er · Unsplash`}
          />
        );

      case "cinematic-gallery":
        return (
          <CinematicGallery
            items={galleryCards}
            stockLabel={chrome.stockLabel}
            heading={section.showHeading ? { eyebrow: section.eyebrow, title: section.title, italic: section.italic, cta: section.cta } : null}
            creditsLink={{ label: "Bildnachweise", href: "/bildnachweise" }}
          />
        );

      case "price-list":
        return <PriceListSection section={section} services={allServices} phone={chrome.phone} />;

      case "booking-finale":
        return (
          <BookingFinale
            title={section.title}
            italic={section.italic}
            image={media(section.imageId)}
            compact={section.compact}
            contact={finaleContact}
            stockLabel={chrome.stockLabel}
          />
        );

      case "page-hero": {
        // Audience pages take their hero from the category (single source of truth).
        const audienceSlug = page.slug as "herren" | "damen" | "kinder";
        const cat = categoryBySlug.get(audienceSlug);
        const fromCategory = cat && !section.title;
        return (
          <PageHero
            eyebrow={fromCategory ? cat.eyebrow : section.eyebrow}
            title={fromCategory ? cat.title : section.title}
            italic={(fromCategory ? cat.titleItalic : section.italic) ?? undefined}
            intro={(fromCategory ? cat.intro : section.intro) ?? undefined}
            image={fromCategory ? media(cat.heroImageId) : section.imageId ? media(section.imageId) : undefined}
            stockLabel={chrome.stockLabel}
            placeholderLabel={chrome.placeholderLabel}
            ctas={
              fromCategory
                ? [
                    { label: `Termin: ${chrome.phone.display}`, href: chrome.phone.href, variant: "solid" as const },
                    { label: "Termin online (Vorschau)", href: `/termin?kategorie=${cat.slug}`, variant: "outline" as const },
                  ]
                : section.ctas.map((c) => ({ ...c, href: resolveHref(c.href), label: c.href === "tel:" ? `${c.label}: ${chrome.phone.display}` : c.label }))
            }
          />
        );
      }

      case "principles": {
        const cat = categoryBySlug.get(section.audience)!;
        return <PrinciplesSection section={section} principles={cat.principles} image={media(cat.detailImageId)} />;
      }

      case "service-list":
        return <ServiceListSection section={section} services={await servicesFor(section.audience)} category={section.audience ? categoryBySlug.get(section.audience) ?? null : null} />;

      case "audience-index":
        return <AudienceIndexSection section={section} categories={categories.map((c) => ({ ...c, hero: media(c.heroImageId) }))} />;

      case "other-audiences":
        return (
          <OtherAudiencesSection
            section={section}
            categories={categories.filter((c) => c.slug !== section.current).map((c) => ({ ...c, hero: media(c.heroImageId) }))}
          />
        );

      case "marquee":
        return <MarqueeSection section={section} />;

      case "notice":
        return <NoticeSection section={section} />;

      case "editorial-split":
        return <EditorialSplitSection section={section} images={section.imageIds.map(media)} placeholderLabel={chrome.placeholderLabel} />;

      case "values":
        return <ValuesSection section={section} />;

      case "team":
        return <TeamSection section={section} employees={employees.map((e) => ({ ...e, image: e.imageId ? media(e.imageId) : null }))} placeholder={media("team-placeholder")} />;

      case "gallery-grid": {
        const items = (section.collection === "inspiration" ? inspiration : portfolio).map((g) => ({
          id: g.id, group: g.group, ratio: g.ratio, image: media(g.imageId), caption: g.caption,
        }));
        return <GalleryGridSection section={section} items={items} filterLabels={Object.fromEntries(categories.map((c) => [c.slug, c.label]))} />;
      }

      case "contact-details":
        return <ContactDetailsSection section={section} chrome={chrome} email={business.email} />;

      case "location":
        return <LocationSection section={section} mapsUrl={chrome.mapsUrl} addressLine={chrome.addressLine} />;

      case "booking-flow":
        return (
          <BookingFlowSection
            section={section}
            categories={categories.map((c) => ({ slug: c.slug, label: c.label }))}
            services={allServices}
            employees={employees.filter((e) => e.bookable).map((e) => ({ id: e.id, name: e.name, audiences: e.audiences }))}
            hours={business.hours}
            phone={chrome.phone}
          />
        );

      case "legal-text":
        return <LegalTextSection section={section} business={business} />;

      case "credits":
        return <CreditsSection section={section} stock={stock} />;

      default: {
        const unreachable: never = section;
        void index;
        return unreachable;
      }
    }
  }

  const nodes = await Promise.all(page.sections.map((s, i) => render(s, i)));
  return (
    <>
      {nodes.map((n, i) => (
        <div key={page.sections[i].id} data-section={page.sections[i].type} className="contents">
          {n}
        </div>
      ))}
    </>
  );
}
