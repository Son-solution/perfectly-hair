import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "kontakt" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("kontakt");

export default function KontaktPage() {
  return <PageView slug="kontakt" />;
}
