import { getAuth, isAuthConfigured } from "@oscar/backend";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Every auth endpoint — sign-in, callback, session, sign-out — lives under this
 * one catch-all, which is why the Google console redirect URI is
 * /api/auth/callback/google.
 *
 * When auth is unconfigured this answers 503 rather than throwing. A fresh
 * checkout has no Google client, and an unhandled throw in a route handler is a
 * 500 with a stack trace; "not configured" is the honest status.
 */
function unavailable() {
  return Response.json(
    { error: "Authentication is not configured on this deployment." },
    { status: 503 },
  );
}

const handlers = isAuthConfigured
  ? toNextJsHandler(getAuth())
  : { GET: unavailable, POST: unavailable };

export const { GET, POST } = handlers;
