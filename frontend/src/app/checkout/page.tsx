import type { Metadata } from "next";
import { getProduct } from "@/content/site";
import { DOCS } from "@/content/legal";
import { CheckoutScreen } from "@/components/checkout/CheckoutScreen";
import { clampQuantity } from "@/lib/quantity";

/**
 * Checkout — the page around the flow.
 *
 * Thin on purpose. Everything on screen depends on how far through the visitor
 * is and on what they are buying, and both of those are client state now, so the
 * whole layout lives in CheckoutScreen. What is left here is what a server can
 * settle: which policies to link, and how to read the one URL this page accepts.
 *
 * Two ways in, and the URL is what distinguishes them:
 *
 *   /checkout?product=<slug>&qty=<n>   a Buy Now — this one thing, this many
 *   /checkout                          the cart
 *
 * Buy Now deliberately does not go through the cart. Someone who presses it has
 * asked to buy the thing they are looking at; folding a cart they had forgotten
 * about into that order charges them for four things when they asked for one.
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
  const product = typeof slug === "string" ? getProduct(slug) : undefined;

  /**
   * `qty` arrives from a Buy Now and is treated as hostile: it is a number in a
   * URL, so it can be "0", "-3", "abc" or "1e9". Clamped to the same 1–10 the
   * stepper and the cart offer, because a checkout that says "×1000000" because
   * someone edited the address bar is a checkout that will be screenshotted.
   *
   * An unknown slug falls through to the cart rather than to the first product.
   * Substituting a different product for the one in the link is the one outcome
   * here that could take somebody's money for something they never asked for.
   */
  const quantity = clampQuantity(Number(Array.isArray(qty) ? qty[0] : qty));

  /**
   * The policies a checkout has to put in front of someone before they buy.
   * Terms of Sale belongs in this row and is missing from it deliberately: its
   * copy is still the placeholder draft, and linking a buyer to an unfinished
   * agreement is worse than not linking one yet.
   */
  const legal = DOCS.filter((d) => ["returns", "privacy"].includes(d.slug)).map(
    (d) => ({ slug: d.slug, title: d.title }),
  );

  return (
    <CheckoutScreen
      direct={product ? { slug: product.slug, quantity } : null}
      legal={legal}
    />
  );
}
