import { z } from "zod";

/**
 * Booking contract between the UI and the (future) booking engine.
 * The UI only talks to a `BookingGateway`. Today the gateway reports "unavailable";
 * in the backend phase it is replaced by a server-action implementation backed by the
 * Postgres function `book_appointment()` (see docs/DATABASE.md §5) — no UI rewrite needed.
 */

export const customerDetails = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an."),
  phone: z.string().trim().regex(/^[+0-9 ()/-]{6,}$/, "Bitte geben Sie eine gültige Telefonnummer an."),
  email: z.union([z.literal(""), z.email("Bitte geben Sie eine gültige E-Mail-Adresse an.")]),
  note: z.string().max(500, "Maximal 500 Zeichen.").optional(),
  consent: z.literal(true, { error: "Bitte stimmen Sie der Datenverarbeitung zu." }),
});
export type CustomerDetails = z.infer<typeof customerDetails>;

export type BookingDraft = {
  category: string | null;
  serviceId: string | null;
  employeeId: string | null; // null = keine Präferenz
  date: string | null; // YYYY-MM-DD (Europe/Berlin)
  slot: string | null; // ISO start time from the availability engine — never invented
  customer: Partial<CustomerDetails>;
};

export type Slot = { start: string; employeeId: string };

export type AvailabilityResult = { status: "unavailable" } | { status: "ok"; slots: Slot[] };
export type SubmitResult =
  | { status: "unavailable" }
  | { status: "pending" | "accepted"; bookingId: string }
  | { status: "error"; message: string };

export interface BookingGateway {
  readonly active: boolean;
  getAvailability(input: { serviceId: string; employeeId: string | null; date: string }): Promise<AvailabilityResult>;
  submit(draft: BookingDraft): Promise<SubmitResult>;
}

/** Current gateway: online booking not connected yet — never fakes slots or confirmations. */
export const unavailableGateway: BookingGateway = {
  active: false,
  async getAvailability() {
    return { status: "unavailable" };
  },
  async submit() {
    return { status: "unavailable" };
  },
};
