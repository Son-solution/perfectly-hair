import { PageView, pageMetadata } from "@/components/sections/PageView";

// Content: CMS page "" (homepage). Hero slide order is CMS data — Herren first.
export const generateMetadata = () => pageMetadata("");

export default function HomePage() {
  return <PageView slug="" />;
}
