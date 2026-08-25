import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { HeroBlobs } from "@/components/scenes/HeroBlobs";
import { SpongyText } from "@/components/ui/SpongyText";

/**
 * Brand-led poster hero: the promise, one sentence of what that means, one way in.
 *
 * The four-product spread used to live here. It now has its own section beneath
 * ("Shop Your Relaxation") because the deck gives it its own heading — a grid
 * under a headline it doesn't belong to reads as part of the headline's argument.
 *
 * Static — the scale of the type and the colour coding do the work.
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
        {/* Blends the bottom edge into the white section that follows */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="relative px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-24">
        {/* Type, bleeding to the edges. Spongy: it gives under the cursor and
            under a fast scroll, the same as the object it is selling. */}
        <h1 className="text-display text-[17vw] leading-[0.78] lg:text-[13vw]">
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
        <p className="mt-10 max-w-[46ch] text-[19px] leading-relaxed font-semibold text-ink/70 md:mt-14 md:text-[22px]">
          {hero.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={hero.primary.href}
            className="rounded-squish inline-flex items-center gap-3 bg-blue px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
          >
            {hero.primary.label}
            <ArrowRight className="size-5" strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
