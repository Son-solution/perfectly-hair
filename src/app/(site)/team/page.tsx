import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "team" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("team");

export default function TeamPage() {
  return <PageView slug="team" />;
}
