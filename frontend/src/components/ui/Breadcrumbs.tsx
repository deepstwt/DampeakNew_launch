import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

/**
 * Breadcrumb trail, with its own BreadcrumbList structured data.
 *
 * The markup and the JSON-LD are emitted together, from one list, because the two
 * drifting apart is the usual way breadcrumb rich results break — the visible
 * trail gets a level added and the structured data quietly keeps the old shape.
 *
 * The last item is the current page: rendered as plain text with aria-current,
 * never as a link to itself.
 */

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      // The final crumb has no href, and schema.org treats a missing item as
      // "this page", which is exactly right for it.
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-marker text-ink/40 transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-marker text-ink/70" aria-current="page">
                  {item.label}
                </span>
              )}
              {last ? null : (
                <ChevronRight
                  className="size-3.5 shrink-0 text-ink/25"
                  strokeWidth={3}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
