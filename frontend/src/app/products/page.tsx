import type { Metadata } from "next";
import { PRODUCTS, site } from "@/content/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/ui/ProductCard";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/**
 * The category page — every product in one grid.
 *
 * "All products" used to point at a section anchor on the home page, which meant
 * there was nowhere to land that listed the catalogue on its own. This is that
 * page, and it is what the breadcrumb on each product page climbs back to.
 *
 * No filters: with four products, any filter hides three of them.
 */

export const metadata: Metadata = {
  title: "All products",
  description: `All four ${site.name} squishies — Blue Block, Pillow Squish, Cheese Cube and Marble Cube.`,
  alternates: { canonical: "/products" },
  openGraph: {
    title: `All products — ${site.name}`,
    description: "Small, everyday things that take the friction out of a day.",
    type: "website",
  },
};

export default function ProductsPage() {
  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "All products" }]}
          />

          <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-display text-[13vw] leading-[0.9] sm:text-[8vw] lg:text-[4.4vw]">
              All products
            </h1>
            <p className="text-[15px] font-bold text-ink/45">
              {PRODUCTS.length} products
            </p>
          </header>


          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
            {PRODUCTS.map((item, i) => (
              <li key={item.slug}>
                {/* Same card as the hero, so the grid and the home page cannot
                    drift apart in look or behaviour. */}
                <ProductCard item={item} priority={i < 2} />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
}
