import { site } from "@/content/site";

/**
 * One line, held on a full field of blue.
 *
 * The oversized quote mark is a hollow graphic cropped by the section edge —
 * it's the loud element, so the sentence itself can stay plain and readable.
 * Static.
 */
export function Quote() {
  const { quote } = site;

  return (
    <section className="relative overflow-hidden bg-blue text-white">
      {/* Cropped by the section, not floated over the words */}
      <span
        aria-hidden
        className="text-display text-outline-white pointer-events-none absolute -top-[9vw] left-2 block text-[34vw] leading-none select-none md:left-6"
      >
        &ldquo;
      </span>

      <figure className="relative px-4 pt-[16vw] pb-16 md:px-6 md:pt-[13vw] md:pb-24">
        <blockquote className="text-display max-w-[15ch] text-[13vw] leading-[0.86] lg:text-[7vw]">
          {quote.lead}{" "}
          <span className="text-yellow">{quote.rest}</span>
        </blockquote>

        <figcaption className="text-marker mt-10 flex items-center gap-3 text-white/60">
          <span className="size-3 rounded-full bg-yellow" />
          {quote.source}
        </figcaption>
      </figure>
    </section>
  );
}
