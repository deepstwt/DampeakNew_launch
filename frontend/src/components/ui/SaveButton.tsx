"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { isSavedAction, toggleSavedAction } from "@/app/actions/saved";
import { authClient, signInWithGoogle } from "@/lib/auth-client";

/**
 * Save toggle.
 *
 * Optimistic: the heart fills on click and rolls back if the write fails.
 * Waiting on a round trip to acknowledge a two-state toggle makes the whole page
 * feel broken on a slow connection.
 *
 * A signed-out visitor gets sent to Google rather than a "please sign in" error —
 * the action already told us which case this is, so there is no reason to make
 * them press twice.
 */
export function SaveButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * Signed-out is derived, not stored. Resetting `saved` to false inside the
   * effect would be a synchronous setState during render-commit, which cascades an
   * extra render for every product on screen; deriving costs nothing.
   */
  const isSaved = signedIn && saved;

  /**
   * Resolved here rather than passed in from the page. A server-rendered initial
   * value would force the product page to read the session, and with it lose
   * static generation. Signed-out visitors make no request at all.
   */
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    isSavedAction(slug).then((v) => {
      if (active) setSaved(v);
    });
    return () => {
      active = false;
    };
  }, [signedIn, slug]);

  const onClick = () => {
    const next = !isSaved;
    setSaved(next);
    setError(null);

    startTransition(async () => {
      const result = await toggleSavedAction(slug);

      if (result.ok) {
        setSaved(result.saved);
        return;
      }

      setSaved(!next); // roll back
      if (result.reason === "signed-out") {
        await signInWithGoogle(window.location.pathname);
        return;
      }
      setError(result.message);
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Saved. Press to remove" : "Save this product"}
        className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-[15px] font-extrabold transition hover:border-ink/40 disabled:opacity-60"
      >
        <Heart
          className={`size-[18px] ${isSaved ? "fill-orange text-orange" : "text-ink/50"}`}
          strokeWidth={2.6}
        />
        {isSaved ? "Saved" : "Save"}
      </button>
      {error ? (
        <p role="status" className="mt-2 text-[13px] font-semibold text-orange">
          {error}
        </p>
      ) : null}
    </div>
  );
}
