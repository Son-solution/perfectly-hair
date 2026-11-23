import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "salon" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("salon");

export default function SalonPage() {
  return <PageView slug="salon" />;
}
