import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { ProductCard } from "@/components/ui/ProductCard";

/**
 * Section 2 — the lineup.
 *
 * Every product, with its own buy path, under one heading. No filters and no
 * "featured" ordering: with four products, promoting one demotes three.
 *
 * The cards are the same component the products page uses, so the home page and
 * the category page cannot drift apart in look or behaviour.
 */
export function Showcase() {
  const { showcase, hero } = site;

  return (
    <section id="products" className="bg-white px-4 py-20 md:px-6 md:py-28">
      <h2 className="text-display max-w-[18ch] text-[12vw] leading-[0.88] sm:text-[8vw] lg:text-[5vw]">
        {showcase.heading}
      </h2>

      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
        {hero.showcase.map((item, i) => (
          <ProductCard key={item.id} item={item} priority={i === 0} />
        ))}
      </div>

      <a
        href={showcase.cta.href}
        className="rounded-squish-alt mt-14 inline-flex items-center gap-3 bg-yellow px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
      >
        {showcase.cta.label}
        <ArrowRight className="size-5" strokeWidth={3} />
      </a>
    </section>
  );
}
