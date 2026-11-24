import type { MetadataRoute } from "next";
import { demoMode } from "@/features/demo/config";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (demoMode) return { rules: { userAgent: "*", disallow: "/" } }; // client demo: no crawling
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
