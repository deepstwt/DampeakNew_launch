"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { CheckoutSteps, type Step } from "@/components/checkout/CheckoutSteps";
import { Finalizing } from "@/components/checkout/Finalizing";
import { WalletSheet, type Wallet } from "@/components/checkout/WalletSheet";
import { authClient } from "@/lib/auth-client";
import { resolve, useCart, type ResolvedLine } from "@/lib/cart";
import { formatUSD, fromCents } from "@/lib/money";

/**
 * The checkout: Information, Shipping, Payment, and the order that follows.
 *
 * It owns the whole screen, not just the form, because it owns the order — and
 * once an order is placed the summary column beside the form has nothing left
 * to do. A server component could not make that call; it cannot see this state.
 *
 * It also owns what is being bought, for the same reason: a cart lives in the
 * browser. `direct` is the Buy Now case, where the page was told one product and
 * one quantity in the URL; with no `direct` this is the cart's checkout and the
 * lines come from the cart.
 *
 * Each step's button is dull until its step is done and live the moment it is.
 * A button that is always dull teaches a visitor it is decoration; one that is
 * always bright and does nothing is worse.
 */

/** What a Buy Now carries: one product, one quantity, already validated. */
export type DirectLine = { slug: string; quantity: number };

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
const WALLETS: Wallet[] = [
  {
    name: "Shop Pay",
    src: "/brand/pay/shoppay.webp",
    width: 921,
    height: 292,
    background: "#4221ac",
    border: false,
    tag: "Shop Pay · Fast checkout",
    instrument: "Visa ···· 4242",
  },
  {
    name: "PayPal",
    src: "/brand/pay/paypal.webp",
    width: 947,
    height: 320,
    background: "#123986",
    border: false,
    tag: "PayPal · Express checkout",
    instrument: "PayPal balance",
  },
  {
    name: "Google Pay",
    src: "/brand/pay/gpay.webp",
    width: 1130,
    height: 488,
    background: "#ffffff",
    border: true,
    tag: "Google Pay · Fast checkout",
    instrument: "Visa ···· 4242",
  },
];

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

type FieldName =
  | (typeof REQUIRED)[number]
  | "organization"
  | "address-line2"
  | "country"
  | "billing-address"
  | "billing-city"
  | "billing-state"
  | "billing-zip";

/**
 * `cents` is what the total is built from; `price` is what the option says on
 * screen. Free is 0 and prints as a word, so deriving one from the other would
 * mean either a total that cannot add up "Free" or an option labelled "$0.00".
 */
const DELIVERY = [
  {
    id: "standard",
    name: "Standard",
    detail: "4 – 7 business days",
    price: "Free",
    cents: 0,
  },
  {
    id: "express",
    name: "Express",
    detail: "2 – 3 business days",
    price: "$6.00",
    cents: 600,
  },
] as const;

/**
 * Where we ship, and the states of the one country that has them here.
 *
 * A short list rather than every country on earth: the prices on this site are
 * in USD and the delivery options are written for the US. A checkout offering a
 * country it cannot quote a delivery price for is offering nothing.
 */
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
] as const;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
] as const;

/** The two payment choices on the last step. */
type PayWith = "card" | "shoppay";

/**
 * The card the flow starts with: the test number every payment provider
 * publishes for demonstrations, which is not a card that exists and cannot be
 * charged by anyone. It is prefilled rather than left blank on purpose — an
 * empty card field on a page like this is an invitation to type a real one.
 */
const TEST_CARD = { number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" };

/** 4242424242424242 → 4242 4242 4242 4242, as it is typed. */
const groupDigits = (raw: string) =>
  raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

/** 1228 → 12/28, and a slash typed by hand is not doubled. */
const expiryMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

function Select({
  id,
  label,
  value,
  onChange,
  options,
  autoComplete,
  className = "",
}: {
  id: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Visible, unlike the inputs' labels: a select shows its value from the
          start, so there is no placeholder doing the label's job. */}
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold text-ink/55">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${FIELD} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%230b0b0f' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

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
  direct,
  legal,
}: {
  direct: DirectLine | null;
  legal: { slug: string; title: string }[];
}) {
  const cart = useCart();
  /**
   * Who is signed in, if anyone.
   *
   * A wallet is an account, not a form: the profile on the sheet is the account
   * the visitor is signed into, which is why the email there is the signed-in
   * one rather than whatever was last typed into the contact field. Signed out,
   * it falls back to what the form has.
   */
  const { data: session } = authClient.useSession();
  const [step, setStep] = useState<Step>("Information");
  const [values, setValues] = useState<Record<string, string>>({
    // A select is never empty, so its default belongs here rather than in a
    // fallback at every read site.
    country: "United States",
  });
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
  /**
   * Which wallet sheet is open, if any.
   *
   * Express checkout is a second way through this screen, not a shortcut inside
   * the first: it takes what the Information step has and goes straight to the
   * order, which is what a wallet does in a real shop — it already holds the
   * card and the delivery address, so the two steps it skips are the two it
   * would have filled in itself.
   */
  const [sheet, setSheet] = useState<Wallet | null>(null);
  const [payWith, setPayWith] = useState<PayWith>("card");
  const [sameBilling, setSameBilling] = useState(true);
  /**
   * Component state, and nowhere else.
   *
   * Never written to storage, never put on the order, never logged. The order
   * keeps the last four digits and only because a receipt has to say which card
   * paid it.
   */
  const [card, setCard] = useState({ ...TEST_CARD, name: "" });
  /** Held between pressing Pay now and the confirmation appearing. */
  const [paying, setPaying] = useState(false);
  const payTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A pending payment on a screen that has gone is an order placed into nothing.
  useEffect(() => () => {
    if (payTimer.current) clearTimeout(payTimer.current);
  }, []);
  /**
   * The placed order, and a snapshot of what was in it.
   *
   * The lines have to be copied rather than read back off the cart: placing the
   * order empties the cart, and a confirmation that reads live cart state would
   * come up showing nothing bought.
   */
  const [order, setOrder] = useState<{
    ref: string;
    lines: ResolvedLine[];
    total: number;
  } | null>(null);

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
   * Filled, not valid — the same test the steps before this one use. A card
   * number is checked by the bank that issues it, and a Luhn check here would
   * only stop someone walking through a flow that charges nothing.
   */
  const canPay =
    payWith === "shoppay" ||
    (card.number.replace(/\D/g, "").length >= 12 &&
      card.expiry.length >= 4 &&
      card.cvc.length >= 3);

  /** The address as one line, for the places that recap it rather than edit it. */
  const shipLine = [
    field("address-line1"),
    field("address-line2"),
    field("address-level2"),
    field("address-level1"),
    field("postal-code"),
    field("country") === "United States" ? "" : field("country"),
  ]
    .filter(Boolean)
    .join(", ");

  /**
   * What was entered on the steps already passed, with a way back into each.
   *
   * Every checkout has this and ours did not: once you left the Information
   * step there was nothing on screen saying which email or address the order was
   * going to, and the only way to check was Back — which is the button people
   * press when they think they have lost their place. Each row goes back to the
   * step that owns it, so Change means change this, not start again.
   */
  const review = (rows: { label: string; value: string; to: Step }[]) => (
    <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/15">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-4 px-4 py-3.5">
          <dt className="w-[76px] shrink-0 pt-0.5 text-[13px] font-bold text-ink/45">
            {row.label}
          </dt>
          <dd className="min-w-0 flex-1 text-[14px] font-bold break-words">
            {row.value || <span className="text-ink/35">Not given</span>}
          </dd>
          <button
            type="button"
            onClick={() => setStep(row.to)}
            className="shrink-0 pt-0.5 text-[13px] font-extrabold text-blue underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70"
          >
            Change
          </button>
        </div>
      ))}
    </dl>
  );

  /**
   * Placing the order — the last thing both routes through this screen do.
   *
   * Written once because the two routes have to end identically: whether the
   * order came from the three steps or from a wallet sheet, the reference is
   * drawn the same way, the lines are snapshotted the same way, and the cart is
   * emptied under the same condition. Two copies of this drift, and the one that
   * drifts is always the one nobody clicks in testing.
   */
  const place = (paidWith: string, lines: ResolvedLine[], total: number) => {
    // Six characters, generated here rather than server-side because there is
    // no order to number — this is what the confirmation shows.
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
    setMethod(paidWith);
    setOrder({ ref: `DP-${ref}`, lines, total });
    // The cart has been bought; emptying it is the last thing this flow owes
    // it. A Buy Now never touched the cart, so it must not empty one either —
    // that would delete things the visitor put aside and never agreed to buy.
    if (!direct) cart.clear();
  };

  /**
   * What is being bought, and what it comes to.
   *
   * A Buy Now resolves on the server as well as the browser, so that case paints
   * complete on the first frame. The cart cannot: it is in localStorage, so the
   * server renders no lines and `cart.ready` is what says whether an empty list
   * means "empty" or "not read yet".
   */
  const lines = direct ? resolve([direct]) : cart.items;
  const ready = direct ? true : cart.ready;

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const shipping = chosenDelivery?.cents ?? 0;
  const total = subtotal + shipping;

  /**
   * Where "back" goes, which is wherever this checkout was entered from: the
   * product for a Buy Now, the cart otherwise.
   */
  const back =
    direct && lines[0]
      ? { href: `/products/${lines[0].slug}`, label: lines[0].name }
      : { href: "/cart", label: "your cart" };

  /**
   * The confirmation takes the whole column once an order is placed — no step
   * indicator, no way back into the form. That is how every shop ends this
   * flow: the thing you were filling in is finished, and what is left is the
   * reference and where it is going.
   */
  const backLink = (
    <Link
      href={back.href}
      className="text-marker flex w-fit items-center gap-2 text-ink/40 transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" strokeWidth={3} />
      Back to {back.label}
    </Link>
  );

  if (order) {
    /**
     * The same order the wallet sheet uses: what was typed, then the account.
     * An express order can be placed without the form being touched, and this
     * page is the one that would otherwise thank nobody and post to nowhere.
     */
    const name =
      [field("given-name"), field("family-name")].filter(Boolean).join(" ") ||
      (session?.user?.name ?? "");
    const email = field("email") || (session?.user?.email ?? "");
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
        {/**
         * The header, on its own field of green.
         *
         * Green is not in the palette anywhere else and is deliberate here: this
         * is the one screen in the shop that reports an outcome rather than
         * offering a choice, and the colour that means "done" is worth more on
         * it than palette consistency.
         */}
        <div className="rounded-3xl border border-[#bbf7d0] bg-[#f0fdf4] px-6 py-10 text-center">
          <span
            aria-hidden
            className="inline-flex size-14 items-center justify-center rounded-full bg-[#16a34a]"
          >
            <Check className="size-7 text-white" strokeWidth={3} />
          </span>

          <p className="text-marker mt-5 text-[#15803d]">Order confirmed</p>

          <h2 className="text-display mt-3 text-[8vw] leading-[1] sm:text-[4vw] lg:text-[2.4vw]">
            Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
          </h2>

          <p className="mx-auto mt-4 max-w-[46ch] text-[16px] leading-relaxed font-medium text-ink/65">
            Your order is confirmed
            {email ? (
              <>
                . We have sent the details to{" "}
                <span className="font-extrabold text-ink">{email}</span>.
              </>
            ) : (
              "."
            )}
          </p>

          {/* The one thing on this page somebody will be asked to read back down
              a phone line, so it is boxed and set in a face where a 0 and an O
              are not the same shape. */}
          <p className="mt-6 inline-block rounded-xl border border-ink/15 bg-white px-5 py-3 font-mono text-[15px] font-bold">
            Order number: <span className="text-ink">{order.ref}</span>
          </p>
        </div>

        {/**
         * Everything the order was, in four quarters.
         *
         * A two-column grid rather than the label-and-value list this used to
         * be: the four things somebody checks on a confirmation — where it is
         * going, how, what paid, and who it was sent to — are peers, and a list
         * makes the last one look like a footnote to the first.
         */}
        <div className="mt-6 rounded-3xl border border-ink/15 px-6 py-6">
          <h3 className="text-[17px] font-extrabold tracking-tight">Order details</h3>

          <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] font-bold text-ink/45">Contact</dt>
              <dd className="mt-1 text-[15px] font-bold break-words">
                {email || <span className="text-ink/35">Not given</span>}
              </dd>
            </div>

            <div>
              <dt className="text-[13px] font-bold text-ink/45">Paid with</dt>
              <dd className="mt-1 text-[15px] font-bold">
                {method ?? <span className="text-ink/35">Not recorded</span>}
              </dd>
            </div>

            <div>
              <dt className="text-[13px] font-bold text-ink/45">Shipping address</dt>
              <dd className="mt-1 text-[15px] font-bold not-italic">
                {name ? <span className="block">{name}</span> : null}
                {address.length ? (
                  <span className="block text-ink/65">{address.join(", ")}</span>
                ) : (
                  <span className="text-ink/35">Not given</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[13px] font-bold text-ink/45">Shipping method</dt>
              <dd className="mt-1 text-[15px] font-bold">
                {chosen ? (
                  `${chosen.name} · ${chosen.detail}`
                ) : (
                  <span className="text-ink/35">Not chosen</span>
                )}
              </dd>
            </div>
          </dl>

          {/* What was bought, under the four. A confirmation that never says
              what was ordered is the one page in this flow someone comes back
              to looking for exactly that. */}
          <div className="mt-6 border-t border-ink/10 pt-5">
            <dt className="text-[13px] font-bold text-ink/45">Order</dt>
            <dd className="mt-1.5 text-[15px] font-bold">
              {order.lines.map((line) => (
                <span key={line.slug} className="block">
                  {line.name} <span className="text-ink/45">× {line.quantity}</span>
                </span>
              ))}
              <span className="text-display mt-2 block text-[22px] tabular-nums">
                {formatUSD(fromCents(order.total))}
              </span>
            </dd>
          </div>
        </div>

        <Link
          href="/products"
          className="rounded-squish mt-8 inline-flex items-center gap-3 bg-brown px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.98]"
        >
          Continue shopping
          <ArrowRight className="size-5" strokeWidth={3} />
        </Link>
        </div>
      </div>
    );
  }

  /**
   * A checkout with nothing in it.
   *
   * Reachable two ways: /checkout opened directly with an empty cart, and a Buy
   * Now whose slug no longer names a product. Both get the same page, and
   * neither gets the form — a shipping address collected against no order is a
   * form that cannot be submitted, three steps before anything says so.
   *
   * `ready` separates "empty" from "not read yet". Rendering the empty state
   * while the cart is still being read tells someone with three things in it
   * that they have none, which is the one message here they might act on.
   */
  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-white px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[620px]">
          {ready ? (
            <>
              <h1 className="text-display text-[9vw] leading-[0.95] sm:text-[5vw] lg:text-[2.8vw]">
                There is nothing to check out.
              </h1>
              <p className="mt-4 text-[17px] leading-relaxed font-medium text-ink/65">
                Your cart is empty. Pick something to squeeze first.
              </p>
              <Link
                href="/products"
                className="rounded-squish mt-8 inline-flex items-center gap-3 bg-ink px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.98]"
              >
                Shop all products
                <ArrowRight className="size-5" strokeWidth={3} />
              </Link>
            </>
          ) : (
            <p className="text-[17px] font-semibold text-ink/45">
              Loading your cart…
            </p>
          )}
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
        <header>{backLink}</header>

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
           * The three wallets, drawn from the artwork each brand supplies, and
           * live once the form below them is filled. They are gated on exactly
           * the same condition as Continue to shipping, because a wallet cannot
           * skip collecting an address it was never given — the sheet has to be
           * able to show where the order is going, and this screen is the only
           * thing that knows.
           *
           * Dull before that, with the reason said once underneath rather than
           * three times inside the buttons.
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
                    onClick={() => setSheet(wallet)}
                    aria-describedby="express-hint"
                    aria-label={`Pay with ${wallet.name}`}
                    className={`flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl transition hover:brightness-110 active:scale-[0.98] ${
                      wallet.border ? "border border-ink/15" : ""
                    }`}
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

            <p
              id="express-hint"
              className="mt-3 text-center text-[13px] font-semibold text-ink/45"
            >
              Pay in one step — no card details needed.
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

            <Select
              id="country"
              label="Country / Region"
              options={COUNTRIES}
              autoComplete="country-name"
              className="mt-4"
              value={field("country")}
              onChange={set("country")}
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field id="given-name" label="First name" autoComplete="given-name" value={field("given-name")} onChange={set("given-name")} />
              <Field id="family-name" label="Last name" autoComplete="family-name" value={field("family-name")} onChange={set("family-name")} />
              <Field id="organization" label="Company (optional)" autoComplete="organization" className="sm:col-span-2" value={field("organization")} onChange={set("organization")} />
              <Field id="address-line1" label="Address" autoComplete="address-line1" className="sm:col-span-2" value={field("address-line1")} onChange={set("address-line1")} />
              <Field id="address-line2" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" className="sm:col-span-2" value={field("address-line2")} onChange={set("address-line2")} />
              <Field id="address-level2" label="City" autoComplete="address-level2" value={field("address-level2")} onChange={set("address-level2")} />
              {/* A list where there is one to offer, and a free field where
                  there is not. Every country's second-level division has a
                  different name and a different set, and a US state list under a
                  Canadian address is worse than no list at all. */}
              {field("country") === "United States" ? (
                <div>
                  <label htmlFor="address-level1" className="sr-only">
                    State
                  </label>
                  <select
                    id="address-level1"
                    name="address-level1"
                    autoComplete="address-level1"
                    value={field("address-level1")}
                    onChange={(e) => set("address-level1")(e.target.value)}
                    className={`${FIELD} appearance-none pr-8 ${
                      field("address-level1") ? "" : "text-ink/35"
                    }`}
                  >
                    <option value="">State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state} className="text-ink">
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Field id="address-level1" label="State / Province" autoComplete="address-level1" value={field("address-level1")} onChange={set("address-level1")} />
              )}
              <Field id="postal-code" label="ZIP code" autoComplete="postal-code" value={field("postal-code")} onChange={set("postal-code")} />
              <Field id="tel" label="Phone" type="tel" autoComplete="tel" className="sm:col-span-2" value={field("tel")} onChange={set("tel")} />
            </div>

            {/* Checked or not, it does nothing yet: there is nowhere to save an
                address to until accounts hold one. It is here because the step
                it belongs to is being built now, and adding the box later means
                re-testing this form for the sake of one checkbox. */}
            <label className="mt-3 flex items-center gap-3 text-[14px] font-semibold text-ink/65">
              <input
                type="checkbox"
                name="save-address"
                className="size-4 rounded border-ink/25 accent-brown"
              />
              Save this information for next time
            </label>
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
          {review([
            { label: "Contact", value: field("email"), to: "Information" },
            { label: "Ship to", value: shipLine, to: "Information" },
          ])}

          <section aria-labelledby="delivery" className="mt-8">
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
         * Two ways to pay: a card, or Shop Pay — which hands off to the same
         * sheet the express buttons at the top of the first step open, so the
         * one wallet that appears in both places behaves the same in both.
         *
         * About the card fields. Nothing here reaches a payment network, and a
         * card number typed into a page that cannot process it is the one thing
         * on this flow that could cost somebody something. So the number arrives
         * already filled with the test card every payment provider publishes for
         * exactly this, it is held in component state and written nowhere else —
         * not to storage, not to the order, not to a log — and the confirmation
         * prints the last four only.
         *
         * Placing the order draws a reference and shows the confirmation. It
         * does not charge, write an order or send an email, because none of
         * those exist yet; what it does is complete the walk-through.
         */
        <div className="mt-8">
          {review([
            { label: "Contact", value: field("email"), to: "Information" },
            { label: "Ship to", value: shipLine, to: "Information" },
            {
              label: "Method",
              value: chosenDelivery
                ? `${chosenDelivery.name} · ${chosenDelivery.price}`
                : "",
              to: "Shipping",
            },
          ])}

          <section aria-labelledby="pay" className="mt-8">
            <h2 id="pay" className="text-[19px] font-extrabold tracking-tight">
              Payment
            </h2>

            <div className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/15">
              <div>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                  <input
                    type="radio"
                    name="pay-with"
                    checked={payWith === "card"}
                    onChange={() => setPayWith("card")}
                    className="size-4 accent-brown"
                  />
                  <span className="flex-1 text-[15px] font-extrabold">
                    Credit card
                  </span>
                  <span className="flex gap-1.5">
                    {["VISA", "MC", "AMEX"].map((brand) => (
                      <span
                        key={brand}
                        className="rounded bg-ink/[0.06] px-2 py-1 text-[10px] font-extrabold tracking-wider text-ink/55"
                      >
                        {brand}
                      </span>
                    ))}
                  </span>
                </label>

                {payWith === "card" ? (
                  <div className="space-y-3 border-t border-ink/10 px-4 py-4">
                    <div className="relative">
                      <label htmlFor="card-number" className="sr-only">
                        Card number
                      </label>
                      <input
                        id="card-number"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={19}
                        value={card.number}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, number: groupDigits(e.target.value) }))
                        }
                        placeholder="Card number"
                        className={`${FIELD} pr-11 tabular-nums`}
                      />
                      <Lock
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink/30"
                        strokeWidth={2.5}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="card-expiry" className="sr-only">
                          Expiry date
                        </label>
                        <input
                          id="card-expiry"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={5}
                          value={card.expiry}
                          onChange={(e) =>
                            setCard((c) => ({ ...c, expiry: expiryMask(e.target.value) }))
                          }
                          placeholder="MM/YY"
                          className={`${FIELD} tabular-nums`}
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvc" className="sr-only">
                          Security code
                        </label>
                        <input
                          id="card-cvc"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={4}
                          value={card.cvc}
                          onChange={(e) =>
                            setCard((c) => ({
                              ...c,
                              cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                            }))
                          }
                          placeholder="CVC"
                          className={`${FIELD} tabular-nums`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="card-name" className="sr-only">
                        Name on card
                      </label>
                      <input
                        id="card-name"
                        autoComplete="off"
                        value={card.name}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Name on card"
                        className={FIELD}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                <input
                  type="radio"
                  name="pay-with"
                  checked={payWith === "shoppay"}
                  onChange={() => setPayWith("shoppay")}
                  className="size-4 accent-brown"
                />
                <span className="text-[15px] font-extrabold">Shop Pay</span>
                <span className="rounded-full bg-[#4221ac]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#4221ac]">
                  Installments or 1-click
                </span>
              </label>
            </div>
          </section>

          <section aria-labelledby="billing" className="mt-8">
            <h2 id="billing" className="text-[19px] font-extrabold tracking-tight">
              Billing address
            </h2>

            <div className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/15">
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                <input
                  type="radio"
                  name="billing"
                  checked={sameBilling}
                  onChange={() => setSameBilling(true)}
                  className="size-4 accent-brown"
                />
                <span className="text-[15px] font-extrabold">
                  Same as shipping address
                </span>
              </label>

              <div>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                  <input
                    type="radio"
                    name="billing"
                    checked={!sameBilling}
                    onChange={() => setSameBilling(false)}
                    className="size-4 accent-brown"
                  />
                  <span className="text-[15px] font-extrabold">
                    Use a different billing address
                  </span>
                </label>

                {/* Revealed, not linked to another step: choosing this and being
                    shown nothing is a dead end, and the four lines a card needs
                    are fewer than the shipping form asks for. */}
                {!sameBilling ? (
                  <div className="grid gap-3 border-t border-ink/10 px-4 py-4 sm:grid-cols-2">
                    <Field id="billing-address" label="Address" className="sm:col-span-2" value={field("billing-address")} onChange={set("billing-address")} />
                    <Field id="billing-city" label="City" value={field("billing-city")} onChange={set("billing-city")} />
                    <Field id="billing-state" label="State" value={field("billing-state")} onChange={set("billing-state")} />
                    <Field id="billing-zip" label="ZIP code" className="sm:col-span-2" value={field("billing-zip")} onChange={set("billing-zip")} />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (!canPay || paying || lines.length === 0) return;
                if (payWith === "shoppay") {
                  // The same sheet the express buttons open. Shop Pay is one
                  // wallet whether it is picked at the top of the flow or the
                  // bottom, so it gets one behaviour — its own wait included.
                  setSheet(WALLETS[0]);
                  return;
                }
                // The card takes the same pause the wallet does, for the same
                // reason: a card that confirms on the same frame as the click
                // is the one part of this flow that stops reading as a payment.
                const digits = card.number.replace(/\D/g, "").slice(-4);
                setPaying(true);
                payTimer.current = setTimeout(() => {
                  setPaying(false);
                  place(`Card ···· ${digits}`, lines, total);
                }, 1800);
              }}
              disabled={!canPay || paying}
              aria-disabled={!canPay || paying}
              className={`rounded-squish inline-flex items-center gap-3 px-8 py-4.5 text-[17px] font-extrabold transition ${
                canPay && !paying
                  ? "bg-blue text-white hover:brightness-110 active:scale-[0.98]"
                  : "cursor-not-allowed bg-ink/10 text-ink/35"
              }`}
            >
              <Lock className="size-[18px]" strokeWidth={3} />
              {paying ? "Paying…" : "Pay now"}
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
            href={back.href}
            className="inline-flex items-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={3} />
            Return to {back.label}
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

          {/* Every line, not one: this panel is now fed by a cart as often as
              by a Buy Now. */}
          <ul className="space-y-5">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="relative size-16 overflow-hidden rounded-xl border border-ink/10 bg-white">
                    {line.image ? (
                      <Image
                        src={line.image.src}
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
                    {line.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold">{line.name}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink/45">
                    {line.detail}
                  </p>
                </div>

                <p className="text-[15px] font-extrabold tabular-nums">
                  {formatUSD(fromCents(line.total))}
                </p>
              </li>
            ))}
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
              <dd className="font-extrabold tabular-nums">
                {formatUSD(fromCents(subtotal))}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-semibold text-ink/60">Shipping</dt>
              <dd className="font-semibold text-ink/45">
                {chosenDelivery ? chosenDelivery.price : "Calculated at next step"}
              </dd>
            </div>
          </dl>

          {/**
           * Total, including delivery once one is chosen.
           *
           * It used to print the subtotal under a heading that said Total, which
           * was right only while every delivery option was free — choosing
           * Express added six dollars to the order and nothing on the page.
           */}
          <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-6">
            <p className="text-[17px] font-extrabold">Total</p>
            <p className="text-display text-[28px] tabular-nums">
              <span className="mr-1.5 align-middle text-[13px] font-bold text-ink/45">
                USD
              </span>
              {formatUSD(fromCents(total))}
            </p>
          </div>
        </div>
      </aside>

      {/**
       * The wallet sheet, last in the tree and fixed over everything.
       *
       * It is handed the contact and address already typed into the form rather
       * than a stand-in profile: this is the visitor's own order, and a sheet
       * that quotes somebody else's name is the first thing they would notice.
       *
       * Paying from here settles the delivery the wallet would have chosen —
       * standard, free — so the confirmation has a delivery line like every
       * other order and the total on the sheet is the total that was placed.
       */}
      {/**
       * The card's wait, over the whole screen.
       *
       * The wallet shows this inside its own sheet; the card has no sheet, so it
       * gets one for the length of the pause. Covering everything is the point —
       * it takes the form out of reach while the payment is supposedly in flight,
       * the same as the wallet does.
       */}
      {paying ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-[400px] rounded-3xl bg-white shadow-2xl">
            <Finalizing />
          </div>
        </div>
      ) : null}

      {sheet ? (
        <WalletSheet
          wallet={sheet}
          name={
            session?.user?.name ||
            [field("given-name"), field("family-name")].filter(Boolean).join(" ")
          }
          email={session?.user?.email || field("email")}
          address={[
            field("address-line1"),
            field("address-level2"),
            field("address-level1"),
            field("postal-code"),
          ]
            .filter(Boolean)
            .join(", ")}
          total={subtotal}
          onCancel={() => setSheet(null)}
          onPaid={() => {
            setSheet(null);
            setDelivery("standard");
            place(`${sheet.name} · ${sheet.instrument}`, lines, subtotal);
          }}
        />
      ) : null}
    </div>
  );
}
