"use client";

import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";

/**
 * Browser-side auth. Talks to /api/auth, so it holds no secrets — the client ID
 * below is public by design and appears in every OAuth URL anyway.
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** One Tap can only run if the client id reached the browser. */
export const hasOneTap = Boolean(GOOGLE_CLIENT_ID);

export const authClient = createAuthClient({
  plugins: [
    /**
     * Registered unconditionally, with an empty id when unconfigured, so that
     * `authClient.oneTap` always exists on the type. Making the plugin array
     * conditional changes the client's inferred type and every call site then has
     * to narrow it. Callers guard on `hasOneTap` instead.
     */
    oneTapClient({
      clientId: GOOGLE_CLIENT_ID ?? "",
      promptOptions: {
        // Google applies its own exponential cool-off after dismissals. One
        // attempt per visit is enough: our own dialog is the fallback, and
        // re-prompting someone who just dismissed it is how One Tap earns its
        // reputation for being annoying.
        maxAttempts: 1,
      },
    }),
  ],
});

/** Full redirect to Google. The fallback when One Tap cannot or does not appear. */
export const signInWithGoogle = (callbackURL = "/account") =>
  authClient.signIn.social({ provider: "google", callbackURL });

/**
 * The instant path: Google hands the page a token and we never leave it.
 *
 * Returns true only if a session actually exists afterwards. `oneTap()` resolving
 * is not proof of that — it settles on several outcomes, and treating resolution
 * as success would leave a visitor looking at a page that thinks they are signed
 * in when they are not.
 *
 * Bounded by a timeout because dismissing the card does not always settle the
 * promise. Without it, a visitor who ignores One Tap waits forever for a button
 * that already said "Signing you in…". The caller falls back to the redirect on
 * false, so the ceiling on being stuck is this timeout — not a dead end.
 */
export const tryOneTap = async ({
  callbackURL,
  timeoutMs = 2500,
}: {
  callbackURL?: string;
  timeoutMs?: number;
}): Promise<boolean> => {
  if (!hasOneTap) return false;

  try {
    const attempt = authClient
      .oneTap({ callbackURL })
      .then(() => true)
      .catch(() => false);

    const settled = await Promise.race([
      attempt,
      new Promise<false>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
    ]);
    if (!settled) return false;

    const session = await authClient.getSession();
    return Boolean(session?.data?.user);
  } catch {
    // FedCM rejects for reasons that are not faults: no Google session to offer,
    // third-party sign-in disabled, an embedded in-app browser. None of them are
    // worth showing anyone — the caller redirects instead.
    return false;
  }
};

export const signOut = () => authClient.signOut();
