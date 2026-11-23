/**
 * Opening-hours helpers (pure, client-safe). Everything is derived from the stored hours,
 * so changing one day in the admin updates every summary on the site.
 */
export type Hour = { weekday: number; label: string; opens: string | null; closes: string | null };

const short = (label: string) => label.slice(0, 2);

/**
 * Groups consecutive weekdays (Mon→Sun order) with identical times.
 * → ["Di – Fr 09:00 – 19:00 Uhr", "Sa 09:00 – 18:00 Uhr", "So, Mo geschlossen"]
 */
export function summarizeHours(hours: Hour[]): string[] {
  const days = [...hours].sort((a, b) => a.weekday - b.weekday);
  const groups: { from: Hour; to: Hour; key: string }[] = [];
  for (const d of days) {
    const key = d.opens ? `${d.opens}-${d.closes}` : "closed";
    const last = groups.at(-1);
    if (last && last.key === key && last.to.weekday === d.weekday - 1 && key !== "closed") last.to = d;
    else groups.push({ from: d, to: d, key });
  }
  const open = groups
    .filter((g) => g.key !== "closed")
    .map((g) => {
      const range = g.from === g.to ? short(g.from.label) : `${short(g.from.label)} – ${short(g.to.label)}`;
      return `${range} ${g.from.opens} – ${g.from.closes} Uhr`;
    });
  // closed days listed Sunday-first reads naturally ("So, Mo geschlossen")
  const closed = days.filter((d) => !d.opens).sort((a, b) => (a.weekday % 7) - (b.weekday % 7));
  if (closed.length) open.push(`${closed.map((d) => short(d.label)).join(", ")} geschlossen`);
  return open;
}

/** Weekdays (ISO 1–7) the salon is open — used by the booking calendar. */
export const openWeekdays = (hours: Hour[]) => new Set(hours.filter((h) => h.opens).map((h) => h.weekday));
