import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { Halo } from "@/components/ui/Flourish";

/**
 * Section 4 — the soft-moment line, with the woman cut out and placed on the set.
 *
 * It used to be one flat picture with the photograph, the backdrop and its copy
 * space all baked together, which meant the layout was whatever the artwork had
 * been composed at: one aspect ratio, one position, and a tall crop on a phone
 * that had to choose between keeping her in frame and keeping room for the
 * words. Separating the two gives the section the same shape as the hero — a
 * backdrop that covers, and a subject sized in its own column — so it reflows
 * instead of being cropped.
 *
 * Same backdrop file as the hero, deliberately: it is the same set, and the two
 * sections are far enough apart on the page that it reads as one place rather
 * than as a repeat.
 *
 * The copy is on the left and she is on the right, so the scrim runs left to
 * right — the same way the hero's does. It is doing the same job: the backdrop
 * is not flat brown everywhere, and white type on its yellow cannot be read.
 */
export function Band() {
  const { band } = site;

  return (
    <section className="bg-brown relative w-full overflow-hidden">
      <Image
        src="/lifestyle/hero-waves.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(98,47,17,0.9)_0%,rgba(98,47,17,0.72)_34%,rgba(98,47,17,0.2)_60%,transparent_78%)] md:bg-[linear-gradient(90deg,rgba(98,47,17,0.9)_0%,rgba(98,47,17,0.74)_30%,rgba(98,47,17,0.26)_56%,transparent_74%)]"
      />

      {/**
       * She stands on the floor of the section; the copy stays centred.
       *
       * `items-end` puts her column's bottom on the row's bottom, and the row
       * has no bottom padding of its own — so her feet land on the section edge,
       * which is the brand rule below it. In a padded, centred box she read as
       * pasted above the strip; landing on it, she is sitting on it. The copy
       * carries its own padding so it is unaffected.
       *
       * The section clips, so however tall she is set nothing spills past that
       * edge onto the footer.
       */}
      <div className="relative mx-auto grid max-w-[1440px] items-end gap-8 px-5 pt-14 md:grid-cols-[1fr_1.08fr] md:gap-6 md:px-10 md:pt-16 lg:gap-10">
        {/* Copy first, in the DOM and on the page. Stacked it reads headline
            then picture, which is the order the words want; side by side it is
            the left column, which is where the scrim is. */}
        <div className="pb-14 md:self-center md:pb-16">
          {/* Bigger and looser than it was — see text-display-mid. At 3.6vw with
              the full display tracking this sat as two tight lines that read as
              squeezed next to the quote section's. */}
          <h2 className="text-display-mid max-w-[15ch] text-[10vw] text-white sm:text-[6.5vw] lg:text-[4.4vw]">
            {band.line}
          </h2>

          <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed font-semibold text-white/80 md:mt-6 md:text-[18px]">
            {band.tagline}
          </p>

          <a
            href={band.cta.href}
            className="rounded-squish mt-7 inline-flex w-fit items-center gap-3 bg-white px-8 py-4.5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97] md:mt-9 md:py-5"
          >
            {band.cta.label}
            <ArrowRight className="size-[18px]" strokeWidth={2.5} />
          </a>
        </div>

        <div className="relative flex justify-center md:justify-end">
          {/* She is cut out, so she has no ground of her own and would otherwise
              float on the flat backdrop. The halo is that ground. */}
          <Halo className="mx-auto max-w-[760px] md:mx-0 md:ml-auto" />

          <Image
            src={band.image.src}
            alt={band.image.alt}
            width={1273}
            height={1136}
            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 52vw, 760px"
            className="relative w-full max-w-[760px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
