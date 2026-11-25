/**
 * Per-audience pricing helpers (pure, client-safe). Every service has its own price, "ab"-flag
 * and duration for Herren, Damen and Kinder (see `audiencePrice` in src/content/schema.ts).
 */
import { formatPrice } from "./format";

export const AUDIENCES = ["herren", "damen", "kinder"] as const;
export type AudienceKey = (typeof AUDIENCES)[number];
export const AUDIENCE_LABEL: Record<AudienceKey, string> = { herren: "Herren", damen: "Damen", kinder: "Kinder" };

export type AudiencePriceLike = { available: boolean; priceCents: number | null; priceIsFrom: boolean; durationMin: number | null };
export type PricedService = { prices: Record<AudienceKey, AudiencePriceLike> };

/** "20 €", "ab 10 €", "Preis auf Anfrage" — or null when the service is not offered for the audience. */
export function priceLabel(p: AudiencePriceLike): string | null {
  if (!p.available) return null;
  return p.priceCents !== null ? formatPrice(p.priceCents, p.priceIsFrom) : "Preis auf Anfrage";
}

export const isOfferedFor = (s: PricedService, a: AudienceKey) => s.prices[a].available;
export const offeredAudiences = (s: PricedService) => AUDIENCES.filter((a) => s.prices[a].available);

/** Audience-neutral summary for places without an audience context: "ab 15 €" (lowest price). */
export function priceSummary(s: PricedService): string {
  const offered = offeredAudiences(s).map((a) => s.prices[a]);
  const known = offered.filter((p) => p.priceCents !== null);
  if (!known.length) return "Preis auf Anfrage";
  const min = Math.min(...known.map((p) => p.priceCents!));
  const allSame = known.length === offered.length && known.every((p) => p.priceCents === min && !p.priceIsFrom);
  return allSame ? formatPrice(min) : formatPrice(min, true);
}
