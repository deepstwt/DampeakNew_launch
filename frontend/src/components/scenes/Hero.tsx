import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { ProductCard } from "@/components/ui/ProductCard";
import { HeroBlobs } from "@/components/scenes/HeroBlobs";
import { SpongyText } from "@/components/ui/SpongyText";

/**
 * Brand-led poster hero.
 *
 * Dampeak sells a collection, not one object, so the hero shows a spread of
 * products across the ranges rather than a single hero product. The squishy is
 * simply the one carrying the "New" tag.
 *
 * Static — the scale of the type and the colour coding do the work.
 */

export function Hero() {
  const { hero } = site;

  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-white">
      {/* Background: decorative, and only ever seen through a white scrim */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* The four ranges as four drifting soft bodies. Replaces a photograph
            because it does something a photograph cannot — it teaches the
            colour system before a word is read. */}
        <HeroBlobs className="absolute inset-0" />
        {/* Lighter than it would need to be if the bodies sat under the type —
            the composition keeps them clear of it, so they can stay saturated. */}
        <div className="absolute inset-0 bg-white/50" />
        {/* Blends the bottom edge into the white section that follows */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="relative px-4 pt-8 md:px-6 md:pt-12">
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
            segments={[
              { text: "made " },
              { text: "easier.", className: "text-orange" },
            ]}
          />
        </h1>

        {/* The spread: four products, colour-coded by range */}
        <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-36 lg:mt-44 lg:grid-cols-4 lg:gap-6">
          {hero.showcase.map((item, i) => (
            <ProductCard key={item.id} item={item} priority={i === 0} />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-14 flex flex-wrap items-center gap-3 pb-12">
          <a
            href={hero.primary.href}
            className="rounded-squish inline-flex items-center gap-3 bg-blue px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
          >
            {hero.primary.label}
            <ArrowRight className="size-5" strokeWidth={3} />
          </a>
          <a
            href={hero.secondary.href}
            className="rounded-squish-alt bg-yellow px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
          >
            {hero.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
