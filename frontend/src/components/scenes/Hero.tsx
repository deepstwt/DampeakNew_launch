import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { HeroBlobs } from "@/components/scenes/HeroBlobs";
import { SqueezeToy } from "@/components/scenes/SqueezeToy";
import { SpongyText } from "@/components/ui/SpongyText";

/**
 * Brand-led poster hero: the promise on the left, the product on the right.
 *
 * The four-product spread used to live here. It now has its own section beneath
 * ("Shop Your Relaxation") because the deck gives it its own heading — a grid
 * under a headline it doesn't belong to reads as part of the headline's argument.
 *
 * That left the right-hand half empty, which at this type size read as an
 * unfinished page rather than as space. What fills it is the product itself,
 * squeezable: the one thing about a squishy that a photograph cannot show is how
 * it behaves when you press it, and this is the only page with room to show it.
 * See SqueezeToy.
 *
 * The three blocks are placed explicitly rather than nested, so one toy serves
 * both layouts. Stacked on a phone the DOM order is the reading order — headline,
 * sentence, toy, button, which puts the reason to press the button above it. On a
 * wide screen the toy spans both rows of the second column and the copy keeps the
 * first, so nothing is duplicated and only one solver ever runs.
 */

export function Hero() {
  const { hero } = site;

  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-white">
      {/* Background: decorative, and only ever seen through a white scrim */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* The four products as four drifting soft bodies. Replaces a photograph
            because it does something a photograph cannot — it teaches the
            colour system before a word is read. */}
        <HeroBlobs className="absolute inset-0" />
        {/* Lighter than it would need to be if the bodies sat under the type —
            the composition keeps them clear of it, so they can stay saturated. */}
        <div className="absolute inset-0 bg-white/50" />
        {/* Blends the bottom edge into the section that follows, which is cream —
            left as to-white and the hero ends on a visible horizontal seam. */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-cream" />
      </div>

      <div className="relative grid gap-y-12 px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-x-12">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          {/* Type, bleeding to the edges. Spongy: it gives under the cursor and
              under a fast scroll, the same as the object it is selling.

              Capped in px as well as vw: past roughly 1500px the viewport unit
              alone keeps growing the headline until it is the only thing on the
              screen, and this is a hero, not a splash. */}
          <h1 className="text-display text-[13.5vw] leading-[0.82] lg:text-[min(9.5vw,152px)]">
            <SpongyText
              className="block"
              segments={[{ text: hero.headline[0] }]}
            />
            <SpongyText
              className="block"
              segments={[{ text: hero.headline[1], className: "text-outline" }]}
            />
            <SpongyText
              className="block"
              segments={[{ text: hero.headline[2], className: "text-orange" }]}
            />
          </h1>

          {/* Held to ~46 characters a line. The sentence is long; the measure is
              what keeps it readable at this size. */}
          <p className="mt-10 max-w-[46ch] text-[19px] leading-relaxed font-semibold text-ink/70 md:text-[22px]">
            {hero.sub}
          </p>
        </div>

        <SqueezeToy className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center" />

        <div className="flex flex-wrap items-center gap-3 lg:col-start-1 lg:row-start-2 lg:self-start">
          <a
            href={hero.primary.href}
            className="rounded-squish inline-flex items-center gap-3 bg-brown px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
          >
            {hero.primary.label}
            <ArrowRight className="size-5" strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
