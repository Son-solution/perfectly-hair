import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "bildnachweise" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("bildnachweise");

export default function BildnachweisePage() {
  return <PageView slug="bildnachweise" />;
}
