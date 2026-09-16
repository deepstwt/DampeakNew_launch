import type { Metadata } from "next";
import { PRODUCTS, getProduct, primaryImage } from "@/content/site";
import { DOCS } from "@/content/legal";
import { CheckoutScreen } from "@/components/checkout/CheckoutScreen";

/**
 * Checkout — the page around the flow.
 *
 * Thin on purpose. Everything on screen depends on how far through the visitor
 * is, and how far through they are is client state, so the whole layout lives in
 * CheckoutScreen. What is left here is what a server can settle: which product,
 * what it costs, and which policies to link.
 *
 * The product arrives as ?product=<slug> from a Buy Now, and falls back to the
 * first product so the page is never blank when it is opened directly.
 */

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order.",
  // A step in a flow, not a destination.
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: PageProps<"/checkout">) {
  const { product: slug, qty } = await searchParams;
  const product =
    (typeof slug === "string" ? getProduct(slug) : undefined) ?? PRODUCTS[0];

  /**
   * One line, and however many of it the product page was left on.
   *
   * `qty` arrives from a Buy Now and is treated as hostile: it is a number in a
   * URL, so it can be "0", "-3", "abc" or "1e9". Clamped to the same 1–10 the
   * stepper offers, because a checkout that says "×1000000" because someone
   * edited the address bar is a checkout that will eventually be screenshotted.
   *
   * The money is formatted here rather than in the component, which should not
   * have to know a currency.
   */
  const asked = Number(Array.isArray(qty) ? qty[0] : qty);
  const quantity = Number.isFinite(asked)
    ? Math.min(10, Math.max(1, Math.floor(asked)))
    : 1;
  const unit = Number(product.price?.replace(/[^\d.]/g, "") ?? 0);
  const price = (unit * quantity).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  /**
   * The policies a checkout has to put in front of someone before they buy.
   * Terms of Sale belongs in this row and is missing from it deliberately: its
   * copy is still the placeholder draft, and linking a buyer to an unfinished
   * agreement is worse than not linking one yet.
   */
  const legal = DOCS.filter((d) => ["returns", "privacy"].includes(d.slug)).map(
    (d) => ({ slug: d.slug, title: d.title }),
  );

  const image = primaryImage(product);

  return (
    <CheckoutScreen
      summary={{
        slug: product.slug,
        name: product.name,
        fullName: product.fullName,
        detail: `${product.specs.colour} · ${product.specs.finish}`,
        price,
        image: image ? { src: image.src, alt: image.alt } : null,
        quantity,
      }}
      legal={legal}
    />
  );
}
