"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/quantity";
import { formatUSD, fromCents } from "@/lib/money";

/**
 * The cart.
 *
 * Client all the way down: what is in it lives in the browser, so there is
 * nothing for a server to render here but the furniture. Three states, and each
 * one has to be its own — loading, empty, and full — because an empty cart and a
 * cart that has not been read yet look identical and mean opposite things.
 *
 * Shipping is not shown here. It depends on a delivery method chosen at the
 * checkout, and a cart that quotes a total it cannot stand behind is worse than
 * one that says where the total gets settled.
 */

export function CartScreen() {
  const { items, count, subtotal, ready, setQuantity, remove } = useCart();

  const stepper =
    "inline-flex size-9 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:text-ink/20 enabled:hover:bg-ink/5";

  if (!ready) {
    /**
     * The gap before storage has been read.
     *
     * Deliberately not a spinner and not the empty state: it is one frame on a
     * fast machine, and "Your cart is empty" flashed at someone who has three
     * things in it is a lie they will act on.
     */
    return (
      <p className="mt-10 text-[17px] font-semibold text-ink/45">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-[19px] leading-relaxed font-medium text-ink/65">
          Your cart is empty.
        </p>
        <Link
          href="/products"
          className="rounded-squish mt-6 inline-flex items-center gap-3 bg-ink px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.98]"
        >
          Shop all products
          <ArrowRight className="size-5" strokeWidth={3} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item) => (
          <li key={item.slug} className="flex flex-wrap items-center gap-5 py-6">
            <Link
              href={`/products/${item.slug}`}
              tabIndex={-1}
              aria-hidden
              className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white"
            >
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              ) : null}
            </Link>

            <div className="min-w-[10rem] flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="text-[17px] font-extrabold transition-colors hover:text-brown"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-[14px] font-semibold text-ink/45">
                {item.detail}
              </p>
              <p className="mt-1 text-[14px] font-bold text-ink/65">
                {formatUSD(fromCents(item.unit))} each
              </p>
            </div>

            <div
              role="group"
              aria-label={`Quantity, ${item.name}`}
              className="inline-flex items-center rounded-full border border-ink/15 p-1"
            >
              <button
                type="button"
                onClick={() => setQuantity(item.slug, item.quantity - 1)}
                disabled={item.quantity <= MIN_QUANTITY}
                aria-label={`One fewer ${item.name}`}
                className={stepper}
              >
                <Minus className="size-4" strokeWidth={3} />
              </button>
              <span
                aria-live="polite"
                className="w-10 text-center text-[16px] font-extrabold tabular-nums"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.slug, item.quantity + 1)}
                disabled={item.quantity >= MAX_QUANTITY}
                aria-label={`One more ${item.name}`}
                className={stepper}
              >
                <Plus className="size-4" strokeWidth={3} />
              </button>
            </div>

            <p className="w-20 text-right text-[17px] font-extrabold tabular-nums">
              {formatUSD(fromCents(item.total))}
            </p>

            <button
              type="button"
              onClick={() => remove(item.slug)}
              aria-label={`Remove ${item.name}`}
              className="inline-flex size-9 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            >
              <X className="size-[18px]" strokeWidth={3} />
            </button>
          </li>
        ))}
      </ul>

      <aside aria-label="Cart summary" className="lg:pt-6">
        <dl className="space-y-3 text-[15px]">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-ink/60">
              Subtotal · {count} {count === 1 ? "item" : "items"}
            </dt>
            <dd className="font-extrabold tabular-nums">{formatUSD(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-ink/60">Shipping</dt>
            <dd className="font-semibold text-ink/45">
              Chosen at checkout
            </dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="rounded-squish mt-8 flex w-full items-center justify-center gap-3 bg-blue px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Checkout
          <ArrowRight className="size-5" strokeWidth={3} />
        </Link>

        <Link
          href="/products"
          className="mt-4 flex items-center justify-center gap-2 text-[15px] font-bold text-ink/55 transition-colors hover:text-ink"
        >
          <ShoppingBag className="size-4" strokeWidth={2.8} />
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
