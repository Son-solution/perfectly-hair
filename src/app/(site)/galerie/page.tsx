import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "galerie" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("galerie");

export default function GaleriePage() {
  return <PageView slug="galerie" />;
}
