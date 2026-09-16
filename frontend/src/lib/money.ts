/**
 * Money, in one place.
 *
 * Prices are authored for display ("$14.99") because that is what a page shows,
 * so anything that has to add two of them up has to get a number back out first.
 * That parse was written inline in the checkout and would have been written
 * again in the cart, the product page and the line totals — four copies of one
 * regular expression, each free to disagree about what "$1,499.00" means.
 *
 * The currency is USD everywhere, including in the structured data each product
 * page publishes. Changing the symbol in site.ts without changing it here and
 * there leaves search engines quoting our numbers in the wrong money.
 */

/** The number behind a display price. 0 when a product has no price yet. */
export const priceOf = (product: { price: string | null }) =>
  Number(product.price?.replace(/[^\d.]/g, "") ?? 0);

/**
 * Cents, not dollars, for anything summed.
 *
 * 14.99 is not representable in binary, so three of them are 44.969999999999999
 * and two express deliveries added to them drift further. Rounding to cents at
 * every step keeps the total equal to the sum of the lines as printed — which is
 * the one arithmetic a customer will check by hand.
 */
export const cents = (amount: number) => Math.round(amount * 100);

export const fromCents = (amount: number) => amount / 100;

/** The locale is fixed so the server and the browser format identically. */
export const formatUSD = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
