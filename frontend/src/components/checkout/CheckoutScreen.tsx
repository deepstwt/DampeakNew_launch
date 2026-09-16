"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CheckoutSteps, type Step } from "@/components/checkout/CheckoutSteps";

/**
 * The checkout: Information, Shipping, Payment, and the order that follows.
 *
 * It owns the whole screen, not just the form, because it owns the order — and
 * once an order is placed the summary column beside the form has nothing left
 * to do. A server component could not make that call; it cannot see this state.
 *
 * Each step's button is dull until its step is done and live the moment it is.
 * A button that is always dull teaches a visitor it is decoration; one that is
 * always bright and does nothing is worse.
 */

export type CheckoutSummary = {
  slug: string;
  name: string;
  fullName: string;
  detail: string;
  /** Pre-formatted — the money lives in one place and this is not it. */
  price: string;
  image: { src: string; alt: string } | null;
  quantity: number;
};

/* ── The wallets ─────────────────────────────────────────────────────────── */

/**
 * In the order the reference shows them.
 *
 * `background` is the colour the supplied artwork sits on, carried through to
 * the button so the mark keeps the field its owner drew it against. `border` is
 * for the light one only — a white button on a white page needs an edge to be a
 * button at all.
 *
 * Each brand publishes rules for its own mark, down to clear space and which
 * variants may be recoloured. The artwork here is what was handed over; before
 * these go live, whoever owns the merchant accounts should check each one
 * against its brand's current button guidelines, because that is also where the
 * approved dark and light variants come from.
 */
const WALLETS = [
  { name: "Shop Pay", src: "/brand/pay/shoppay.webp", width: 921, height: 292, background: "#4221ac", border: false },
  { name: "PayPal", src: "/brand/pay/paypal.webp", width: 947, height: 320, background: "#123986", border: false },
  { name: "Google Pay", src: "/brand/pay/gpay.webp", width: 1130, height: 488, background: "#ffffff", border: true },
] as const;

/* ── The form ────────────────────────────────────────────────────────────── */

/** One border, one radius, one hover for every field on the page. */
const FIELD =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-ink placeholder:text-ink/35 transition-colors hover:border-ink/30";

/**
 * What has to be filled before the step can be left.
 *
 * Company and the second address line are the two a real checkout marks
 * optional, so they are absent here.
 */
const REQUIRED = [
  "email",
  "given-name",
  "family-name",
  "address-line1",
  "address-level2",
  "address-level1",
  "postal-code",
  "tel",
] as const;

type FieldName = (typeof REQUIRED)[number] | "organization" | "address-line2";

const DELIVERY = [
  {
    id: "standard",
    name: "Standard",
    detail: "4 – 7 business days",
    price: "Free",
  },
  {
    id: "express",
    name: "Express",
    detail: "2 – 3 business days",
    price: "$6.00",
  },
] as const;

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  className = "",
}: {
  id: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* The label is the placeholder's job here visually, but a placeholder is
          not a label: it leaves as soon as you type, and a screen reader gets
          nothing from it. Both exist; only one is on screen. */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={label}
        className={FIELD}
      />
    </div>
  );
}

export function CheckoutScreen({
  summary,
  legal,
}: {
  summary: CheckoutSummary;
  legal: { slug: string; title: string }[];
}) {
  const [step, setStep] = useState<Step>("Information");
  const [values, setValues] = useState<Record<string, string>>({});
  /**
   * Nothing preselected.
   *
   * Standard was checked on arrival, which made Continue to payment's condition
   * one that was already met before the visitor did anything — so the button had
   * no reason to change and sat dull with a choice apparently made for them.
   * Starting empty gives the step something to complete.
   */
  const [delivery, setDelivery] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [order, setOrder] = useState<string | null>(null);

  const set = (id: FieldName) => (v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const field = (id: FieldName) => values[id] ?? "";

  /**
   * Filled, not valid.
   *
   * Every required field has something in it — that is the whole test. Nothing
   * here inspects what was typed, on purpose: this flow is walked with whatever
   * the person walking it feels like typing, and a format check would stop them
   * at the email field for a reason that does not matter here.
   */
  const complete = REQUIRED.every((id) => (values[id] ?? "").trim().length > 0);

  const chosenDelivery = DELIVERY.find((d) => d.id === delivery) ?? null;

  /**
   * The confirmation takes the whole column once an order is placed — no step
   * indicator, no way back into the form. That is how every shop ends this
   * flow: the thing you were filling in is finished, and what is left is the
   * reference and where it is going.
   */
  const backToProduct = (
    <Link
      href={`/products/${summary.slug}`}
      className="text-marker flex w-fit items-center gap-2 text-ink/40 transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" strokeWidth={3} />
      Back to {summary.name}
    </Link>
  );

  if (order) {
    const name = [field("given-name"), field("family-name")]
      .filter(Boolean)
      .join(" ");
    const address = [
      field("address-line1"),
      field("address-line2"),
      field("address-level2"),
      field("address-level1"),
      field("postal-code"),
    ].filter(Boolean);
    const chosen = DELIVERY.find((d) => d.id === delivery);

    /**
     * One column, centred, and no order summary beside it.
     *
     * The summary exists to tell you what you are about to buy; once you have
     * bought it, the thing to read is the reference and the address it is going
     * to. Leaving the panel up would keep a gift-card field and a "calculated at
     * next step" line on screen after there is nothing left to calculate.
     */
    return (
      <div className="min-h-screen bg-white px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[620px]">
        <span
          aria-hidden
          className="inline-flex size-14 items-center justify-center rounded-full bg-brown"
        >
          <Check className="size-7 text-white" strokeWidth={3} />
        </span>

        <h2 className="text-display mt-6 text-[9vw] leading-[0.95] sm:text-[5vw] lg:text-[2.8vw]">
          Thank you{name ? `, ${field("given-name")}` : ""}.
        </h2>

        <p className="mt-4 text-[17px] leading-relaxed font-medium text-ink/65">
          Your order is placed. We have sent the details to{" "}
          <span className="font-extrabold text-ink">{field("email")}</span>.
        </p>

        <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          <div className="flex flex-wrap justify-between gap-4 py-4">
            <dt className="text-marker text-ink/45">Order number</dt>
            <dd className="text-[15px] font-extrabold">{order}</dd>
          </div>

          <div className="flex flex-wrap justify-between gap-6 py-4">
            <dt className="text-marker text-ink/45">Shipping to</dt>
            <dd className="max-w-[46ch] text-right text-[15px] font-bold not-italic">
              {name ? <span className="block">{name}</span> : null}
              {address.map((line) => (
                <span key={line} className="block text-ink/65">
                  {line}
                </span>
              ))}
            </dd>
          </div>

          {chosen ? (
            <div className="flex flex-wrap justify-between gap-4 py-4">
              <dt className="text-marker text-ink/45">Delivery</dt>
              <dd className="text-[15px] font-bold">
                {chosen.name} · {chosen.detail}
              </dd>
            </div>
          ) : null}

          {method ? (
            <div className="flex flex-wrap justify-between gap-4 py-4">
              <dt className="text-marker text-ink/45">Paid with</dt>
              <dd className="text-[15px] font-bold">{method}</dd>
            </div>
          ) : null}
        </dl>

        <Link
          href="/products"
          className="rounded-squish mt-10 inline-flex items-center gap-3 bg-brown px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.98]"
        >
          Continue shopping
          <ArrowRight className="size-5" strokeWidth={3} />
        </Link>
        </div>
      </div>
    );
  }

  return (
    /**
     * A grid at every width, not only at lg. `order` is a grid and flex
     * property, so on a plain block container it does nothing and the columns
     * stack in source order — which put the form above the summary on a phone,
     * the opposite of what the ordering here asks for.
     */
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="order-2 px-6 pt-10 pb-16 md:px-10 lg:order-1 lg:ml-auto lg:w-full lg:max-w-[620px] lg:px-12 lg:pt-14">
        <header>{backToProduct}</header>

        <CheckoutSteps current={step} />

      {step === "Information" ? (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (complete) setStep("Shipping");
          }}
        >
          {/**
           * Express checkout.
           *
           * The three wallets from the reference, drawn from the artwork each
           * brand supplies. None is connected to anything, so all three are
           * disabled — which is now the only thing saying so, and the page has
           * no card field anywhere either.
           */}
          <section aria-labelledby="express">
            <h2 id="express" className="text-marker text-center text-ink/40">
              Express checkout
            </h2>

            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {WALLETS.map((wallet) => (
                <li key={wallet.name}>
                  <button
                    type="button"
                    disabled
                    aria-label={`Pay with ${wallet.name} — not available yet`}
                    className={`flex h-12 w-full items-center justify-center overflow-hidden rounded-xl ${wallet.border ? "border border-ink/15" : ""}`}
                    style={{ background: wallet.background }}
                  >
                    <Image
                      src={wallet.src}
                      alt={wallet.name}
                      width={wallet.width}
                      height={wallet.height}
                      className="h-full w-auto object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="my-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-marker text-ink/35">or</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <section aria-labelledby="contact">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id="contact" className="text-[19px] font-extrabold tracking-tight">
                Contact information
              </h2>
              <p className="text-[14px] font-semibold text-ink/55">
                Already have an account?{" "}
                <Link
                  href="/account"
                  className="font-extrabold text-ink underline decoration-2 underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </div>

            <div className="mt-4">
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={field("email")}
                onChange={set("email")}
              />
            </div>

            <label className="mt-3 flex items-center gap-3 text-[14px] font-semibold text-ink/65">
              <input
                type="checkbox"
                name="marketing"
                className="size-4 rounded border-ink/25 accent-brown"
              />
              Email me with news and offers
            </label>
          </section>

          <section aria-labelledby="shipping" className="mt-10">
            <h2 id="shipping" className="text-[19px] font-extrabold tracking-tight">
              Shipping address
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field id="given-name" label="First name" autoComplete="given-name" value={field("given-name")} onChange={set("given-name")} />
              <Field id="family-name" label="Last name" autoComplete="family-name" value={field("family-name")} onChange={set("family-name")} />
              <Field id="organization" label="Company (optional)" autoComplete="organization" className="sm:col-span-2" value={field("organization")} onChange={set("organization")} />
              <Field id="address-line1" label="Address" autoComplete="address-line1" className="sm:col-span-2" value={field("address-line1")} onChange={set("address-line1")} />
              <Field id="address-line2" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" className="sm:col-span-2" value={field("address-line2")} onChange={set("address-line2")} />
              <Field id="address-level2" label="City" autoComplete="address-level2" value={field("address-level2")} onChange={set("address-level2")} />
              <Field id="address-level1" label="State" autoComplete="address-level1" value={field("address-level1")} onChange={set("address-level1")} />
              <Field id="postal-code" label="ZIP code" autoComplete="postal-code" value={field("postal-code")} onChange={set("postal-code")} />
              <Field id="tel" label="Phone" type="tel" autoComplete="tel" value={field("tel")} onChange={set("tel")} />
            </div>
          </section>

          {/**
           * Dull until the step is done, live the moment it is.
           *
           * `disabled` rather than hidden, and `aria-disabled` with it, so the
           * button is announced as present but unavailable rather than
           * disappearing and reappearing under a screen reader.
           */}
          <button
            type="submit"
            disabled={!complete}
            aria-disabled={!complete}
            className={`rounded-squish mt-8 inline-flex items-center gap-3 px-8 py-4.5 text-[17px] font-extrabold transition ${
              complete
                ? "bg-blue text-white hover:brightness-110 active:scale-[0.98]"
                : "cursor-not-allowed bg-ink/10 text-ink/35"
            }`}
          >
            Continue to shipping
            <ArrowRight className="size-5" strokeWidth={3} />
          </button>
        </form>
      ) : step === "Shipping" ? (
        <div className="mt-8">
          <section aria-labelledby="delivery">
            <h2 id="delivery" className="text-[19px] font-extrabold tracking-tight">
              Delivery method
            </h2>

            <ul className="mt-4 space-y-3">
              {DELIVERY.map((option) => (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                      delivery === option.id
                        ? "border-ink bg-cream/40"
                        : "border-ink/15 hover:border-ink/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={delivery === option.id}
                      onChange={() => setDelivery(option.id)}
                      className="size-4 accent-brown"
                    />
                    <span className="flex-1">
                      <span className="block text-[15px] font-extrabold">
                        {option.name}
                      </span>
                      <span className="block text-[13px] font-semibold text-ink/45">
                        {option.detail}
                      </span>
                    </span>
                    <span className="text-[15px] font-extrabold">
                      {option.price}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => delivery && setStep("Payment")}
              disabled={!delivery}
              aria-disabled={!delivery}
              className={`rounded-squish inline-flex items-center gap-3 px-8 py-4.5 text-[17px] font-extrabold transition ${
                delivery
                  ? "bg-blue text-white hover:brightness-110 active:scale-[0.98]"
                  : "cursor-not-allowed bg-ink/10 text-ink/35"
              }`}
            >
              Continue to payment
              <ArrowRight className="size-5" strokeWidth={3} />
            </button>

            <button
              type="button"
              onClick={() => setStep("Information")}
              className="inline-flex items-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" strokeWidth={3} />
              Back to information
            </button>
          </div>
        </div>
      ) : (
        /**
         * Payment, and then the order.
         *
         * The wallets are the payment methods: pick one and Place order comes
         * on, the same way the two steps before this one work. There is no card
         * form and there will not be one here — card details belong in the
         * payment provider's own hosted fields, never in inputs of ours, and a
         * real card number typed into a page that cannot process it is the one
         * thing on this flow that could cost somebody something.
         *
         * Placing the order draws a reference and shows the confirmation. It
         * does not charge, write an order or send an email, because none of
         * those exist yet; what it does is complete the walk-through.
         */
        <div className="mt-8">
          <section aria-labelledby="pay">
            <h2 id="pay" className="text-[19px] font-extrabold tracking-tight">
              Payment
            </h2>

            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {WALLETS.map((wallet) => (
                <li key={wallet.name}>
                  <button
                    type="button"
                    onClick={() => setMethod(wallet.name)}
                    aria-pressed={method === wallet.name}
                    aria-label={`Pay with ${wallet.name}`}
                    className={`flex h-12 w-full items-center justify-center overflow-hidden rounded-xl transition ${
                      method === wallet.name
                        ? "ring-2 ring-ink ring-offset-2"
                        : "hover:brightness-105"
                    } ${wallet.border ? "border border-ink/15" : ""}`}
                    style={{ background: wallet.background }}
                  >
                    <Image
                      src={wallet.src}
                      alt={wallet.name}
                      width={wallet.width}
                      height={wallet.height}
                      className="h-full w-auto object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>

            {method ? (
              <p className="mt-4 text-[14px] font-semibold text-ink/55">
                Paying with <span className="font-extrabold text-ink">{method}</span>.
              </p>
            ) : (
              <p className="mt-4 text-[14px] font-semibold text-ink/55">
                Choose how you would like to pay.
              </p>
            )}
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (!method) return;
                // A reference, drawn when the order is placed. Six characters,
                // generated here rather than server-side because there is no
                // order to number — this is what the confirmation shows.
                const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
                setOrder(`DP-${ref}`);
              }}
              disabled={!method}
              aria-disabled={!method}
              className={`rounded-squish inline-flex items-center gap-3 px-8 py-4.5 text-[17px] font-extrabold transition ${
                method
                  ? "bg-blue text-white hover:brightness-110 active:scale-[0.98]"
                  : "cursor-not-allowed bg-ink/10 text-ink/35"
              }`}
            >
              Place order
              <ArrowRight className="size-5" strokeWidth={3} />
            </button>

            <button
              type="button"
              onClick={() => setStep("Shipping")}
              className="inline-flex items-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" strokeWidth={3} />
              Back to shipping
            </button>
          </div>
        </div>
      )}

        <div className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/products/${summary.slug}`}
            className="inline-flex items-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={3} />
            Return to {summary.name}
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
                  {summary.image ? (
                    <Image
                      src={summary.image.src}
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
                  {summary.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold">{summary.fullName}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-ink/45">
                  {summary.detail}
                </p>
              </div>

              <p className="text-[15px] font-extrabold">{summary.price}</p>
            </li>
          </ul>

          {/* Discount code. Inert — there is nothing to redeem against. */}
          <div className="mt-8 flex gap-3 border-t border-ink/10 pt-8">
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
          </div>

          <dl className="mt-8 space-y-3 border-t border-ink/10 pt-8 text-[15px]">
            <div className="flex items-center justify-between">
              <dt className="font-semibold text-ink/60">Subtotal</dt>
              <dd className="font-extrabold">{summary.price}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-semibold text-ink/60">Shipping</dt>
              <dd className="font-semibold text-ink/45">
                {chosenDelivery ? chosenDelivery.price : "Calculated at next step"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-6">
            <p className="text-[17px] font-extrabold">Total</p>
            <p className="text-display text-[28px]">
              <span className="mr-1.5 align-middle text-[13px] font-bold text-ink/45">
                USD
              </span>
              {summary.price}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
