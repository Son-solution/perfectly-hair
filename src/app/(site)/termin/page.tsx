import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "termin" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("termin");

export default function TerminPage() {
  return <PageView slug="termin" />;
}
