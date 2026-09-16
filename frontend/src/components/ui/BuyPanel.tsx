"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";

/**
 * How many, and then Buy Now.
 *
 * The two live in one component because the button has to carry the number: it
 * is a link, and the quantity travels to the checkout in its href. A stepper
 * that only moved a number on screen would be a control that does nothing.
 *
 * Ten is the ceiling. Past that an order stops being a gift or a party bag and
 * starts being wholesale, which is a conversation rather than a checkout — and
 * there is no stock count behind this page to check a larger number against.
 */

const MIN = 1;
const MAX = 10;

export function BuyPanel({ slug }: { slug: string }) {
  const [quantity, setQuantity] = useState(MIN);

  const step = (by: number) =>
    setQuantity((n) => Math.min(MAX, Math.max(MIN, n + by)));

  /** One style for both ends, so neither reads as the primary of the pair. */
  const button =
    "inline-flex size-11 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:text-ink/20 enabled:hover:bg-ink/5";

  return (
    <div className="mt-10">
      <p id="quantity-label" className="text-marker text-ink/45">
        Quantity
      </p>

      {/**
       * A group with its own label, and the number read out as text rather than
       * sitting in an input.
       *
       * `aria-live` is what makes the stepper usable without sight: pressing plus
       * changes a number somewhere on the page, and without this nothing
       * announces that it moved.
       */}
      <div
        role="group"
        aria-labelledby="quantity-label"
        className="mt-3 inline-flex items-center rounded-full border border-ink/15 p-1"
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={quantity <= MIN}
          aria-label="One fewer"
          className={button}
        >
          <Minus className="size-4" strokeWidth={3} />
        </button>

        <span
          aria-live="polite"
          className="w-12 text-center text-[17px] font-extrabold tabular-nums"
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={quantity >= MAX}
          aria-label="One more"
          className={button}
        >
          <Plus className="size-4" strokeWidth={3} />
        </button>
      </div>

      {quantity >= MAX ? (
        <p className="mt-2 text-[13px] font-semibold text-ink/45">
          Ten is the most you can order here.
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          href={`/checkout?product=${slug}&qty=${quantity}`}
          className="inline-flex items-center gap-3 rounded-full bg-blue px-9 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Buy Now
          <ArrowRight className="size-5" strokeWidth={2.6} />
        </Link>
      </div>
    </div>
  );
}
