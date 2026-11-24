import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import { getBusiness } from "@/content/repository";
import { demoMode } from "@/features/demo/config";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const b = await getBusiness();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${b.name} – Friseur für Damen, Herren & Kinder in ${b.address.city}`,
      template: `%s – ${b.name}`,
    },
    description: b.description,
    openGraph: { type: "website", locale: "de_DE", siteName: b.name },
    // Protected client demo: never indexed (plus X-Robots-Tag header from src/proxy.ts).
    ...(demoMode ? { robots: { index: false, follow: false, nocache: true } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
