import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/AudiencePage";
import { audienceContent } from "@/content/audiences";

const content = audienceContent.damen;

export const metadata: Metadata = {
  title: `Friseur für Damen in Wiesbaden`,
  description: content.intro,
  alternates: { canonical: "/damen" },
};

export default function DamenPage() {
  return <AudiencePage content={content} />;
}
