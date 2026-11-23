import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "impressum" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("impressum");

export default function ImpressumPage() {
  return <PageView slug="impressum" />;
}
