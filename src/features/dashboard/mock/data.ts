/**
 * DEMONSTRATION DATA — fictional people, appointments, hours and pay.
 * Not real salon data. Names are deliberately placeholder-like ("Beispiel", "Muster").
 * Generated deterministically around a fixed demo date so prerendering stays stable.
 */
import type {
  Appointment, AppointmentSource, AppointmentStatus, AttendanceRecord, CallbackRequest, CommissionRule, Customer, Employee,
  JobApplication, LeaveRequest, PayrollAdjustment, PayrollProfile,
} from "../domain";

export const DEMO_TODAY = "2026-11-24"; // Tuesday
export const DEMO_NOW = "2026-11-24T11:40";
export const DEMO_ADMIN = "Admin (Demo)";

const shift = (start: string, end: string, breakMin = 30) => ({ start, end, breakMin });
const tueSat = (start = "09:00", end = "18:00", sat = shift("09:00", "16:00")) => ({
  "1": null, "2": shift(start, end), "3": shift(start, end), "4": shift(start, end),
  "5": shift(start, end), "6": sat, "7": null,
});

export const employees: Employee[] = [
  {
    id: "e1", firstName: "Anna", lastName: "Beispiel", email: "anna.beispiel@demo.invalid", phone: "0611 000 0001",
    role: "staff", position: "Friseurin · Damen & Kinder", employmentStart: "2023-03-01", active: true,
    audiences: ["damen", "kinder"], serviceIds: ["haarschnitt", "waschen-styling", "faerben", "augenbrauen-zupfen"],
    schedule: tueSat(), contractHoursWeek: 38, vacationDaysYear: 28,
    notes: "Demo-Notiz: Ansprechpartnerin für Farbberatung.",
  },
  {
    id: "e2", firstName: "Jonas", lastName: "Muster", email: "jonas.muster@demo.invalid", phone: "0611 000 0002",
    role: "staff", position: "Barbier · Herren", employmentStart: "2022-09-15", active: true,
    audiences: ["herren"], serviceIds: ["haarschnitt", "bartrasur", "ohren-nase-wax"],
    schedule: tueSat("10:00", "19:00", shift("09:00", "17:00")), contractHoursWeek: 40, vacationDaysYear: 28,
    notes: "",
  },
  {
    id: "e3", firstName: "Mira", lastName: "Test", email: "mira.test@demo.invalid", phone: "0611 000 0003",
    role: "staff", position: "Coloristin · Teilzeit", employmentStart: "2024-02-01", active: true,
    audiences: ["damen"], serviceIds: ["faerben", "waschen-styling"],
    schedule: { "1": null, "2": shift("09:00", "14:00", 0), "3": null, "4": shift("09:00", "14:00", 0), "5": shift("12:00", "19:00"), "6": shift("09:00", "14:00", 0), "7": null },
    contractHoursWeek: 22, vacationDaysYear: 25, notes: "Demo-Notiz: Teilzeit, keine Spätschichten am Dienstag.",
  },
  {
    id: "e4", firstName: "Karim", lastName: "Demo", email: "karim.demo@demo.invalid", phone: "0611 000 0004",
    role: "staff", position: "Friseur · Herren & Kinder", employmentStart: "2025-08-01", active: true,
    audiences: ["herren", "kinder"], serviceIds: ["haarschnitt", "bartrasur"],
    schedule: tueSat(), contractHoursWeek: 38, vacationDaysYear: 26, notes: "",
  },
  {
    id: "e5", firstName: "Lea", lastName: "Platzhalter", email: "lea.platzhalter@demo.invalid", phone: "0611 000 0005",
    role: "admin", position: "Salonleitung (Demo)", employmentStart: "2021-01-01", active: true,
    audiences: ["damen", "herren", "kinder"], serviceIds: ["haarschnitt", "waschen-styling"],
    schedule: tueSat("09:00", "17:00", shift("09:00", "14:00", 0)), contractHoursWeek: 36, vacationDaysYear: 30, notes: "",
  },
];

export const payrollProfiles: PayrollProfile[] = [
  { employeeId: "e1", type: "stundenlohn", hourlyRateCents: 1650, monthlySalaryCents: null, overtimeRateFactor: 1 },
  { employeeId: "e2", type: "festgehalt", hourlyRateCents: null, monthlySalaryCents: 285000, overtimeRateFactor: 1.25 },
  { employeeId: "e3", type: "stundenlohn", hourlyRateCents: 1700, monthlySalaryCents: null, overtimeRateFactor: 1 },
  { employeeId: "e4", type: "stundenlohn", hourlyRateCents: 1390, monthlySalaryCents: null, overtimeRateFactor: 1 },
  { employeeId: "e5", type: "festgehalt", hourlyRateCents: null, monthlySalaryCents: 320000, overtimeRateFactor: 1 },
];

/* ------------------------------------------------------------------ helpers */

let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const pad = (n: number) => String(n).padStart(2, "0");
const addMin = (hhmm: string, m: number) => {
  const [h, mm] = hhmm.split(":").map(Number);
  const t = h * 60 + mm + m;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
};
function datesBack(from: string, days: number) {
  const out: string[] = [];
  const d = new Date(`${from}T12:00:00Z`);
  for (let i = days; i >= 1; i--) {
    const x = new Date(d.getTime() - i * 86400000);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}
const isoWeekday = (date: string) => ((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

/* ------------------------------------------------------------------ attendance */

function buildAttendance(): AttendanceRecord[] {
  const out: AttendanceRecord[] = [];
  const days = datesBack(DEMO_TODAY, 30);
  for (const e of employees) {
    for (const date of days) {
      const s = e.schedule[String(isoWeekday(date))];
      if (!s) continue;
      if (e.id === "e4" && (date === "2026-11-19" || date === "2026-11-20")) continue; // sick (see leave)
      if (e.id === "e1" && date >= "2026-11-04" && date <= "2026-11-06") continue; // vacation
      const late = rnd() < 0.12 ? Math.round(8 + rnd() * 20) : Math.round(rnd() * 5) - 3;
      const extra = rnd() < 0.25 ? Math.round(15 + rnd() * 45) : Math.round(rnd() * 10) - 5;
      const clockIn = addMin(s.start, late);
      let clockOut: string | null = addMin(s.end, extra);
      if (e.id === "e2" && date === "2026-11-21") clockOut = null; // missing clock-out
      out.push({
        id: `a-${e.id}-${date}`, employeeId: e.id, date,
        original: { clockIn: `${date}T${clockIn}`, clockOut: clockOut ? `${date}T${clockOut}` : null, breakMin: s.breakMin },
        corrections: [], requests: [],
      });
    }
    // Today (Tuesday): live state
    const today = e.schedule["2"];
    if (today && e.id !== "e2") {
      out.push({
        id: `a-${e.id}-${DEMO_TODAY}`, employeeId: e.id, date: DEMO_TODAY,
        original: { clockIn: `${DEMO_TODAY}T${addMin(today.start, e.id === "e3" ? 22 : -4)}`, clockOut: null, breakMin: 0 },
        corrections: [], requests: [],
      });
    }
  }
  // One documented admin correction (audit example)
  const rec = out.find((r) => r.id === "a-e1-2026-11-13");
  if (rec) {
    rec.corrections.push({
      id: "c1", at: "2026-11-14T08:31", by: DEMO_ADMIN,
      reason: "Ausstempeln vergessen – laut Kassenabschluss um 18:15 Uhr gegangen.",
      before: { ...rec.original }, after: { ...rec.original, clockOut: "2026-11-13T18:15" },
    });
    rec.requests.push({ id: "r1", at: "2026-11-13T21:05", message: "Habe vergessen auszustempeln, war bis ca. 18:15 da.", status: "accepted" });
  }
  // One open correction request from staff
  const open = out.find((r) => r.id === "a-e2-2026-11-21");
  open?.requests.push({ id: "r2", at: "2026-11-22T10:12", message: "Ausstempeln vergessen, Feierabend war 17:10 Uhr.", status: "open" });
  return out;
}
export const attendance: AttendanceRecord[] = buildAttendance();

/* ------------------------------------------------------------------ appointments */

const CUSTOMERS = ["Kunde A. (Demo)", "Kundin B. (Demo)", "Kind C. (Demo)", "Kunde D. (Demo)", "Kundin E. (Demo)", "Kunde F. (Demo)", "Kundin G. (Demo)", "Kind H. (Demo)"];
const SERVICES: Record<string, { name: string; durationMin: number; priceCents: number }> = {
  haarschnitt: { name: "Haarschnitt", durationMin: 30, priceCents: 2000 },
  bartrasur: { name: "Bartrasur", durationMin: 20, priceCents: 1000 },
  "waschen-styling": { name: "Waschen & Styling", durationMin: 30, priceCents: 1000 },
  faerben: { name: "Färben", durationMin: 90, priceCents: 2500 },
  "augenbrauen-zupfen": { name: "Augenbrauen zupfen", durationMin: 15, priceCents: 800 },
  "ohren-nase-wax": { name: "Ohren oder Nase mit Wax", durationMin: 10, priceCents: 500 },
};

function buildAppointments(): Appointment[] {
  const out: Appointment[] = [];
  const window = [...datesBack(DEMO_TODAY, 14), DEMO_TODAY, ...datesBack("2026-12-09", 15)];
  let n = 0;
  for (const date of window) {
    for (const e of employees.filter((x) => x.role === "staff")) {
      const s = e.schedule[String(isoWeekday(date))];
      if (!s) continue;
      let t = s.start;
      const count = 2 + Math.floor(rnd() * 4);
      for (let i = 0; i < count; i++) {
        const sid = e.serviceIds[Math.floor(rnd() * e.serviceIds.length)];
        const sv = SERVICES[sid];
        t = addMin(t, 15 + Math.floor(rnd() * 4) * 15);
        if (t >= s.end) break;
        const past = date < DEMO_TODAY || (date === DEMO_TODAY && t < "11:40");
        const r = rnd();
        const status: AppointmentStatus = past
          ? r < 0.8 ? "completed" : r < 0.88 ? "no_show" : "cancelled"
          : r < 0.68 ? "confirmed" : r < 0.88 ? "pending" : r < 0.94 ? "cancelled" : "rejected";
        n++;
        const audience = e.audiences[Math.floor(rnd() * e.audiences.length)];
        const wd = isoWeekday(date);
        // Policy: Herren on Friday/Saturday are walk-in only (no bookings) → shown as Laufkundschaft.
        const source: AppointmentSource = audience === "herren" && (wd === 5 || wd === 6) ? "walk_in" : n % 5 === 0 ? "telefon" : n % 11 === 0 ? "walk_in" : "online";
        out.push({
          id: `t${n}`, customerId: `k${(n % CUSTOMERS.length) + 1}`, source, customerName: CUSTOMERS[n % CUSTOMERS.length], customerPhone: `0170 000 1${pad((n % CUSTOMERS.length) + 10)}`,
          audience, serviceId: sid, serviceName: sv.name, employeeId: status === "pending" && rnd() < 0.3 ? null : e.id,
          start: `${date}T${t}`, durationMin: sv.durationMin, status, priceCents: sv.priceCents,
          note: rnd() < 0.15 ? "Demo-Hinweis: Kunde wünscht kurze Beratung vorab." : null,
          cancelReason: status === "cancelled" ? "Demo: Kunde hat telefonisch abgesagt." : status === "rejected" ? "Demo: Zeitfenster nicht verfügbar." : null,
          history: [
            { at: `${date}T08:00`, by: source === "online" ? "Online-Anfrage (Demo)" : DEMO_ADMIN, action: source === "online" ? "Angefragt" : source === "walk_in" ? "Laufkundschaft erfasst" : "Telefonisch erfasst", note: null },
            ...(status !== "pending" ? [{ at: `${date}T08:20`, by: DEMO_ADMIN, action: status === "rejected" ? "Abgelehnt" : status === "cancelled" ? "Storniert" : "Bestätigt", note: null }] : []),
          ],
        });
        t = addMin(t, sv.durationMin);
      }
    }
  }
  // Deliberate conflict for the demo: overlapping bookings for Jonas tomorrow 11:00
  out.push(
    { id: "tc1", customerId: "k9", source: "telefon", customerName: "Kunde X. (Demo)", customerPhone: "0170 000 9901", audience: "herren", serviceId: "haarschnitt", serviceName: "Haarschnitt", employeeId: "e2", start: "2026-11-25T11:00", durationMin: 30, status: "confirmed", priceCents: 2000, note: null, cancelReason: null, history: [{ at: "2026-11-23T09:00", by: DEMO_ADMIN, action: "Bestätigt", note: null }] },
    { id: "tc2", customerId: "k10", source: "online", customerName: "Kunde Y. (Demo)", customerPhone: "0170 000 9902", audience: "herren", serviceId: "bartrasur", serviceName: "Bartrasur", employeeId: "e2", start: "2026-11-25T11:15", durationMin: 20, status: "pending", priceCents: 1000, note: null, cancelReason: null, history: [{ at: "2026-11-24T07:45", by: "Online-Anfrage (Demo)", action: "Angefragt", note: null }] },
  );
  return out;
}
export const appointments: Appointment[] = buildAppointments();

/* ------------------------------------------------------------------ leave */

export const leaveRequests: LeaveRequest[] = [
  { id: "l1", employeeId: "e1", type: "urlaub", from: "2026-11-04", to: "2026-11-06", days: 3, status: "genehmigt", note: null, decidedBy: DEMO_ADMIN },
  { id: "l2", employeeId: "e4", type: "krank", from: "2026-11-19", to: "2026-11-20", days: 2, status: "genehmigt", note: "AU liegt vor (Demo).", decidedBy: DEMO_ADMIN },
  { id: "l3", employeeId: "e2", type: "urlaub", from: "2026-12-22", to: "2026-12-31", days: 6, status: "beantragt", note: "Weihnachtsurlaub (Demo).", decidedBy: null },
  { id: "l4", employeeId: "e3", type: "sonstiges", from: "2026-12-03", to: "2026-12-03", days: 1, status: "beantragt", note: "Fortbildung (Demo).", decidedBy: null },
  { id: "l5", employeeId: "e1", type: "urlaub", from: "2027-01-12", to: "2027-01-16", days: 5, status: "beantragt", note: null, decidedBy: null },
  { id: "l6", employeeId: "e4", type: "urlaub", from: "2026-10-14", to: "2026-10-17", days: 4, status: "genehmigt", note: null, decidedBy: DEMO_ADMIN },
  { id: "l7", employeeId: "e2", type: "urlaub", from: "2026-08-04", to: "2026-08-15", days: 10, status: "genehmigt", note: null, decidedBy: DEMO_ADMIN },
  { id: "l8", employeeId: "e3", type: "urlaub", from: "2026-12-29", to: "2026-12-31", days: 3, status: "abgelehnt", note: "Überschneidung mit Jahresinventur (Demo).", decidedBy: DEMO_ADMIN },
];

/* ------------------------------------------------------------------ payroll adjustments */

export const payrollAdjustments: PayrollAdjustment[] = [
  { id: "p1", employeeId: "e1", month: "2026-11", kind: "bonus", amountCents: 15000, reason: "Demo: Prämie für Farbberatungs-Schulung im Team.", status: "freigegeben", proposedBy: DEMO_ADMIN, reviewedBy: "Super-Admin (Demo)" },
  { id: "p2", employeeId: "e4", month: "2026-11", kind: "abzug", amountCents: -4000, reason: "Demo-Vorschlag: Rückzahlung Vorschuss vom 03.11. (schriftlich vereinbart).", status: "vorgeschlagen", proposedBy: DEMO_ADMIN, reviewedBy: null },
  { id: "p3", employeeId: "e2", month: "2026-11", kind: "korrektur", amountCents: 2500, reason: "Demo: Nachzahlung Überstunden Oktober (falsch erfasst).", status: "vorgeschlagen", proposedBy: DEMO_ADMIN, reviewedBy: null },
];

export const serviceCatalogue = SERVICES;

/* ------------------------------------------------------------------ customers */

const CUSTOMER_AUDIENCE: Customer["audience"][] = ["herren", "damen", "kinder", "herren", "damen", "herren", "damen", "kinder"];
export const customers: Customer[] = [
  ...CUSTOMERS.map((name, i): Customer => ({
    id: `k${i + 1}`, name, phone: `0170 000 1${pad(i + 10)}`, email: i % 3 === 0 ? `kunde${i + 1}@example.com` : null,
    audience: CUSTOMER_AUDIENCE[i], createdAt: `2026-0${(i % 9) + 1}-1${i}`, consent: true,
    notes: i === 1 ? [{ id: "kn1", at: "2026-10-02T10:15", by: DEMO_ADMIN, text: "Demo: bevorzugt Termine am Vormittag." }]
      : i === 4 ? [{ id: "kn2", at: "2026-09-18T15:40", by: DEMO_ADMIN, text: "Demo: Hautverträglichkeitstest vor Färben durchgeführt (unauffällig)." }] : [],
  })),
  { id: "k9", name: "Kunde X. (Demo)", phone: "0170 000 9901", email: null, audience: "herren", createdAt: "2026-11-23", consent: true, notes: [] },
  { id: "k10", name: "Kunde Y. (Demo)", phone: "0170 000 9902", email: "kunde.y@example.com", audience: "herren", createdAt: "2026-11-24", consent: true, notes: [] },
];

/* ------------------------------------------------------------------ callback requests */

const cbHist = (at: string, status: CallbackRequest["status"], note: string | null = null, by = "Website-Formular (Demo)") => ({ at, by, status, note });
export const callbackRequests: CallbackRequest[] = [
  { id: "r1", receivedAt: "2026-11-24T08:12", name: "Interessentin M. (Demo)", phone: "0170 000 5501", email: "m.demo@example.com", audience: "damen", serviceId: "faerben", serviceName: "Färben", preferredDate: "2026-11-27", preferredTime: "10:00", alternativeTime: "14:00", message: "Demo: Ansatz nachfärben, ca. 2 cm.", status: "neu", assigneeId: null, appointmentId: null, notes: [], history: [cbHist("2026-11-24T08:12", "neu")] },
  { id: "r2", receivedAt: "2026-11-24T07:30", name: "Interessent P. (Demo)", phone: "0170 000 5502", email: null, audience: "herren", serviceId: "haarschnitt", serviceName: "Haarschnitt", preferredDate: "2026-11-26", preferredTime: "17:00", alternativeTime: null, message: null, status: "neu", assigneeId: null, appointmentId: null, notes: [], history: [cbHist("2026-11-24T07:30", "neu")] },
  { id: "r3", receivedAt: "2026-11-23T18:05", name: "Elternteil K. (Demo)", phone: "0170 000 5503", email: "k.demo@example.com", audience: "kinder", serviceId: "haarschnitt", serviceName: "Haarschnitt", preferredDate: "2026-11-28", preferredTime: "11:00", alternativeTime: "12:00", message: "Demo: Zwei Kinder, 6 und 9 Jahre.", status: "in_bearbeitung", assigneeId: "e5", appointmentId: null, notes: [{ id: "rn1", at: "2026-11-24T09:05", by: DEMO_ADMIN, text: "Demo: Zwei aufeinanderfolgende Slots prüfen." }], history: [cbHist("2026-11-23T18:05", "neu"), cbHist("2026-11-24T09:05", "in_bearbeitung", null, DEMO_ADMIN)] },
  { id: "r4", receivedAt: "2026-11-22T12:40", name: "Interessentin S. (Demo)", phone: "0170 000 5504", email: null, audience: "damen", serviceId: "waschen-styling", serviceName: "Waschen & Styling", preferredDate: "2026-11-25", preferredTime: "09:30", alternativeTime: null, message: null, status: "nicht_erreicht", assigneeId: "e5", appointmentId: null, notes: [{ id: "rn2", at: "2026-11-23T10:00", by: DEMO_ADMIN, text: "Demo: 2× angerufen, Mailbox." }], history: [cbHist("2026-11-22T12:40", "neu"), cbHist("2026-11-23T10:00", "nicht_erreicht", "Mailbox", DEMO_ADMIN)] },
  { id: "r5", receivedAt: "2026-11-21T16:20", name: "Interessent T. (Demo)", phone: "0170 000 5505", email: "t.demo@example.com", audience: "herren", serviceId: "bartrasur", serviceName: "Bartrasur", preferredDate: "2026-11-25", preferredTime: "12:00", alternativeTime: null, message: null, status: "termin_vereinbart", assigneeId: "e5", appointmentId: "tc1", notes: [], history: [cbHist("2026-11-21T16:20", "neu"), cbHist("2026-11-22T09:10", "rueckruf_erfolgt", null, DEMO_ADMIN), cbHist("2026-11-22T09:12", "termin_vereinbart", "Verfügbarkeit geprüft, Termin angelegt.", DEMO_ADMIN)] },
  { id: "r6", receivedAt: "2026-11-20T10:02", name: "Interessentin W. (Demo)", phone: "0170 000 5506", email: null, audience: "damen", serviceId: "augenbrauen-zupfen", serviceName: "Augenbrauen zupfen", preferredDate: "2026-11-21", preferredTime: "18:30", alternativeTime: null, message: null, status: "abgelehnt", assigneeId: "e5", appointmentId: null, notes: [], history: [cbHist("2026-11-20T10:02", "neu"), cbHist("2026-11-20T11:00", "abgelehnt", "Wunschzeit außerhalb der Öffnungszeiten, Alternative angeboten – kein Interesse.", DEMO_ADMIN)] },
];

/* ------------------------------------------------------------------ job applications */

export const applications: JobApplication[] = [
  { id: "b1", receivedAt: "2026-11-23T20:14", firstName: "Bewerberin", lastName: "Eins (Demo)", email: "bewerbung1@example.com", phone: "0170 000 7701", position: "Friseur/in", employment: "Vollzeit", experience: "3–5 Jahre", message: "Demo: Schwerpunkt Damenhaarschnitte und Farbe.", cvFileName: "lebenslauf-demo-1.pdf", status: "neu", notes: [], deleteAfter: null },
  { id: "b2", receivedAt: "2026-11-20T09:40", firstName: "Bewerber", lastName: "Zwei (Demo)", email: "bewerbung2@example.com", phone: "0170 000 7702", position: "Barbier/in", employment: "Teilzeit", experience: "1–2 Jahre", message: null, cvFileName: null, status: "in_pruefung", notes: [{ id: "bn1", at: "2026-11-21T11:00", by: DEMO_ADMIN, text: "Demo: Probearbeit am Samstag denkbar." }], deleteAfter: null },
  { id: "b3", receivedAt: "2026-11-12T14:05", firstName: "Bewerberin", lastName: "Drei (Demo)", email: "bewerbung3@example.com", phone: "0170 000 7703", position: "Ausbildung", employment: "Ausbildung", experience: "Keine", message: "Demo: Praktikum im Salon absolviert.", cvFileName: "lebenslauf-demo-3.pdf", status: "gespraech", notes: [{ id: "bn2", at: "2026-11-15T10:00", by: DEMO_ADMIN, text: "Demo: Gespräch am 26.11. um 14 Uhr." }], deleteAfter: null },
  { id: "b4", receivedAt: "2026-10-02T08:30", firstName: "Bewerber", lastName: "Vier (Demo)", email: "bewerbung4@example.com", phone: "0170 000 7704", position: "Friseur/in", employment: "Minijob", experience: "Mehr als 5 Jahre", message: null, cvFileName: "lebenslauf-demo-4.pdf", status: "abgelehnt", notes: [], deleteAfter: "2027-04-15" },
];

/* ------------------------------------------------------------------ commission (optional, off by default) */

export const commissionRules: CommissionRule[] = employees.filter((e) => e.role === "staff").map((e) => ({ employeeId: e.id, enabled: false, percent: 0 }));
