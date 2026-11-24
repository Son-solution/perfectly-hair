import { z } from "zod";
import { hoursOn, isoWeekdayOf, isWalkInOnly, type HourRow, type WalkInPolicy } from "@/lib/booking-rules";

/**
 * Public form contracts (Phase 5A.1). Used for client-side validation today; Phase 5B Server
 * Actions MUST parse the same schemas on the server (never trust the client), plus rate
 * limiting, honeypot/spam checks and duplicate detection — see docs/DATABASE.md §7–8.
 */

const phone = z.string().trim()
  .regex(/^[+0-9 ()/-]{6,20}$/, "Bitte geben Sie eine gültige Telefonnummer an.")
  .refine((v) => v.replace(/\D/g, "").length >= 6, "Bitte geben Sie eine gültige Telefonnummer an.");
const optionalEmail = z.union([z.literal(""), z.email("Bitte geben Sie eine gültige E-Mail-Adresse an.")]);
const consent = z.literal(true, { error: "Bitte bestätigen Sie die Datenschutzhinweise." });
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export const CALLBACK_MAX_DAYS_AHEAD = 90;
export const CALLBACK_MIN_DURATION = 30;

/** "Termin anfragen & Rückruf erhalten". `today` is passed in so the server uses server time. */
export function callbackRequestSchema(ctx: { hours: HourRow[]; walkIn: WalkInPolicy | null; today: string; maxDate: string }) {
  return z.object({
    name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(80),
    phone,
    email: optionalEmail,
    category: z.enum(["herren", "damen", "kinder"], { error: "Bitte wählen Sie einen Bereich." }),
    serviceId: z.string().min(1, "Bitte wählen Sie eine Leistung."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte wählen Sie ein Datum."),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Bitte wählen Sie eine Uhrzeit."),
    altTime: z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/)]),
    message: z.string().trim().max(500, "Maximal 500 Zeichen."),
    consent,
  }).superRefine((v, c) => {
    for (const issue of callbackDateIssues(v, ctx)) c.addIssue({ code: "custom", path: [issue.path], message: issue.message });
  });
}

type CallbackCtx = Parameters<typeof callbackRequestSchema>[0];
/**
 * Date/time rules (past, range, closed day, walk-in rule, opening hours). Standalone so the
 * form can show them even while other fields are still invalid (Zod skips object refinements
 * when a field fails); the schema runs the same function, so the server enforces it too.
 */
export function callbackDateIssues(v: { date: string; time: string; altTime: string; category: string }, ctx: CallbackCtx): { path: "date" | "time" | "altTime"; message: string }[] {
  const out: { path: "date" | "time" | "altTime"; message: string }[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return out;
  const withinHours = (t: string) => {
    const h = hoursOn(ctx.hours, v.date);
    return !!h && toMin(t) >= toMin(h.opens) && toMin(t) + CALLBACK_MIN_DURATION <= toMin(h.closes);
  };
  if (v.date < ctx.today) out.push({ path: "date", message: "Das Datum liegt in der Vergangenheit." });
  else if (v.date > ctx.maxDate) out.push({ path: "date", message: `Bitte wählen Sie ein Datum innerhalb der nächsten ${CALLBACK_MAX_DAYS_AHEAD} Tage.` });
  else if (!hoursOn(ctx.hours, v.date)) out.push({ path: "date", message: "An diesem Tag ist der Salon geschlossen." });
  else if (isWalkInOnly(ctx.walkIn, v.category, isoWeekdayOf(v.date))) out.push({ path: "date", message: ctx.walkIn?.bookingNotice ?? "An diesem Tag sind keine Termine möglich." });
  else {
    if (/^\d{2}:\d{2}$/.test(v.time) && !withinHours(v.time)) out.push({ path: "time", message: "Diese Uhrzeit liegt außerhalb der Öffnungszeiten." });
    if (v.altTime && !withinHours(v.altTime)) out.push({ path: "altTime", message: "Diese Uhrzeit liegt außerhalb der Öffnungszeiten." });
    if (v.altTime && v.altTime === v.time) out.push({ path: "altTime", message: "Bitte eine andere Uhrzeit als die Wunschzeit wählen." });
  }
  return out;
}
export type CallbackRequestInput = z.infer<ReturnType<typeof callbackRequestSchema>>;

export const CV_MIME = "application/pdf";

/** Job application. The CV file itself is validated separately (type/size) and never uploaded in 5A.1. */
export function applicationSchema(ctx: { positions: string[]; employment: string[]; experience: string[] }) {
  const oneOf = (list: string[], msg: string) => z.string().refine((v) => list.includes(v), msg);
  return z.object({
    firstName: z.string().trim().min(2, "Bitte geben Sie Ihren Vornamen an.").max(60),
    lastName: z.string().trim().min(2, "Bitte geben Sie Ihren Nachnamen an.").max(60),
    email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
    phone,
    position: oneOf(ctx.positions, "Bitte wählen Sie eine Position."),
    employment: oneOf(ctx.employment, "Bitte wählen Sie eine Beschäftigungsart."),
    experience: oneOf(ctx.experience, "Bitte wählen Sie Ihre Berufserfahrung."),
    message: z.string().trim().max(1500, "Maximal 1500 Zeichen."),
    consent,
  });
}
export type ApplicationInput = z.infer<ReturnType<typeof applicationSchema>>;

/** CV check: PDF only, size limit. Returns an error message or null. */
export function checkCv(file: { type: string; name: string; size: number } | null, maxMb: number): string | null {
  if (!file) return null;
  if (file.type !== CV_MIME || !file.name.toLowerCase().endsWith(".pdf")) return "Bitte laden Sie Ihren Lebenslauf als PDF hoch.";
  if (file.size > maxMb * 1024 * 1024) return `Die Datei ist größer als ${maxMb} MB.`;
  return null;
}
