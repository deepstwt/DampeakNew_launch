import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
       * Deliberately unbranded. The reference carried Shop Pay, PayPal and
       * Google Pay, and those marks state a payment relationship — putting them
       * on a page that cannot take a payment claims one we do not have. The slot
       * stays so the layout is the real layout.
       */}
      <section aria-labelledby="express">
        <h2
          id="express"
          className="text-marker text-center text-ink/40"
        >
          Express checkout
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {["Wallet", "Wallet", "Wallet"].map((label, i) => (
            <div
              key={i}
              aria-hidden
              className="flex h-12 items-center justify-center rounded-xl border border-dashed border-ink/20 bg-ink/[0.03] text-[13px] font-bold text-ink/30"
            >
              {label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[13px] font-semibold text-ink/40">
          Wallets appear here once a payment provider is connected.
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
