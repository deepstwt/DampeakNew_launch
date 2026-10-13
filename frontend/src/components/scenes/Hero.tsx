import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { Halo } from "@/components/ui/Flourish";

/**
 * The hero: the copy on the left, the two products on the right, both standing
 * on the backdrop they were shot against.
 *
 * Laid out as a grid rather than as things positioned on top of a picture. A
 * picture with absolute coordinates over it has to be re-tuned at every width —
 * one breakpoint puts the type on the yellow floor, the next puts a product
 * under the headline. Here the backdrop is the only absolute thing; the copy and
 * the products are flow content in two columns that become one when there is no
 * room, and the section's height follows them instead of being declared.
 *
 * The products are sized in percentages with a px ceiling, so they shrink with
 * the column on a tablet and stop growing on a wide monitor rather than becoming
 * the whole page. They sit on `items-end` because both were photographed on
 * podiums: their bases have to line up or they read as floating at two heights.
 */

export function Hero() {
  const { hero } = site;

  return (
    <section className="bg-cocoa relative w-full overflow-hidden">
      <Image
        src="/lifestyle/hero-waves.webp"
        alt=""
        // Decorative — the set, not the subject. The products in front of it are
        // the content, and they carry their own alt text.
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/**
       * Tall enough to be the first screen.
       *
       * Left to its content the hero came out 611px against a 900px viewport,
       * so the section below it was always half in frame — the page opened on
       * two things instead of one. The 96px is the header above it, which is in
       * flow, so hero plus header is exactly one screen. `svh` rather than `vh`
       * because on a phone `vh` measures the viewport the browser has when its
       * address bar is hidden, and the first paint is with it showing.
       *
       * The products take the larger share of the row. The copy is three short
       * lines and a sentence; the products are what has to fill a screen this
       * size, and at an even split they were 415px of object in an 804px
       * section with 214px of nothing above and below them.
       */}
      {/**
       * A ground for the words.
       *
       * The backdrop's yellow wave rises into the bottom-left corner — exactly
       * where the sentence and the button sit — and white type on that yellow is
       * unreadable. Where the wave falls moves with the viewport, so the copy
       * cannot be positioned around it; it needs a surface of its own.
       *
       * Tinted with the deep brown rather than black: a grey scrim over this
       * artwork drains the warmth out of the half of the picture it covers,
       * where brown over brown only deepens it. It is gone by 72% across, so the
       * products are untouched.
       *
       * Stacked, the copy is above the products instead of beside them, so the
       * gradient runs top-to-bottom there for the same reason.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(98,47,17,0.88)_0%,rgba(98,47,17,0.7)_38%,rgba(98,47,17,0.2)_62%,transparent_78%)] md:bg-[linear-gradient(90deg,rgba(98,47,17,0.9)_0%,rgba(98,47,17,0.74)_30%,rgba(98,47,17,0.28)_55%,transparent_72%)]"
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-14 md:min-h-[calc(100svh-96px)] md:grid-cols-[0.88fr_1.22fr] md:gap-4 md:px-10 md:py-12 lg:gap-8">
        <div>
          <h1 className="text-display text-[13vw] leading-[0.86] text-white sm:text-[9vw] md:text-[7vw] lg:text-[min(6vw,96px)]">
            <span className="block">{hero.headline[0]}</span>
            <span className="block">{hero.headline[1]}</span>
            <span className="text-yellow block">{hero.headline[2]}</span>
          </h1>

          <p className="mt-6 max-w-[34ch] text-[16px] leading-relaxed font-semibold text-white/80 md:mt-7 md:text-[18px] lg:text-[20px]">
            {hero.sub}
          </p>

          <a
            href={hero.primary.href}
            // White, not yellow: the button sits near the foot of the frame,
            // which is where this backdrop turns to its yellow floor, and a
            // yellow pill disappears into it.
            className="rounded-squish mt-8 inline-flex items-center gap-3 bg-white px-8 py-4.5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97] md:mt-9 md:px-9 md:py-5 md:text-[18px]"
          >
            {hero.primary.label}
            <ArrowRight className="size-5" strokeWidth={3} />
          </a>
        </div>

        <div className="relative flex items-end justify-center gap-2 sm:gap-4 md:justify-end">
          {/* Sun rather than warm: the products stand where the backdrop turns
              to its yellow floor, and a brown disc there reads as a stain. */}
          <Halo tone="sun" className="left-auto aspect-square w-[88%] max-w-[620px]" />

          {/**
           * Both are cut out with their podiums, so no shadow is added here —
           * the podium is the shadow. `w-[…]` with a `max-w-[…]` is what keeps
           * them in proportion to the column rather than to the viewport: at
           * tablet widths the column is the thing that got narrow.
           *
           * Deliberately unequal. At near-matching sizes the two read as a pair
           * of specimens on a shelf; the marbled stack is the louder object and
           * taking it half again bigger than the cheese gives the pair a subject
           * and a supporting act instead of two things competing.
           *
           * They overlap. Side by side they can only grow until their combined
           * width hits the column, and that ceiling arrived while there was
           * still a third of the section empty above them. Tucking the stack
           * over the pedestal buys back that width — and two objects on a shelf
           * overlapping is how they would actually be arranged.
           */}
          <Image
            src="/products/hero-cheese-podium.webp"
            alt="The Cheese Cube squishy on a cream podium."
            width={977}
            height={848}
            priority
            sizes="(max-width: 768px) 38vw, (max-width: 1280px) 24vw, 360px"
            className="relative w-[38%] max-w-[360px] object-contain"
          />
          <Image
            src="/products/hero-marbled-podium.webp"
            alt="Four Marbled Cube squishies stacked on a brown podium."
            width={1275}
            height={1153}
            priority
            sizes="(max-width: 768px) 62vw, (max-width: 1280px) 42vw, 640px"
            className="relative -ml-[5%] w-[68%] max-w-[640px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
