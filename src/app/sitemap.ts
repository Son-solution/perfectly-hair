import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

// Legal pages are excluded (noindex) until their content is complete.
const routes = [
  "",
  "/damen",
  "/herren",
  "/kinder",
  "/leistungen",
  "/preise",
  "/team",
  "/galerie",
  "/salon",
  "/kontakt",
  "/termin",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : ["/damen", "/herren", "/kinder"].includes(path) ? 0.9 : 0.7,
  }));
}
