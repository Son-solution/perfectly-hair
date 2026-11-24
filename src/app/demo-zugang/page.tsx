import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { DemoLoginForm } from "@/components/demo/DemoLoginForm";
import { demoMode } from "@/features/demo/config";

export const metadata: Metadata = {
  title: "Kundenvorschau – Zugang",
  robots: { index: false, follow: false },
};

/** Password page of the protected client demo. Does not exist outside the demo deployment. */
/** Reads ?weiter / ?fehler / ?abgemeldet on the server (streamed inside <Suspense>). */
async function FormFromParams({ searchParams }: { searchParams: PageProps<"/demo-zugang">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const weiter = one(sp.weiter);
  const target = weiter && weiter.startsWith("/") && !weiter.startsWith("//") && !weiter.includes("\\") ? weiter : "/";
  return <DemoLoginForm error={one(sp.fehler)} target={target} loggedOut={one(sp.abgemeldet) === "1"} />;
}

export default function DemoAccessPage({ searchParams }: PageProps<"/demo-zugang">) {
  if (!demoMode) notFound();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-4 py-16 text-white">
      <div className="w-full max-w-md">
        <LogoMark decorative className="mx-auto h-14 w-14 text-white" />
        <p className="mt-8 text-center text-eyebrow uppercase text-white/60">Perfectly Hair by Gabriel</p>
        <h1 className="mt-3 text-center font-display text-4xl">Kundenvorschau</h1>
        <p className="mt-4 text-center text-sm leading-relaxed text-white/70">
          Geschützte Vorschau der neuen Website sowie der Admin- und Mitarbeiterbereiche. Alle Personen, Termine und Beträge sind fiktive Demodaten.
        </p>
        <Suspense fallback={<DemoLoginForm />}>
          <FormFromParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
