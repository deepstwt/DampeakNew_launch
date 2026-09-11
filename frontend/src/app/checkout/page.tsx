import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { PRODUCTS, getProduct, primaryImage, site } from "@/content/site";
import { DOCS } from "@/content/legal";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

/**
 * Checkout — the information step.
 *
 * A word on what this is and is not. It takes no money, writes no order and
 * clears no basket: there is no payment provider connected, no order collection
 * in the database and no cart in the app. It is the screen, built to the flow it
 * will have, so the layout and the copy can be settled before any of that
 * exists.
 *
 * A banner used to say all of that on the page itself. It is gone, so what is
 * left to tell a visitor are the controls: Continue to shipping is disabled, the
 * discount field is disabled, the wallets are disabled and say they turn on once
 * a payment provider is connected. There is no card field anywhere, so the page
 * cannot take money even by accident. That holds while this is a screen being
 * reviewed; before it is public with a working button, it needs a real answer
 * rather than the absence of one.
 *
 * The product comes in through ?product=<slug> from a Buy Now, and falls back to
 * the first product so the page is never blank when it is opened directly.
 */

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order.",
  // Nothing here should be indexed: it is a step in a flow, not a destination,
  // and this one is a mockup besides.
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: PageProps<"/checkout">) {
  const { product: slug } = await searchParams;
  const product =
    (typeof slug === "string" ? getProduct(slug) : undefined) ?? PRODUCTS[0];

  const image = primaryImage(product);

  /**
   * The money.
   *
   * `price` is a display string ("$14.99"), so the number has to come out of it
   * to be added up. Quantity is fixed at one: there is no cart, so there is
   * nothing that could make it two.
   *
   * Tax is shown as a share of the total rather than added on top, which is what
   * a tax-inclusive price means — the line under the total says how much of it
   * is tax, it does not raise it.
   */
  const unit = Number(product.price?.replace(/[^\d.]/g, "") ?? 0);
  const quantity = 1;
  const subtotal = unit * quantity;
  const TAX_RATE = 0.1;
  const includedTax = subtotal - subtotal / (1 + TAX_RATE);

  const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const legal = DOCS.filter((d) =>
    ["returns", "privacy", "terms"].includes(d.slug),
  );

  return (
    // A grid at every width, not only at lg. `order` is a grid and flex
    // property, so on a plain block container it does nothing and the columns
    // stack in source order — which put the form above the summary on a phone,
    // the opposite of what the ordering below asks for.
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/**
       * The form column, and the order column beside it.
       *
       * On a narrow screen the order summary comes first in the DOM order that
       * matters — you check what you are buying, then fill the form — but on a
       * wide one it belongs on the right, which is why the two are laid out as
       * columns of one grid rather than nested.
       */}
      <div className="order-2 px-6 pt-10 pb-16 md:px-10 lg:order-1 lg:ml-auto lg:w-full lg:max-w-[620px] lg:px-12 lg:pt-14">
        <header>
          <Link href="/" className="inline-block">
            <Image
              src="/brand/dampeak-brown.webp"
              alt={site.name}
              width={468}
              height={400}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <CheckoutSteps />
        </header>

        <CheckoutForm />

        <div className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={3} />
            Return to {product.name}
          </Link>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/${doc.slug}`}
                  className="text-[13px] font-semibold text-ink/45 transition-colors hover:text-ink"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside
        aria-label="Order summary"
        className="order-1 border-b border-ink/10 bg-cream/40 px-6 py-10 md:px-10 lg:order-2 lg:min-h-screen lg:border-b-0 lg:border-l lg:px-12 lg:pt-14"
      >
        <div className="lg:max-w-[520px]">
          <h2 className="sr-only">Order summary</h2>

          <ul>
            <li className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="relative size-16 overflow-hidden rounded-xl border border-ink/10 bg-white">
                  {image ? (
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  ) : null}
                </div>
                {/* The quantity badge, as every checkout draws it. */}
                <span
                  aria-hidden
                  className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-brown text-[12px] font-extrabold text-white"
                >
                  {quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold">{product.fullName}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-ink/45">
                  {product.specs.colour} · {product.specs.finish}
                </p>
              </div>

              <p className="text-[15px] font-extrabold">
                {money(unit * quantity)}
                <span className="sr-only"> for {quantity}</span>
              </p>
            </li>
          </ul>

          {/* Discount code. Inert, like everything else on this page. */}
          <form className="mt-8 flex gap-3 border-t border-ink/10 pt-8">
            <label htmlFor="discount" className="sr-only">
              Gift card or discount code
            </label>
            <input
              id="discount"
              name="discount"
              type="text"
              placeholder="Gift card or discount code"
              disabled
              className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] font-semibold placeholder:text-ink/35 disabled:bg-ink/[0.03]"
            />
            <button
              type="button"
              disabled
              className="rounded-xl bg-ink/10 px-6 py-3 text-[15px] font-extrabold text-ink/35"
            >
              Apply
            </button>
          </form>

          <dl className="mt-8 space-y-3 border-t border-ink/10 pt-8 text-[15px]">
            <div className="flex items-center justify-between">
              <dt className="font-semibold text-ink/60">Subtotal</dt>
              <dd className="font-extrabold">{money(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-semibold text-ink/60">Shipping</dt>
              <dd className="font-semibold text-ink/45">
                Calculated at next step
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-6">
            <div>
              <p className="text-[17px] font-extrabold">Total</p>
              <p className="mt-1 text-[13px] font-semibold text-ink/45">
                Including {money(includedTax)} in taxes
              </p>
            </div>
            <p className="text-display text-[28px]">
              <span className="mr-1.5 align-middle text-[13px] font-bold text-ink/45">
                USD
              </span>
              {money(subtotal)}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
