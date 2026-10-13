"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { site } from "@/content/site";
import { BrandRule } from "@/components/ui/BrandRule";
import { UserMenu } from "@/components/ui/UserMenu";
import { useCart } from "@/lib/cart";

/**
 * A conventional site header: wordmark, text links, Saved, one call to action, and
 * a menu button below the medium breakpoint.
 *
 * The links were once four colour pills, one per range. There are no ranges any
 * more — four products, one catalogue — so the spectrum rule above is what states
 * the palette, and the nav reads as navigation rather than a row of buttons.
 */
/**
 * A nav link that reaches its target.
 *
 * Fragment links have to be plain anchors here. next/link navigates with the
 * History API, and `:target` is not re-evaluated on a pushState — the URL bar
 * changes to #focus while the document's target element stays on whatever the
 * last real fragment navigation set, so the Ranges section highlights the wrong
 * card. A bare <a> performs an actual fragment navigation, which both scrolls and
 * updates :target, and within the same document it does not reload.
 *
 * Real routes still go through next/link for the client-side transition.
 */
function NavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const style =
    className ??
    "text-[15px] font-semibold text-white/70 transition-colors hover:text-white";

  if (href.includes("#")) {
    return (
      <a href={href} className={style} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={style} onClick={onClick}>
      {children}
    </Link>
  );
}

/**
 * The way to the cart, and how much is in it.
 *
 * The count is not rendered until the cart has been read from storage: the
 * server has no way to know what is in it, so anything drawn before then is a
 * badge that says 0 and then jumps. `suppressHydrationWarning` is deliberately
 * not used — `ready` is what keeps the two renders identical.
 */
function CartLink() {
  const { count, ready } = useCart();
  const showing = ready && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={
        showing
          ? `Cart, ${count} ${count === 1 ? "item" : "items"}`
          : "Cart"
      }
      className="relative inline-flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
    >
      <ShoppingBag className="size-[22px]" strokeWidth={2.4} />
      {showing ? (
        <span
          // The label above already carries the number for a screen reader;
          // announcing it twice is how a badge becomes noise.
          aria-hidden
          // Yellow on brown. The badge was brown on white; on a brown header it
          // would be a count you cannot see.
          className="absolute top-1 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-yellow px-1.5 text-[11px] font-extrabold text-ink tabular-nums"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  // Escape closes the menu, which is the one keyboard convention a disclosure
  // like this is expected to honour.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    /**
     * A dark header, on every page.
     *
     * It was white, and against the hero it read as a seam rather than a
     * header: the photograph opens on a warm chocolate brown and a white band
     * sitting straight on top of it is the one hard edge on the page.
     *
     * The brown is the photograph's own, sampled from the strip the header sits
     * against — see --color-cocoa. Brand brown was tried first and is darker
     * and redder than the artwork; the join showed as a step. A header that is
     * nearly the right colour is worse than one that is plainly a different
     * one, so this matches exactly instead.
     */
    <header className="bg-cocoa sticky top-0 z-50 text-white">
      <BrandRule />

      {/* The row is shorter than it looks: the logo is a two-line lockup, so it
          needs more height than the wordmark it replaced, and the vertical
          padding comes down to pay for it. */}
      <div className="flex items-center gap-4 px-4 py-2.5 md:px-6 md:py-3">
        <Link href="/" className="shrink-0">
          {/* The filename carries the colourway on purpose. Replacing artwork in
              place leaves the old file cached under the same URL — by the dev
              server's image optimiser here, and by a CDN in production — so a
              mark that changes identity changes filename with it.

              Intrinsic size given, height driven by CSS — the rendered box is
              set by the header, and next/image only needs the ratio to reserve
              the space before the file arrives.

              priority: it is the first thing on every page, and a logo that
              fades in after the rest of the header has painted looks broken. */}
          <Image
            src="/brand/dampeak-brown.webp"
            alt={site.name}
            width={468}
            height={400}
            priority
            className="h-12 w-auto md:h-[60px]"
          />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Account control: Sign in, or the visitor's avatar with a menu. Reads
            the session in the browser, so the header is the same static HTML for
            everyone and does not have to become per-request. */}
        <div className="ml-auto flex items-center gap-1 md:ml-4 md:gap-2">
          <UserMenu />
          <CartLink />
        </div>

        <NavLink
          href="/products"
          className="rounded-squish inline-flex items-center gap-2 bg-yellow px-5 py-3 text-[14px] font-extrabold text-ink transition-transform active:scale-[0.96] md:px-6 md:py-3.5 md:text-[15px]"
        >
          Shop
          <ArrowUpRight className="size-[18px]" strokeWidth={3} />
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-1 inline-flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
        >
          {open ? (
            <X className="size-6" strokeWidth={2.5} />
          ) : (
            <Menu className="size-6" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Mobile menu. md:hidden so resizing up to desktop dismisses it without
          needing to track the viewport in state. */}
      {open ? (
        <nav
          id="site-menu"
          aria-label="Main"
          className="bg-cocoa px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {site.nav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-4 text-[17px] font-bold text-white"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
