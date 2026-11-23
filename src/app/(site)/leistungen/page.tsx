import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "leistungen" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("leistungen");

export default function LeistungenPage() {
  return <PageView slug="leistungen" />;
}
