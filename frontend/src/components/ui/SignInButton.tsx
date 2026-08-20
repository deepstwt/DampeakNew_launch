"use client";

import { useTransition } from "react";
import { signInWithGoogle } from "@/lib/auth-client";

/** Starts the Google redirect. Disabled while the redirect is in flight so a
 *  double-click cannot open two OAuth flows. */
export function SignInButton({
  callbackURL = "/account",
  className = "",
}: {
  callbackURL?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await signInWithGoogle(callbackURL); })}
      className={`inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[16px] font-extrabold text-white transition hover:brightness-125 disabled:opacity-60 ${className}`}
    >
      {/* Google's mark, so the button is recognisable rather than just labelled. */}
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.3 3.8l-.1.1 3.4 2.6.2.1c2.1-2 3.8-4.9 3.8-8.5Z" />
        <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.6-2.8c-1 .7-2.3 1.2-4 1.2-3 0-5.6-2-6.5-4.8l-.2.1-3.4 2.7-.1.2C3.7 21.3 7.6 24 12 24Z" />
        <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3V10L2 7.3l-.1.1A12 12 0 0 0 .6 12.5c0 1.9.5 3.7 1.3 5.2l3.6-2.9Z" />
        <path fill="#EA4335" d="M12 4.7c2.1 0 3.6.9 4.4 1.7l3.2-3.1C17.7 1.4 15.1.3 12 .3 7.6.3 3.7 3 1.9 6.9l3.6 2.8C6.4 6.8 9 4.7 12 4.7Z" />
      </svg>
      Continue with Google
    </button>
  );
}
