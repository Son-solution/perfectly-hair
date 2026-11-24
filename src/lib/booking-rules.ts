/**
 * Booking rules derived from the content layer (pure, client-safe).
 * Single source: `business.walkIn` + `business.hours`. Used by the public booking flow,
 * the callback form and the admin "Neuer Termin" dialog.
 *
 * IMPORTANT: this is UI guidance only. Phase 5B must enforce the same rules on the server
 * (Server Action / DB function) — see docs/DATABASE.md §7.
 */
export type Audience = "herren" | "damen" | "kinder";
export type WalkInPolicy = {
  enabled: boolean;
  rules: { audience: Audience; weekdays: number[] }[];
  title: string;
  text: string;
  bookingNotice: string;
};
export type HourRow = { weekday: number; opens: string | null; closes: string | null };

/** ISO weekday 1 (Mo) … 7 (So) for a YYYY-MM-DD date, timezone-safe. */
export const isoWeekdayOf = (date: string) => ((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

/** True if this audience is served walk-in only on that weekday (no appointment possible). */
export function isWalkInOnly(policy: WalkInPolicy | null | undefined, audience: string | null | undefined, weekday: number) {
  if (!policy?.enabled || !audience) return false;
  return policy.rules.some((r) => r.audience === audience && r.weekdays.includes(weekday));
}

/** Weekdays on which the audience can book (open days minus walk-in-only days). */
export function bookableWeekdays(hours: HourRow[], policy: WalkInPolicy | null | undefined, audience: string | null | undefined) {
  return new Set(hours.filter((h) => h.opens && !isWalkInOnly(policy, audience, h.weekday)).map((h) => h.weekday));
}

/** Opening window for a date, or null if closed. */
export function hoursOn(hours: HourRow[], date: string) {
  const h = hours.find((x) => x.weekday === isoWeekdayOf(date));
  return h?.opens && h.closes ? { opens: h.opens, closes: h.closes } : null;
}

/** "Fr & Sa" style label for the walk-in days of an audience. */
export function walkInDaysLabel(policy: WalkInPolicy | null | undefined, audience: Audience) {
  const names = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const days = policy?.rules.find((r) => r.audience === audience)?.weekdays ?? [];
  return days.map((d) => names[d]).join(" & ");
}
