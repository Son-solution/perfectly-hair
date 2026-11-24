import type { Link, MediaAsset } from "./schema";

/**
 * Client-safe view model for the global site chrome (header, menu, footer).
 * Built on the server from the repository (see `getSiteChrome`) and passed as props,
 * so client components never import data or the repository.
 */
export type SiteChrome = {
  name: string;
  shortName: string;
  byline: string;
  phone: { display: string; href: string };
  street: string;
  cityLine: string;
  addressLine: string;
  mapsUrl: string;
  hoursLines: string[];
  primaryNav: Link[];
  secondaryNav: Link[];
  cta: Link;
  legalNav: Link[];
  menu: (Link & { primary: boolean; image: MediaAsset })[];
  footerTagline: string;
  bandWords: string[];
  stockLabel: string;
  placeholderLabel: string;
  onlineBookingActive: boolean;
  /** Walk-in announcement for hours blocks (from business.walkIn), or null when disabled. */
  walkIn: { title: string; text: string } | null;
};
