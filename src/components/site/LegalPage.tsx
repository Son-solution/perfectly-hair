import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-ink pt-32 text-white">
      <div className="bg-paper py-20 text-ink md:py-28">
        <Container className="max-w-3xl">
          <Eyebrow className="text-stone">Rechtliches</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg font-normal">{title}</h1>
          <div className="mt-12 space-y-6 leading-relaxed text-graphite [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink">
            {children}
          </div>
        </Container>
      </div>
    </div>
  );
}

/** Clearly marks information the owner still has to provide. */
export function Missing({ children }: { children: ReactNode }) {
  return (
    <mark className="border border-dashed border-ink bg-bone px-2 py-0.5 text-ink">
      [FEHLT: {children}]
    </mark>
  );
}
