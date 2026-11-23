import { PageView, pageMetadata } from "@/components/sections/PageView";

// Isolated 3D prototype (CMS page "3d-preview"): noindex, not in navigation or sitemap.
export const generateMetadata = () => pageMetadata("3d-preview");

export default function Preview3DPage() {
  return <PageView slug="3d-preview" />;
}
