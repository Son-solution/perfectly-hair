import type { ComponentProps, ReactNode } from "react";
import type { AppointmentStatus } from "@/features/dashboard/domain";
import { STATUS_LABEL } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ buttons */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export function btn(variant: ButtonVariant = "secondary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-strong disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-dash-strong text-dash-invert hover:opacity-90",
    variant === "secondary" && "border border-dash-border bg-dash-field text-dash-text hover:bg-dash-subtle",
    variant === "ghost" && "text-dash-muted hover:bg-dash-subtle hover:text-dash-text",
    variant === "danger" && "border border-dash-strong bg-dash-field text-dash-text hover:bg-dash-strong hover:text-dash-invert",
  );
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-dash-muted">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl leading-tight text-dash-text md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dash-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ title, description, action, children, className, padded = true }: {
  title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean;
}) {
  return (
    <section className={cn("rounded-xl border border-dash-border bg-dash-surface", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-dash-border px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-dash-text">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-dash-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, emphasis }: { label: string; value: ReactNode; hint?: ReactNode; emphasis?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-5", emphasis ? "border-dash-strong bg-dash-strong text-dash-invert" : "border-dash-border bg-dash-surface")}>
      <p className={cn("text-xs font-medium", emphasis ? "opacity-70" : "text-dash-muted")}>{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums leading-none">{value}</p>
      {hint && <p className={cn("mt-2 text-xs", emphasis ? "opacity-70" : "text-dash-muted")}>{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ badges (monochrome: fill / outline / dashed) */

export type BadgeTone = "solid" | "outline" | "muted" | "dashed" | "strike";
export function Badge({ tone = "outline", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium leading-5 whitespace-nowrap",
        tone === "solid" && "bg-dash-strong text-dash-invert",
        tone === "outline" && "border border-dash-strong text-dash-text",
        tone === "muted" && "bg-dash-subtle text-dash-muted",
        tone === "dashed" && "border border-dashed border-dash-muted text-dash-text",
        tone === "strike" && "bg-dash-subtle text-dash-muted line-through",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  pending: "dashed",
  confirmed: "solid",
  completed: "outline",
  rejected: "strike",
  cancelled: "strike",
  no_show: "muted",
};
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

/* ------------------------------------------------------------------ states */

export function DemoBanner({ children }: { children?: ReactNode }) {
  return (
    <div role="note" className="mb-6 flex items-start gap-3 rounded-lg border border-dashed border-dash-muted bg-dash-raised px-4 py-3 text-xs leading-relaxed text-dash-muted">
      <span aria-hidden="true" className="mt-0.5 font-semibold text-dash-text">DEMO</span>
      <span>{children ?? "Demonstrationsdaten – fiktive Personen, Termine, Zeiten und Beträge. Änderungen werden nicht gespeichert."}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-dash-border px-6 py-12 text-center">
      <p className="text-sm font-medium text-dash-text">{title}</p>
      {text && <p className="mt-1 max-w-sm text-xs text-dash-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Wird geladen" className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-dash-subtle" />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ table */

export function Table({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table aria-label={label} className={cn("w-full min-w-[640px] border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}
export const Th = ({ className, ...p }: ComponentProps<"th">) => (
  <th scope="col" className={cn("border-b border-dash-border px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-dash-muted first:pl-0 last:pr-0", className)} {...p} />
);
export const Td = ({ className, ...p }: ComponentProps<"td">) => (
  <td className={cn("border-b border-dash-border px-3 py-3 align-middle text-dash-text first:pl-0 last:pr-0", className)} {...p} />
);

/* ------------------------------------------------------------------ form fields */

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-medium text-dash-text">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-dash-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-dash-text">— {error}</p>}
    </div>
  );
}
export const inputCls =
  "h-10 w-full rounded-md border border-dash-border bg-dash-field px-3 text-sm text-dash-text placeholder:text-dash-muted focus:border-dash-strong focus:outline-none";
export const textareaCls =
  "w-full rounded-md border border-dash-border bg-dash-field px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted focus:border-dash-strong focus:outline-none";

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter((p) => /^\p{L}/u.test(p)).map((p) => p[0].toUpperCase()).slice(0, 2).join("");
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-dash-strong text-[0.6875rem] font-semibold tracking-wide text-dash-invert"
    >
      {initials}
    </span>
  );
}
