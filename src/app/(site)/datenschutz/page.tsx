import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "datenschutz" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("datenschutz");

export default function DatenschutzPage() {
  return <PageView slug="datenschutz" />;
}
