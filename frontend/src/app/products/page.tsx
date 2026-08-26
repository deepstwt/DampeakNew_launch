import type { Metadata } from "next";
import { PRODUCTS, site } from "@/content/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/ui/ProductCard";
import { Research } from "@/components/scenes/Research";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/**
 * The category page — every product in one grid, and the "Did You Know?" block
 * beneath it.
 *
 * "All products" used to point at a section anchor on the home page, which meant
 * there was nowhere to land that listed the catalogue on its own. This is that
 * page, and it is what the breadcrumb on each product page climbs back to.
 *
 * No filters: with four products, any filter hides three of them.
 */

export const metadata: Metadata = {
  title: "Shop Your Relaxation",
  description: `All four ${site.name} stress squeeze squish toys — ${PRODUCTS.map((p) => p.name).join(", ")}.`,
  alternates: { canonical: "/products" },
  openGraph: {
    title: `Shop Your Relaxation — ${site.name}`,
    description: site.hero.sub,
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
            <h1 className="text-display max-w-[16ch] text-[13vw] leading-[0.9] sm:text-[8vw] lg:text-[4.4vw]">
              {site.showcase.heading}
            </h1>
            <p className="text-[15px] font-bold text-ink/45">
              {PRODUCTS.length} products
            </p>
          </header>


          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
            {PRODUCTS.map((item, i) => (
              <li key={item.slug}>
                {/* Same card as the home page, so the grid and the home page
                    cannot drift apart in look or behaviour. */}
                <ProductCard item={item} priority={i < 2} />
              </li>
            ))}
          </ul>

          {/* Bottom of the main product page, per the copy deck. */}
          <Research className="mt-24" />
        </div>
      </main>

      <Footer />
    </>
  );
}
