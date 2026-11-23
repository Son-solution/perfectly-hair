import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "damen" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("damen");

export default function DamenPage() {
  return <PageView slug="damen" />;
}
