import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusiness, getPage } from "@/content/repository";
import { SectionRenderer } from "./SectionRenderer";

/** Renders a published CMS page by slug ("" = homepage); unpublished/hidden → 404. */
export async function PageView({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return <SectionRenderer page={page} />;
}

/** SEO metadata from the page's CMS fields. */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const [page, business] = await Promise.all([getPage(slug), getBusiness()]);
  if (!page) return { robots: { index: false, follow: false } }; // hidden / unpublished → 404 + noindex
  return {
    ...(page.seo.title ? { title: page.seo.title } : {}),
    description: page.seo.description || business.description,
    alternates: { canonical: slug ? `/${slug}` : "/" },
    robots: page.seo.noindex ? { index: false } : undefined,
  };
}
