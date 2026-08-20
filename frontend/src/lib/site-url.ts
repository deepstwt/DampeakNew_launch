/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deploy environment —
 * canonical tags, sitemap entries and OG image URLs all resolve against it,
 * and a wrong value here quietly breaks all three.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
