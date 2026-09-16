"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { PRODUCTS, getProduct, primaryImage } from "@/content/site";
import { priceOf, cents, fromCents } from "@/lib/money";
import { clampQuantity } from "@/lib/quantity";

/**
 * The cart.
 *
 * It holds slugs and counts, nothing else. Names, prices and photographs are
 * resolved from the catalogue on every read, so a cart left in a browser for a
 * month cannot show last month's price or a product we no longer sell — and
 * there is no second copy of the catalogue to keep in step with site.ts.
 *
 * It lives in localStorage rather than on the server on purpose: a cart is not
 * yet an order, this site has no cart table behind it, and a signed-out visitor
 * is the common case. The day there is a server cart, this file is what changes
 * — everything else talks to `useCart`.
 *
 * The store itself is a module-level object with subscribers, read through
 * useSyncExternalStore. localStorage is an external system that React does not
 * own: reading it in an effect and calling setState would render once with an
 * empty cart and again with the real one, for every consumer, on every mount.
 * This way the server and the first client render agree by construction, and
 * the read happens once for the whole page when the first subscriber arrives.
 *
 * Quantities are clamped to the same 1–10 everything else uses — see
 * lib/quantity.ts, which owns those limits because the checkout page is a
 * server component and cannot import a constant from this file.
 */

/** Bumped if the stored shape ever changes, so old carts are ignored, not crashed on. */
const STORAGE_KEY = "dampeak.cart.v1";

export type CartLine = { slug: string; quantity: number };

/** A line with the catalogue joined back on, which is what a screen wants. */
export type ResolvedLine = {
  slug: string;
  name: string;
  detail: string;
  image: { src: string; alt: string } | null;
  quantity: number;
  /** Unit and line totals in cents — display formatting is the screen's job. */
  unit: number;
  total: number;
};

/* ── The store ───────────────────────────────────────────────────────────── */

type State = {
  lines: CartLine[];
  /**
   * False until localStorage has been read.
   *
   * The server renders an empty cart because it cannot see one, so the first
   * client render has to match it. Anything that would otherwise flash "your
   * cart is empty" at someone who has three things in it waits on this.
   */
  ready: boolean;
};

/**
 * One frozen empty state, reused.
 *
 * useSyncExternalStore compares snapshots by identity and re-renders whenever
 * they differ, so a getSnapshot that built a fresh object each call would loop
 * forever. Every state here is created once, when something actually changes.
 */
const EMPTY: State = { lines: [], ready: false };

let state: State = EMPTY;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

const clamp = clampQuantity;

/**
 * Whatever was in storage, turned into lines we are willing to act on.
 *
 * Treated as hostile input even though we wrote it: it is editable by anyone
 * with the browser's console open, it survives a deploy that removed a product,
 * and it survives a schema change we forgot to version.
 */
function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const lines: CartLine[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const { slug, quantity } = entry as Partial<CartLine>;
      if (typeof slug !== "string" || !getProduct(slug)) continue;
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;
      // A slug repeated in storage collapses into one line rather than two.
      if (lines.some((line) => line.slug === slug)) continue;
      lines.push({ slug, quantity: clamp(quantity) });
    }
    return lines;
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing, or a full quota. The cart still works for this visit;
    // it just will not be there on the next one, which beats throwing here.
  }
}

/** A change made here: state first, then storage, then everyone watching. */
function commit(lines: CartLine[]) {
  state = { lines, ready: true };
  persist(lines);
  emit();
}

/** A change made elsewhere (another tab): adopt it, do not write it back. */
function adopt(lines: CartLine[]) {
  state = { lines, ready: true };
  emit();
}

/**
 * Two tabs, one cart.
 *
 * `storage` fires in every other tab of this origin when one of them writes.
 * Without it, adding something in one tab and checking out in another buys
 * whatever the second tab happened to load with.
 */
const onStorage = (e: StorageEvent) => {
  if (e.key !== STORAGE_KEY) return;
  adopt(parse(e.newValue));
};

function subscribe(listener: () => void) {
  const first = listeners.size === 0;
  listeners.add(listener);

  if (first) {
    window.addEventListener("storage", onStorage);
    // The one read of localStorage, on the first subscriber. Everything after
    // this is driven by our own writes or by another tab's.
    if (!state.ready) adopt(parse(window.localStorage.getItem(STORAGE_KEY)));
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => state;

/** The server has no cart, and says so rather than guessing at an empty one. */
const getServerSnapshot = () => EMPTY;

/* ── Operations ──────────────────────────────────────────────────────────── */

export function addToCart(slug: string, quantity = 1) {
  if (!getProduct(slug)) return;
  const existing = state.lines.find((line) => line.slug === slug);

  commit(
    existing
      ? // Adding to something already in the cart tops it up rather than
        // replacing it, and stops at the ceiling instead of refusing.
        state.lines.map((line) =>
          line.slug === slug
            ? { ...line, quantity: clamp(line.quantity + quantity) }
            : line,
        )
      : [...state.lines, { slug, quantity: clamp(quantity) }],
  );
}

export function setCartQuantity(slug: string, quantity: number) {
  commit(
    state.lines.map((line) =>
      line.slug === slug ? { ...line, quantity: clamp(quantity) } : line,
    ),
  );
}

export function removeFromCart(slug: string) {
  commit(state.lines.filter((line) => line.slug !== slug));
}

export function clearCart() {
  commit([]);
}

/* ── The hook ────────────────────────────────────────────────────────────── */

type CartValue = {
  lines: CartLine[];
  /** Resolved against the catalogue, unknown slugs dropped. */
  items: ResolvedLine[];
  /** Total number of things in the cart, for the header badge. */
  count: number;
  /** Sum of the lines, in dollars. */
  subtotal: number;
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { lines, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /**
   * Resolved once per change, for the whole page.
   *
   * The context is what makes that true: the header, the cart page and the
   * checkout all read the same joined lines rather than each running the join
   * against the catalogue themselves.
   */
  const value = useMemo<CartValue>(() => {
    const items = resolve(lines);
    return {
      lines,
      items,
      count: lines.reduce((n, line) => n + line.quantity, 0),
      subtotal: fromCents(items.reduce((sum, item) => sum + item.total, 0)),
      ready,
      // The operations are module-level and never change identity, so they are
      // not dependencies and do not need wrapping — the store they write to is
      // outside React, which is the whole point of it living there.
      add: addToCart,
      setQuantity: setCartQuantity,
      remove: removeFromCart,
      clear: clearCart,
    };
  }, [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return value;
}

/**
 * Lines joined to the catalogue.
 *
 * Exported because the checkout needs the same join for a Buy Now, which never
 * touches the cart and so cannot go through the provider to get it.
 */
export function resolve(lines: readonly CartLine[]): ResolvedLine[] {
  const items: ResolvedLine[] = [];

  for (const line of lines) {
    const product = getProduct(line.slug);
    if (!product) continue;

    const image = primaryImage(product);
    const unit = cents(priceOf(product));

    items.push({
      slug: product.slug,
      name: product.name,
      detail: `${product.specs.colour} · ${product.specs.finish}`,
      image: image ? { src: image.src, alt: image.alt } : null,
      quantity: line.quantity,
      unit,
      total: unit * line.quantity,
    });
  }

  // Catalogue order, not the order things were added: a cart that reshuffles
  // itself as you change a quantity is a cart you have to re-read every time.
  return items.sort(
    (a, b) =>
      PRODUCTS.findIndex((p) => p.slug === a.slug) -
      PRODUCTS.findIndex((p) => p.slug === b.slug),
  );
}
