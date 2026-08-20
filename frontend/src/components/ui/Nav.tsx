"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { site } from "@/content/site";
import { UserMenu } from "@/components/ui/UserMenu";

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
    "text-[15px] font-semibold text-ink/65 transition-colors hover:text-ink";

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
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl">
      {/* Spectrum: the whole brand in one 6px rule */}
      <div className="flex h-1.5" aria-hidden>
        <span className="flex-1 bg-blue" />
        <span className="flex-1 bg-orange" />
        <span className="flex-1 bg-yellow" />
        <span className="flex-1 bg-ink" />
      </div>

      <div className="flex items-center gap-4 border-b border-ink/10 px-4 py-3.5 md:px-6">
        <Link href="/" className="text-display text-[28px] md:text-[32px]">
          {site.name}
          <span className="text-orange">.</span>
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
        <div className="ml-auto flex items-center gap-3 md:ml-4">
          <UserMenu />
        </div>

        <NavLink
          href="/products"
          className="rounded-squish inline-flex items-center gap-2 bg-ink px-5 py-3 text-[14px] font-extrabold text-white transition-transform active:scale-[0.96] md:px-6 md:py-3.5 md:text-[15px]"
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
          className="-mr-1 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
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
          className="border-b border-ink/10 bg-white px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {site.nav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-ink/5 py-4 text-[17px] font-bold text-ink"
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
