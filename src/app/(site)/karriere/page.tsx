import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "karriere" (src/content/data/pages.ts). Visibility: siteSettings.features.careersPageVisible.
export const generateMetadata = () => pageMetadata("karriere");

export default function KarrierePage() {
  return <PageView slug="karriere" />;
}
