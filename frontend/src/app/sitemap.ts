import type { MetadataRoute } from "next";
import { DOCS } from "@/content/legal";
import { PRODUCTS } from "@/content/site";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-08-08");

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    // Above the policy pages: these are the pages worth ranking for.
    ...PRODUCTS.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...DOCS.map((doc) => ({
      url: `${SITE_URL}/${doc.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
