import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, getProduct, primaryImage, site } from "@/content/site";
import { SITE_URL } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { ProductGallery } from "@/components/ui/ProductGallery";
import { BuyPanel } from "@/components/ui/BuyPanel";
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
  const cover = primaryImage(product);

  return {
    title,
    description: product.fact,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description: product.fact,
      type: "website",
      ...(cover ? { images: [{ url: cover.src, alt: cover.alt }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const copy = product.description;
  const cover = primaryImage(product);

  /**
   * Product structured data.
   *
   * `price` is stored for display ("₹2,999"), so the separators have to come out
   * before it can be published as a number — schema.org wants a bare decimal and
   * silently rejects the formatted string.
   *
   * Two deliberate choices, both about not making claims we cannot back:
   *
   *   - `offers.url` points wherever the sale actually happens, which is this
   *     site's own checkout. Google compares offer data against the page it
   *     lands on, and a mismatch there is what gets flagged.
   *   - No `availability`. It is only ever a copy of Amazon's stock at the moment
   *     this page was built, and a stale InStock is worse than none.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.fullName,
    // The opening section, which is the closest thing to a summary the copy has.
    description: copy[0].body.join(" "),
    ...(cover ? { image: cover.src } : {}),
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
        ? { price: product.price.replace(/[^\d.]/g, ""), priceCurrency: "USD" }
        : {}),
      url: `${SITE_URL}/products/${product.slug}`,
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


          {/* An even split now. The picture used to take seven twelfths of the
              row; with a thumbnail rail beside it and four headed sections of
              copy below, it does not need to be the largest thing on screen. */}
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery
              images={product.images}
              name={product.name}
              slug={product.slug}
              swatch={product.swatch}
              overlay={
                /* On the picture, top left. z-10 because the photograph fills
                   the frame absolutely and would otherwise cover it. */
                <SaveButton
                  slug={product.slug}
                  className="absolute top-4 left-4 z-10"
                />
              }
            />

            {/* The case for it */}
            <div className="lg:pt-6">
              {/* The theme, from the spec sheet. Not a category — every product
                  here is a squishy, so a category chip would say the same thing
                  four times.

                  Brown on every product rather than the product's own accent.
                  The accents were a brand colour each, and two of the four could
                  not carry white text: the chip was already unreadable on the
                  yellow product, and turning the orange one yellow would have
                  made that two. */}
              <span
                className="text-marker inline-block rounded-full bg-brown px-3 py-1.5 text-white"
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
               * How many, and then Buy Now.
               *
               * Both live in BuyPanel because the button carries the number —
               * quantity reaches the checkout in the href, so a stepper sitting
               * apart from the link would be a control that changes nothing.
               */}
              <BuyPanel slug={product.slug} />

            </div>
          </div>

          {/**
           * The description, full width under the fold.
           *
           * Four headed sections in two columns. One column would run the page
           * to twice the length for copy that is read in any order — these are
           * four separate claims about the same object, not a sequence.
           */}
          <section className="mt-20 border-t border-ink/10 pt-12">
            <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
              {copy.map((part) => (
                <div key={part.heading}>
                  <h2 className="text-[22px] font-extrabold tracking-tight">
                    {part.heading}
                  </h2>
                  {part.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-4 max-w-[54ch] text-[17px] leading-relaxed text-ink/65"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
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
                        image={primaryImage(p)}
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
