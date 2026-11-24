import { SkeletonRows } from "@/components/dashboard/ui";

/** Suspense boundary for URL data (params) — Partial Prefetching streams the profile in after navigation. */
export default function Loading() {
  return <SkeletonRows rows={8} />;
}
