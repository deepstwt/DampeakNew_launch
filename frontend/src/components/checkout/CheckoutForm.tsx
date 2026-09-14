"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CheckoutSteps, type Step } from "@/components/checkout/CheckoutSteps";

/**
 * The checkout flow, as far as it goes: Information, then Shipping.
 *
 * Continue to shipping is disabled until the fields it needs are filled, and
 * live the moment they are — that is the whole point of the state in here. A
 * button that is always dull teaches a visitor that it is decoration; a button
 * that is always bright and does nothing is worse.
 *
 * Payment is where it stops. There is no provider connected, so Continue to
 * payment never comes on, and nothing on this page collects a card number.
 */

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
 * optional, so they are absent here — and the email is checked for shape rather
 * than presence, because "a@b" reaching the shipping step and failing there is
 * the same mistake one screen later.
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

export function CheckoutForm() {
  const [step, setStep] = useState<Step>("Information");
  const [values, setValues] = useState<Record<string, string>>({});
  const [delivery, setDelivery] = useState<string>(DELIVERY[0].id);

  const set = (id: FieldName) => (v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const field = (id: FieldName) => values[id] ?? "";

  const complete =
    REQUIRED.every((id) => (values[id] ?? "").trim().length > 0) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email ?? "");

  return (
    <div>
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
      ) : (
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
            {/* Payment is where this stops: no provider is connected, so this
                one cannot come on the way the last one did. */}
            <button
              type="button"
              disabled
              aria-disabled
              className="rounded-squish inline-flex cursor-not-allowed items-center gap-3 bg-ink/10 px-8 py-4.5 text-[17px] font-extrabold text-ink/35"
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
      )}
    </div>
  );
}
