"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut } from "lucide-react";
import { authClient, signOut } from "@/lib/auth-client";
import { SignInDialog } from "@/components/ui/SignInDialog";

/**
 * Nav account control: a Sign in button, or the visitor's Google avatar with a
 * small menu behind it.
 *
 * While `isPending` is true it renders a neutral placeholder of the same size
 * rather than the signed-out state. The session is fetched in the browser, so
 * showing "Sign in" first would make the header visibly flip to an avatar a moment
 * later on every page load for anyone already signed in — and a placeholder that
 * matches the final size keeps the header from reflowing when it resolves.
 */
export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [askSignIn, setAskSignIn] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click and on Escape — the two ways anyone expects to dismiss
  // a menu like this.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isPending) {
    return <div aria-hidden className="size-10 shrink-0 rounded-full bg-ink/10" />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAskSignIn(true)}
          className="text-[15px] font-semibold text-ink/65 transition-colors hover:text-ink"
        >
          Sign in
        </button>
        <SignInDialog
          open={askSignIn}
          onClose={() => setAskSignIn(false)}
          title="Sign in"
          body="One tap with Google. We use it to keep your saved products."
        />
      </>
    );
  }

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account: ${user.name ?? user.email ?? "signed in"}`}
        className="block size-10 overflow-hidden rounded-full ring-1 ring-ink/15 transition hover:ring-ink/40"
      >
        {user.image ? (
          // A plain <img>: Google's avatar host would have to be allowlisted in
          // next.config for next/image, and a 40px avatar gains nothing from the
          // optimiser. referrerPolicy is what stops Google returning 403 for it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            width={40}
            height={40}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-ink text-[15px] font-extrabold text-white">
            {initial}
          </span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_18px_50px_rgba(11,11,15,0.18)]"
        >
          <div className="border-b border-ink/10 px-4 py-3.5">
            <p className="text-[15px] font-extrabold">{user.name ?? "Signed in"}</p>
            {/* The address is shown on purpose: someone with two Google accounts
                needs to see which one holds their saved list. */}
            <p className="mt-0.5 truncate text-[13px] font-semibold text-ink/45">
              {user.email}
            </p>
          </div>

          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold transition-colors hover:bg-ink/5"
          >
            <Heart className="size-[18px] text-ink/50" strokeWidth={2.4} />
            Saved products
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              // Server components hold the old session, so re-render them.
              router.refresh();
            }}
            className="flex w-full items-center gap-3 border-t border-ink/10 px-4 py-3.5 text-left text-[15px] font-bold transition-colors hover:bg-ink/5"
          >
            <LogOut className="size-[18px] text-ink/50" strokeWidth={2.4} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
