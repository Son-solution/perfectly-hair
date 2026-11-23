import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "preise" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("preise");

export default function PreisePage() {
  return <PageView slug="preise" />;
}
