import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, getAmazonUrl, getProduct, site } from "@/content/site";
import { SITE_URL } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { BuyNowButton } from "@/components/ui/BuyNowButton";
import { SaveButton } from "@/components/ui/SaveButton";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/** Only the four products exist; anything else 404s rather than rendering empty. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  /**
   * The listing title, not the shelf name. "Cheese cube stress squeeze squish
   * Toy" is what someone types into a search box; "Cheese Cube" is what we call
   * it once you already know what it is.
   */
  const title = product.fullName;

  return {
    title,
    description: product.fact,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description: product.fact,
      type: "website",
      ...(product.image
        ? { images: [{ url: product.image.src, alt: product.image.alt }] }
        : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const amazonUrl = getAmazonUrl(product.slug);
  const copy = product.description;

  /**
   * Product structured data.
   *
   * `price` is stored for display ("₹2,999"), so the separators have to come out
   * before it can be published as a number — schema.org wants a bare decimal and
   * silently rejects the formatted string.
   *
   * Two deliberate choices, both about not making claims we cannot back:
   *
   *   - `offers.url` points wherever the sale actually happens. Google compares
   *     offer data against the page it lands on, and pointing it here while the
   *     transaction is on Amazon is the disagreement that gets flagged.
   *   - No `availability`. It is only ever a copy of Amazon's stock at the moment
   *     this page was built, and a stale InStock is worse than none.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.fullName,
    description: copy.body,
    ...(product.image ? { image: product.image.src } : {}),
    brand: { "@type": "Brand", name: site.name },
    // Every spec from the manufacturing sheet, in the form search engines read.
    additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value,
    })),
    offers: {
      "@type": "Offer",
      // No price is published until there is one. An Offer without a price is
      // valid; an Offer with a made-up price is not.
      ...(product.price
        ? { price: product.price.replace(/[^\d.]/g, ""), priceCurrency: "INR" }
        : {}),
      url: amazonUrl ?? `${SITE_URL}/products/${product.slug}`,
    },
  };

  const others = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <script
          type="application/ld+json"
          // Product data is authored in this repo, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "All products", href: "/products" },
              { label: product.name },
            ]}
          />


          {/* Not a even split: the thumbnail rail eats into the gallery column,
              and the copy beside it is short. 7/5 keeps the main image large. */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
            {/**
             * A single image while there is one photograph per product. The
             * gallery component is still in the repo and takes an array — swap it
             * back in the moment there are several shots of one product.
             */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink/5">
              <ProductPhoto
                image={product.image}
                name={product.name}
                slug={product.slug}
                swatch={product.swatch}
                priority
              />
            </div>

            {/* The case for it */}
            <div className="lg:pt-6">
              {/* The theme, from the spec sheet. Not a category — every product
                  here is a squishy, so a category chip would say the same thing
                  four times. */}
              <span
                className={`text-marker inline-block rounded-full px-3 py-1.5 text-white ${product.accent}`}
              >
                {product.specs.theme}
              </span>

              {/**
               * The shelf name is the display heading; the full listing title
               * sits under it, small. Set at this size the full name wraps to
               * three lines and stops being a heading — but it still has to be on
               * the page, because it is the name on the box and on the listing.
               */}
              <h1 className="text-display mt-5 text-[12vw] leading-[0.9] sm:text-[7vw] lg:text-[3.6vw]">
                {product.name}
              </h1>

              <p className="mt-3 text-[15px] font-bold text-ink/45">
                {product.fullName}
              </p>

              {product.price ? (
                <p className="text-display mt-4 text-[28px]">{product.price}</p>
              ) : null}

              <p className="mt-8 text-[19px] leading-relaxed font-medium text-ink/70">
                {product.fact}
              </p>

              {/**
               * Buy Now, gated.
               *
               * Everything above this line is open to anyone — photos, specs, the
               * whole case for the product. The sign-in gate sits on this one
               * click, the one that leaves for Amazon, because it is the last
               * moment we can know a visitor was interested before Amazon takes
               * the relationship.
               *
               * With no listing yet the button is disabled and marked unavailable
               * instead, which is what a shop shows for something it cannot sell.
               */}
              {amazonUrl ? (
                <BuyNowButton amazonUrl={amazonUrl} productName={product.name} />
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="mt-10 inline-flex cursor-not-allowed items-center gap-3 rounded-full bg-ink/10 px-9 py-4.5 text-[17px] font-extrabold text-ink/35"
                  >
                    Buy Now
                  </button>

                  <p className="mt-4 text-[14px] font-semibold text-ink/40">
                    Currently unavailable.
                  </p>
                </>
              )}

              <SaveButton slug={product.slug} className="mt-6" />
            </div>
          </div>

          {/**
           * The description, full width under the fold.
           *
           * Two columns rather than one long list: the paragraph and the reasons
           * are read in either order, and stacking them makes the page look
           * longer than it is.
           */}
          <section className="mt-20 border-t border-ink/10 pt-12">
            <div className="grid gap-10 lg:grid-cols-[5fr_6fr] lg:gap-16">
              <div>
                <h2 className="text-display max-w-[16ch] text-[9vw] leading-[0.92] sm:text-[5.5vw] lg:text-[2.9vw]">
                  {copy.headline}
                </h2>
                <p className="mt-7 max-w-[52ch] text-[18px] leading-relaxed font-medium text-ink/70">
                  {copy.body}
                </p>
              </div>

              <div className="lg:pt-3">
                <h3 className="text-[22px] font-extrabold tracking-tight">
                  {copy.reasonsTitle}
                </h3>

                <ul className="mt-6 space-y-5">
                  {copy.reasons.map((reason) => (
                    <li key={reason.title} className="flex gap-4">
                      <span
                        aria-hidden
                        className={`mt-2 size-2.5 shrink-0 rounded-full ${product.accent}`}
                      />
                      <p className="text-[17px] leading-relaxed text-ink/65">
                        <strong className="font-extrabold text-ink">
                          {reason.title}:
                        </strong>{" "}
                        {reason.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/**
           * Product details, straight off the manufacturing sheet.
           *
           * A real <table> with row headers rather than a styled grid: this is
           * tabular data, and a screen reader should be able to say "Shape:
           * rounded cube" instead of reading two unconnected columns of words.
           */}
          <section className="mt-20 border-t border-ink/10 pt-10">
            <h2 className="text-marker text-ink/50">Product details</h2>
            <table className="mt-5 w-full max-w-[560px] border-collapse text-left">
              <tbody>
                {(
                  [
                    ["Shape", product.specs.shape],
                    ["Theme", product.specs.theme],
                    ["Surface finish", product.specs.finish],
                    ["Colour", product.specs.colour],
                    ["Edge profile", product.specs.edge],
                  ] as const
                ).map(([label, value]) => (
                  <tr key={label} className="border-b border-ink/10">
                    <th
                      scope="row"
                      className="py-3.5 pr-6 align-top text-[15px] font-bold text-ink/45"
                    >
                      {label}
                    </th>
                    <td className="py-3.5 text-[15px] font-extrabold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Cross-links: a product page is a dead end without them */}
          <nav aria-label="Other products" className="mt-20 border-t border-ink/10 pt-10">
            <h2 className="text-marker text-ink/50">You may also like</h2>
            <ul className="mt-5 grid gap-6 sm:grid-cols-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5">
                      <ProductPhoto
                        image={p.image}
                        name={p.name}
                        slug={p.slug}
                        swatch={p.swatch}
                        showLabel={false}
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2.5">
                      <span
                        className="size-3 shrink-0 self-center rounded-full"
                        style={{ background: p.swatch }}
                      />
                      <span className="text-[15px] font-extrabold">{p.name}</span>
                      {p.price ? (
                        <span className="text-display ml-auto text-[17px]">{p.price}</span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
}
