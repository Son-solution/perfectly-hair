import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "kinder" (src/content/data/pages.ts → later Supabase "site_pages").
export const generateMetadata = () => pageMetadata("kinder");

export default function KinderPage() {
  return <PageView slug="kinder" />;
}
