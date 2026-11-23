import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/content/repository";
import { siteUrl } from "@/lib/env";

/** Built from published, indexable CMS pages (legal drafts are noindex and excluded). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({
    url: `${siteUrl}${slug ? `/${slug}` : ""}`,
    changeFrequency: "monthly",
    priority: slug === "" ? 1 : ["herren", "damen", "kinder"].includes(slug) ? 0.9 : 0.7,
  }));
}
