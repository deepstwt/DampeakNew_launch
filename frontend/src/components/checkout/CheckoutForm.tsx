import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * The wallets, in the order the reference shows them.
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
  {
    name: "Shop Pay",
    src: "/brand/pay/shoppay.webp",
    width: 921,
    height: 292,
    background: "#4221ac",
    border: false,
  },
  {
    name: "PayPal",
    src: "/brand/pay/paypal.webp",
    width: 947,
    height: 320,
    background: "#123986",
    border: false,
  },
  {
    name: "Google Pay",
    src: "/brand/pay/gpay.webp",
    width: 1130,
    height: 488,
    background: "#ffffff",
    border: true,
  },
] as const;

/**
 * Contact and shipping address.
 *
 * Server-rendered and inert: no state, no submit, no action. The step it would
 * continue to does not exist, so the button is disabled rather than wired to
 * something that would look like it worked.
 *
 * The fields are real ones, with the `autoComplete` tokens browsers and password
 * managers actually look for. That costs nothing now and is the part of a
 * checkout form most often left until last, by which time every field has to be
 * revisited to find out why nothing autofills.
 */

/** One border, one radius, one focus ring for every field on the page. */
const FIELD =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-ink placeholder:text-ink/35 transition-colors hover:border-ink/30";

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
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
        autoComplete={autoComplete}
        placeholder={label}
        className={FIELD}
      />
    </div>
  );
}

export function CheckoutForm() {
  return (
    <form className="mt-8">
      {/**
       * Express checkout.
       *
       * The three wallets from the reference, drawn from the artwork each brand
       * supplies. They are disabled — none of them is connected to anything —
       * and the banner above the form says the page takes no payment, which is
       * what keeps a row of familiar payment marks from implying a checkout that
       * works.
       *
       * Each logo arrives on its own flat field, so the button takes that field
       * as its background rather than trying to sit the mark on a colour of
       * ours. The light one gets a border; without it a white button on a white
       * page has no edge.
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

        <p className="mt-3 text-center text-[13px] font-semibold text-ink/40">
          Wallets turn on once a payment provider is connected.
        </p>
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
          <Field id="email" label="Email" type="email" autoComplete="email" />
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
          <Field id="given-name" label="First name" autoComplete="given-name" />
          <Field id="family-name" label="Last name" autoComplete="family-name" />
          <Field
            id="organization"
            label="Company (optional)"
            autoComplete="organization"
            className="sm:col-span-2"
          />
          <Field
            id="address-line1"
            label="Address"
            autoComplete="address-line1"
            className="sm:col-span-2"
          />
          <Field
            id="address-line2"
            label="Apartment, suite, etc. (optional)"
            autoComplete="address-line2"
            className="sm:col-span-2"
          />
          <Field id="address-level2" label="City" autoComplete="address-level2" />
          <Field
            id="address-level1"
            label="State"
            autoComplete="address-level1"
          />
          <Field id="postal-code" label="ZIP code" autoComplete="postal-code" />
          <Field id="tel" label="Phone" type="tel" autoComplete="tel" />
        </div>
      </section>

      {/* Disabled, because the step it continues to does not exist. */}
      <button
        type="button"
        disabled
        className="rounded-squish mt-8 inline-flex cursor-not-allowed items-center gap-3 bg-blue px-8 py-4.5 text-[17px] font-extrabold text-white opacity-60"
      >
        Continue to shipping
        <ArrowRight className="size-5" strokeWidth={3} />
      </button>
    </form>
  );
}
