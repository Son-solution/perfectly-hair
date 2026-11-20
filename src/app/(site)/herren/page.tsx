import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/AudiencePage";
import { audienceContent } from "@/content/audiences";

const content = audienceContent.herren;

export const metadata: Metadata = {
  title: `Friseur für Herren in Wiesbaden`,
  description: content.intro,
  alternates: { canonical: "/herren" },
};

export default function HerrenPage() {
  return <AudiencePage content={content} />;
}
