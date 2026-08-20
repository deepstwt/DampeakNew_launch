import { MongoClient, type Db } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { oneTap } from "better-auth/plugins";

/**
 * Google sign-in, backed by the same MongoDB database as everything else.
 *
 * Two things about the shape of this file.
 *
 * First, it degrades instead of throwing. Auth needs three secrets that are not
 * set in a fresh checkout, and a marketing site that 500s because nobody has
 * created a Google OAuth client yet is worse than one with the sign-in button
 * hidden. `isAuthConfigured` is what the UI checks; `getAuth()` throws only if
 * something calls it anyway.
 *
 * Second, Better Auth needs a `Db` synchronously, while connectToDatabase() in
 * db.ts is async — so this opens its own MongoClient rather than borrowing
 * mongoose's connection. The driver connects lazily on first command, so calling
 * .db() here costs nothing at import time. The client is cached on globalThis for
 * the same reason the mongoose connection is: Fast Refresh and per-invocation
 * serverless would otherwise open a new pool every time, and Atlas runs out of
 * connections long before it runs out of capacity.
 */

const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const AUTH_SECRET = process.env.AUTH_SECRET;

/** Whether sign-in can work at all. The UI hides itself when this is false. */
export const isAuthConfigured = Boolean(
  MONGODB_URI && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && AUTH_SECRET,
);

/** Which addresses may reach the admin area. Everyone else is a customer. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Google sign-in admits anyone with a Google account. Without this check the
 * admin area would be open to the entire internet, so an empty allowlist means
 * nobody is an admin — never everybody.
 */
export const isAdminEmail = (email: string | null | undefined) =>
  Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));

type ClientCache = { client: MongoClient | null; db: Db | null };
const globalForAuth = globalThis as unknown as { _authMongo?: ClientCache };
const cache: ClientCache = (globalForAuth._authMongo ??= { client: null, db: null });

function getAuthDb(): Db {
  if (cache.db) return cache.db;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

  // Deliberately small: this pool serves session reads, not page traffic.
  cache.client ??= new MongoClient(MONGODB_URI, { maxPoolSize: 5 });
  cache.db = cache.client.db();
  return cache.db;
}

/**
 * Split out so `instance` can be typed as this function's return type.
 *
 * betterAuth() is generic over the options object it is handed, so the plain
 * `ReturnType<typeof betterAuth>` is the widened `Auth<BetterAuthOptions>` and
 * does not accept the narrower instance this config produces. Inferring from the
 * factory keeps the precise type, which is what makes `auth.api` typed at the
 * call sites.
 */
function createAuth() {
  return betterAuth({
    database: mongodbAdapter(getAuthDb()),
    // isAuthConfigured has already established these are set.
    secret: AUTH_SECRET!,
    baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
      },
    },
    session: {
      // A shopping site has no reason to log people out weekly.
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    /**
     * Google One Tap. This is what makes signing in feel instant: Google hands the
     * page a signed ID token, which this endpoint verifies — no redirect to
     * accounts.google.com and back, so the visitor never leaves the product page.
     *
     * The redirect flow stays configured above and is still the fallback. One Tap
     * does not appear for everyone: it needs an existing Google session in the
     * browser, it is suppressed after repeated dismissals, and it is blocked in
     * embedded in-app browsers.
     */
    plugins: [oneTap()],
  });
}

let instance: ReturnType<typeof createAuth> | null = null;

/**
 * The auth instance, built on first use rather than at import.
 *
 * Building it eagerly would read the env vars — and open the client — in every
 * process that imports this package, including the ones that only want the
 * subscribe service.
 */
export function getAuth() {
  if (instance) return instance;

  if (!isAuthConfigured) {
    throw new Error(
      "Auth is not configured. Set MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and AUTH_SECRET in .env.local.",
    );
  }

  instance = createAuth();
  return instance;
}
