"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SignInDialog } from "@/components/ui/SignInDialog";

/**
 * Buy Now — the one place the site asks who you are.
 *
 * Browsing is free: the catalogue, the photos, the specs, every product page. The
 * gate sits here, on the click that leaves for Amazon, because this is the only
 * moment worth interrupting — and because once someone is on Amazon we lose the
 * ability to know they were ever interested.
 *
 * Deliberately NOT on the cards' Buy Now, which only opens the product page. A
 * visitor should be able to read everything about a product before being asked to
 * sign in; gating the way in would be a wall in front of the shop.
 *
 * `isPending` matters more than it looks. The session is fetched client-side, so
 * for the first moment after paint nobody is known to be signed in. Treating that
 * as signed-out would flash the dialog at people who are already signed in.
 */
export function BuyNowButton({
  amazonUrl,
  productName,
}: {
  amazonUrl: string;
  productName: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [askSignIn, setAskSignIn] = useState(false);

  const signedIn = Boolean(session?.user);

  return (
    <>
      {signedIn ? (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buy ${productName} on Amazon — opens in a new tab`}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-yellow px-9 py-4.5 text-[17px] font-extrabold text-ink transition hover:brightness-95 active:scale-[0.98]"
        >
          Buy Now
          <ExternalLink className="size-5" strokeWidth={2.6} />
        </a>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setAskSignIn(true)}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-yellow px-9 py-4.5 text-[17px] font-extrabold text-ink transition hover:brightness-95 active:scale-[0.98] disabled:opacity-70"
        >
          Buy Now
          <ExternalLink className="size-5" strokeWidth={2.6} />
        </button>
      )}

      <p className="mt-4 text-[14px] font-semibold text-ink/40">
        {signedIn
          ? "Opens Amazon in a new tab. Payment, delivery and returns are handled by Amazon."
          : "Sign in to continue to Amazon."}
      </p>

      {/* callbackURL is left unset: the dialog falls back to the current path, so
          Google returns the visitor to this product page and the next tap is the
          real one. */}
      <SignInDialog
        open={askSignIn}
        onClose={() => setAskSignIn(false)}
        body={`Sign in and we'll take you straight to ${productName} on Amazon.`}
      />
    </>
  );
}
