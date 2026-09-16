/**
 * How many of one thing an order may contain.
 *
 * Its own module, and deliberately not part of lib/cart.tsx, which is a "use
 * client" file. A constant exported from a client module and imported by a
 * server component does not arrive as a number: the bundler replaces the whole
 * module with client references, so `Math.min(MAX_QUANTITY, n)` on the server
 * quietly evaluates to NaN and the checkout renders "$NaN". Values shared across
 * the boundary have to live somewhere that is neither.
 *
 * Ten is where an order stops being a gift or a party bag and starts being
 * wholesale, which is a conversation rather than a checkout — and there is no
 * stock count behind these pages to check a larger number against.
 */

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;

/**
 * Any number, as a quantity we are willing to act on.
 *
 * Used on both sides: the product stepper and the cart clamp what they store,
 * and the checkout clamps what arrives in the URL, where "0", "-3", "abc" and
 * "1e9" are all things a visitor can type into the address bar.
 */
export const clampQuantity = (n: number) =>
  Number.isFinite(n)
    ? Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.floor(n)))
    : MIN_QUANTITY;
