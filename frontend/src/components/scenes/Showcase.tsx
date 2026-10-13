import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PRODUCTS, site } from "@/content/site";
import { ProductCard } from "@/components/ui/ProductCard";

/**
 * Section 2 — the lineup, on the backdrop from the hero's shoot.
 *
 * It was a flat cream field. The backdrop is the same set the hero products
 * were photographed on, with nothing standing on it, so the two sections read
 * as one place rather than as a photograph followed by a swatch.
 *
 * Everything in here had to change colour with it. The field is brown at the
 * top and yellow along the bottom, which is two different problems: ink type
 * disappears into the brown, and a yellow button disappears into the floor. So
 * the heading and the captions go white, and the one button goes white too —
 * white is the only fill that holds against both halves of this picture.
 *
 * `cardTone="light"` is what carries that into the cards. They are shared with
 * the products page, which is still on white, so the tone is a prop rather than
 * a colour baked into the card.
 */
export function Showcase() {
  const { showcase } = site;

  return (
    <section id="products" className="bg-brown relative overflow-hidden">
      <Image
        src="/lifestyle/showcase-backdrop.webp"
        alt=""
        // Decorative: the section's meaning is in the products, and a screen
        // reader gaining "brown wall with yellow waves" here learns nothing.
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/**
       * Centred, not left-aligned.
       *
       * The grid was four columns wide and the catalogue is two products long,
       * so everything sat in the left half of a very wide section with the
       * backdrop's empty right side doing nothing.
       *
       * Two columns inside a 980px container, each card capped at 440px. The
       * cards were 280px wide, which left a third of the section empty on each
       * side and made the pair look dropped into the middle of a field rather
       * than filling it. 440 is the ceiling rather than a target: the product
       * photograph is square, so a card much wider than this becomes a column
       * of image with the price pushed off the bottom of the screen.
       *
       * The cards keep their own text left-aligned inside the centred row. A
       * centred section does not mean centred captions: a name and a price are a
       * column of facts, and centring them starts the eye in a different place
       * on every line.
       */}
      <div className="relative px-4 py-16 text-center md:px-6 md:py-20">
        <h2 className="text-display mx-auto max-w-[18ch] text-[12vw] leading-[0.88] text-white sm:text-[8vw] lg:text-[5vw]">
          {showcase.heading}
        </h2>

        <ul className="mx-auto mt-12 grid max-w-[980px] grid-cols-2 gap-4 sm:gap-7 lg:gap-9">
          {PRODUCTS.map((item, i) => (
            <li key={item.id} className="mx-auto w-full max-w-[440px] text-left">
              <ProductCard item={item} priority={i === 0} tone="light" />
            </li>
          ))}
        </ul>

        <a
          href={showcase.cta.href}
          className="rounded-squish-alt mt-14 inline-flex items-center gap-3 bg-white px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
        >
          {showcase.cta.label}
          <ArrowRight className="size-5" strokeWidth={3} />
        </a>
      </div>
    </section>
  );
}
