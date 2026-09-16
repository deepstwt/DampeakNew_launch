"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { MAX_QUANTITY, MIN_QUANTITY, clampQuantity } from "@/lib/quantity";

/**
 * How many, then the two ways to buy.
 *
 * The stepper lives with the buttons because both carry the number: Buy Now
 * takes it to the checkout in its href, and Add to cart puts that many in the
 * cart. A stepper that sat apart from them would be a control that changes
 * nothing.
 *
 * Buy Now skips the cart entirely rather than adding to it and sending you on —
 * "buy this one thing now" is the whole promise of the button, and a Buy Now
 * that quietly appends to a cart you had forgotten about charges you for four
 * things when you asked for one.
 *
 * Ten is the ceiling, and it is the cart's ceiling too — see MAX_QUANTITY.
 */

export function BuyPanel({ slug }: { slug: string }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = (by: number) => setQuantity((n) => clampQuantity(n + by));

  /**
   * The confirmation clears itself after a few seconds.
   *
   * Cleared on unmount too: navigating away while it is up would otherwise leave
   * a timer holding a setState on a component that no longer exists.
   */
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onAdd = () => {
    add(slug, quantity);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 6000);
  };

  /** One style for both ends of the stepper, so neither reads as the primary. */
  const stepper =
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
          disabled={quantity <= MIN_QUANTITY}
          aria-label="One fewer"
          className={stepper}
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
          disabled={quantity >= MAX_QUANTITY}
          aria-label="One more"
          className={stepper}
        >
          <Plus className="size-4" strokeWidth={3} />
        </button>
      </div>

      {quantity >= MAX_QUANTITY ? (
        <p className="mt-2 text-[13px] font-semibold text-ink/45">
          Ten is the most you can order here.
        </p>
      ) : null}

      {/**
       * Add to cart first, Buy Now second, and only one of them filled.
       *
       * Two solid buttons side by side make the visitor choose between two
       * equally loud instructions. The outlined one is the everyday action and
       * the filled one is the one that leaves the page, which is the order they
       * are read in.
       */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-3 rounded-full border-2 border-ink px-8 py-4 text-[17px] font-extrabold text-ink transition hover:bg-ink hover:text-white active:scale-[0.98]"
        >
          Add to cart
          <ShoppingBag className="size-5" strokeWidth={2.6} />
        </button>

        <Link
          href={`/checkout?product=${slug}&qty=${quantity}`}
          className="inline-flex items-center gap-3 rounded-full bg-blue px-9 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Buy Now
          <ArrowRight className="size-5" strokeWidth={2.6} />
        </Link>
      </div>

      {/**
       * What just happened, and the way to the cart.
       *
       * role="status" so it is announced rather than only seen — the button that
       * caused it does not change, so without this a screen-reader user presses
       * Add to cart and is told nothing at all.
       */}
      {added ? (
        <p
          role="status"
          className="mt-4 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-bold text-ink/65"
        >
          <Check className="size-[18px] text-brown" strokeWidth={3} />
          Added to your cart.
          <Link
            href="/cart"
            className="font-extrabold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brown"
          >
            View cart
          </Link>
        </p>
      ) : null}
    </div>
  );
}
