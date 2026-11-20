import Link from "next/link";
import { ArtPlaceholder } from "@/components/media/ArtPlaceholder";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh items-center bg-ink text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60">
        <ArtPlaceholder seed={404} showLabel={false} />
      </div>
      <div className="container-luxe">
        <p className="text-eyebrow uppercase text-ash">Fehler 404</p>
        <h1 className="mt-6 font-display text-display-xl font-normal">
          Seite nicht gefunden
          <span className="block italic text-white/65">– aber Sie sind willkommen.</span>
        </h1>
        <Link
          href="/"
          className="mt-12 inline-flex min-h-12 items-center border border-white/50 px-7 text-[0.8125rem] uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-white hover:text-ink"
        >
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
