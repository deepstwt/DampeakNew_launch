"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithGoogle, tryOneTap } from "@/lib/auth-client";

/**
 * The sign-in gate.
 *
 * Built on the native <dialog>, which brings the awkward parts for free: focus is
 * trapped inside it, Escape closes it, and the rest of the page is marked inert
 * for assistive tech. Hand-rolling that with a div is where accessible modals
 * usually go wrong.
 *
 * showModal() has to be called imperatively — a <dialog> with the `open`
 * attribute set in markup renders non-modally, without the backdrop or the focus
 * trap, which looks identical until you try to tab out of it.
 */
export function SignInDialog({
  open,
  onClose,
  /** Where Google returns the visitor to. Defaults to the current page. */
  callbackURL,
  title = "Sign in to continue",
  body = "We keep it to one tap. Sign in and we'll take you straight to the listing.",
}: {
  open: boolean;
  onClose: () => void;
  callbackURL?: string;
  title?: string;
  body?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  /**
   * Sign in, fastest path first.
   *
   * One Tap is attempted on the click rather than when the dialog opens. Firing it
   * speculatively was the cause of two console errors: FedCM rejects with
   * NetworkError when the browser has no Google session to offer, and React's dev
   * StrictMode double-invokes effects, so the second call aborted the first with
   * AbortError. Neither broke sign-in, but both were noise from asking a question
   * nobody had prompted.
   *
   * Driven by a real gesture, FedCM has a session to work with and is far more
   * likely to return a token. If it still cannot — no Google session, an in-app
   * browser, third-party sign-in switched off — we fall straight through to the
   * redirect, which always works. The visitor sees one click either way.
   */
  const start = async () => {
    if (busy) return; // a second click must not start a second FedCM request
    setBusy(true);

    const target = callbackURL ?? window.location.pathname;
    const instant = await tryOneTap({ callbackURL: target });
    if (instant) return; // signed in without leaving the page

    await signInWithGoogle(target);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);


  return (
    <dialog
      ref={ref}
      // The dialog's own close (Escape, or the backdrop) has to tell the parent,
      // or `open` stays true and it can never be reopened.
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop lands on the dialog element itself, never on a
        // child — that is what distinguishes outside from inside.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="signin-title"
      // m-auto is load-bearing: a native <dialog> centres itself with the UA's
      // `margin: auto`, and Tailwind's preflight resets margin to 0 on every
      // element — which silently pins the dialog to the top-left corner.
      className="m-auto rounded-3xl border border-ink/10 bg-white p-0 shadow-[0_24px_80px_rgba(11,11,15,0.28)] backdrop:bg-ink/45 backdrop:backdrop-blur-sm"
    >
      <div className="w-[min(92vw,26rem)] p-8">
        <h2 id="signin-title" className="text-display text-[28px] leading-tight">
          {title}
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed font-medium text-ink/60">
          {body}
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => void start()}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-[16px] font-extrabold text-white transition hover:brightness-125 disabled:opacity-70"
        >
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.3 3.8l-.1.1 3.4 2.6.2.1c2.1-2 3.8-4.9 3.8-8.5Z" />
            <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.6-2.8c-1 .7-2.3 1.2-4 1.2-3 0-5.6-2-6.5-4.8l-.2.1-3.4 2.7-.1.2C3.7 21.3 7.6 24 12 24Z" />
            <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3V10L2 7.3l-.1.1A12 12 0 0 0 .6 12.5c0 1.9.5 3.7 1.3 5.2l3.6-2.9Z" />
            <path fill="#EA4335" d="M12 4.7c2.1 0 3.6.9 4.4 1.7l3.2-3.1C17.7 1.4 15.1.3 12 .3 7.6.3 3.7 3 1.9 6.9l3.6 2.8C6.4 6.8 9 4.7 12 4.7Z" />
          </svg>
          {busy ? "Signing you in…" : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full px-6 py-3 text-[14px] font-bold text-ink/45 transition-colors hover:text-ink"
        >
          Not now
        </button>
      </div>
    </dialog>
  );
}
