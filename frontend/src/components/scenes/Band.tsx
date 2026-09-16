import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

/**
 * Section 4 — the soft-moment line, over the lifestyle photograph.
 *
 * It spent a while on flat cream because the only photograph available was a
 * stock knitted blanket, and a blanket under a headline about squeezing a
 * squishy is a picture of the wrong object. The real shot exists now, so the
 * section is a photograph again.
 *
 * The copy sits right, and that is the photograph's decision rather than a
 * preference: the subject is in the left half and is looking across to the
 * right. Type in the left half would sit on top of him and leave him staring
 * past it. Here the eye lands on him, follows where he is looking, and arrives
 * at the headline.
 *
 * The scrim turns with the layout. Stacked, the type is at the foot of the frame
 * so the scrim rises from the bottom; side by side, the type is on the right so
 * the scrim comes in from the right and leaves his half of the picture alone.
 */
export function Band() {
  const { band } = site;

  return (
    <section className="relative w-full overflow-hidden bg-ink">
      <Image
        src={band.image.src}
        alt={band.image.alt}
        fill
        // Below the fold on every viewport, so it is never the LCP element and
        // has no business competing with the hero for bandwidth.
        sizes="100vw"
        className="object-cover"
      />

      {/* Two scrims in one element: the `from`/`via`/`to` stops are variables, so
          the md: variants replace the direction and the stops together. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/70 to-ink/40 md:bg-gradient-to-l md:from-ink/85 md:via-ink/55 md:to-transparent"
      />

      {/* Taller stacked than the cream version was. Narrow, the copy runs to
          three lines of headline and three of tagline, which filled a 460px
          section edge to edge and left the photograph with nothing to show. */}
      <div className="relative mx-auto flex min-h-[580px] max-w-[1440px] flex-col justify-end px-6 py-14 md:min-h-[600px] md:px-10 md:py-20">
        <div className="md:ml-auto md:w-[46%] md:max-w-[560px]">
          <h2 className="text-display max-w-[16ch] text-[11vw] text-white sm:text-[7vw] lg:text-[3.8vw]">
            {band.line}
          </h2>

          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed font-semibold text-white/80 md:text-[19px]">
            {band.tagline}
          </p>

          <a
            href={band.cta.href}
            className="rounded-squish mt-9 inline-flex w-fit items-center gap-3 bg-white px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
          >
            {band.cta.label}
            <ArrowRight className="size-[18px]" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
