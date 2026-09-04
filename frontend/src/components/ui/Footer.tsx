import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { Subscribe } from "@/components/ui/Subscribe";

export function Footer() {
  const { footer, name } = site;
  const year = 2026; // Static: a live year would break hydration on New Year's Eve.

  return (
    <footer className="relative overflow-hidden bg-brown text-white">
      {/**
       * Spectrum, mirroring the nav — the page opens and closes on the same rule,
       * in the same three colours.
       *
       * Resequenced rather than reversed. The nav puts white in the middle
       * because it sits on a white header; this one sits on a brown footer, so
       * brown takes the middle for the same reason and the rule keeps all three
       * bands visible at both ends of the page.
       *
       * Same hairline as the nav's, inverted: it separates the brown band from
       * the brown below it and disappears against the other two.
       */}
      <div className="flex h-1.5 border-b border-white/25" aria-hidden>
        <span className="flex-1 bg-yellow" />
        <span className="flex-1 bg-brown" />
        <span className="flex-1 bg-white" />
      </div>

      <div className="px-4 pt-16 md:px-6 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Sign-up */}
          <div className="lg:col-span-5">
            <h2 className="text-display max-w-[12ch] text-[9vw] leading-[0.88] sm:text-[6vw] lg:text-[3.4vw]">
              {footer.line}
            </h2>
            <Subscribe />
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {footer.columns.map((column) => (
              <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
                <h3 id={`footer-${column.title}`} className="text-marker text-white/40">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[15px] font-bold text-white/75 transition-colors hover:text-yellow"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Socials + legal */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/15 py-8 md:flex-row md:items-center md:justify-between">
          {/* Named rather than iconified — a generic glyph standing in for a
              brand mark is worse than the word itself. */}
          <ul className="flex flex-wrap items-center gap-2">
            {footer.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  className="text-marker rounded-squish-alt inline-flex items-center gap-1.5 bg-white/10 px-4 py-2.5 transition-colors hover:bg-yellow hover:text-ink"
                >
                  {social.label}
                  <ArrowUpRight className="size-4" strokeWidth={3} />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footer.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13px] font-semibold text-white/45 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-[13px] font-semibold text-white/45">
              © {year} {name}
            </p>

            <a
              href="#top"
              className="text-marker inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 transition-colors hover:bg-white hover:text-ink"
            >
              Top
              <ArrowUp className="size-4" strokeWidth={3} />
            </a>
          </div>
        </div>
      </div>

      {/**
       * The sign-off: wordmark at poster scale, filling the page edge to edge.
       *
       * The size is tied to the length of the name. 26vw was set for "Oscar." at
       * six characters; "Dampeak." is eight, and at that size the full stop
       * falls off the page — losing the accent where the wordmark is largest.
       * Sized to just fill the width instead.
       *
       * The stop is yellow. It was orange, which was the last of the old palette
       * left anywhere on the page once the site moved to cream, white and brown.
       */}
      <div aria-hidden className="select-none px-4 md:px-6">
        <span className="text-display block text-[18.5vw] leading-[0.72] tracking-[-0.055em]">
          {name}
          <span className="text-yellow">.</span>
        </span>
      </div>
    </footer>
  );
}
