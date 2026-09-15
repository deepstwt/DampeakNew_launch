import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

/**
 * Section 4 — the soft-moment line, on cream.
 *
 * It was a full-bleed photograph with the type over it, and the photograph was a
 * stock picture of a knitted blanket standing in until the deck's lifestyle shot
 * exists. A blanket under a headline about squeezing a squishy is a picture of
 * the wrong object, which is worse than no picture, so the section carries its
 * own type for now.
 *
 * Cream and not brown, which is what it first became: the quote band above this
 * is brown and the footer below it is brown, and three dark sections running
 * together lost the break the photograph used to give the page.
 *
 * Put `image` back on `band` in site.ts and this wants to become the photo
 * treatment again: full-bleed, a scrim over it, the same type on top.
 *
 * The tagline sits under the heading rather than beside it — at this type size a
 * second column of small text competes with the headline instead of sitting
 * beneath it.
 */
export function Band() {
  const { band } = site;

  return (
    <section className="relative w-full overflow-hidden bg-cream">
      <div className="mx-auto flex min-h-[460px] max-w-[1440px] flex-col justify-end px-6 py-14 md:min-h-[560px] md:px-10 md:py-20">
        <h2 className="text-display max-w-[20ch] text-[11vw] sm:text-[7vw] lg:text-[4.4vw]">
          {band.line}
        </h2>

        <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed font-semibold text-ink/65 md:text-[19px]">
          {band.tagline}
        </p>

        <a
          href={band.cta.href}
          className="rounded-squish mt-9 inline-flex w-fit items-center gap-3 bg-brown px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
        >
          {band.cta.label}
          <ArrowRight className="size-[18px]" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
