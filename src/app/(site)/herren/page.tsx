import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "herren" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("herren");

export default function HerrenPage() {
  return <PageView slug="herren" />;
}
