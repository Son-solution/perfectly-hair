import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/AudiencePage";
import { audienceContent } from "@/content/audiences";

const content = audienceContent.kinder;

export const metadata: Metadata = {
  title: `Friseur für Kinder in Wiesbaden`,
  description: content.intro,
  alternates: { canonical: "/kinder" },
};

export default function KinderPage() {
  return <AudiencePage content={content} />;
}
