import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "team". Currently HIDDEN via siteSettings.features.teamPageVisible = false → 404 + noindex.
export const generateMetadata = () => pageMetadata("team");

export default function TeamPage() {
  return <PageView slug="team" />;
}
