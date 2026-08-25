import { site } from "@/content/site";

/**
 * "Did You Know?" — the one place the site cites anything.
 *
 * Two rules hold this block together, and both are copy rules rather than layout
 * ones: it reports what the research observed (fidgeting rises with stress), and
 * it never states what the product does about it. A squishy is not a treatment,
 * and the About page's "What we won't do" says so in as many words.
 *
 * The citation renders as a link only when there is a URL for it. A styled
 * underline over a dead anchor is worse than plain text.
 */
export function Research({ className = "" }: { className?: string }) {
  const { research } = site;
  const { source } = research;

  return (
    <section className={`border-t border-ink/10 pt-12 ${className}`}>
      <p className="text-marker text-orange">{research.eyebrow}</p>

      <h2 className="text-display mt-5 max-w-[24ch] text-[8vw] leading-[0.92] sm:text-[5vw] lg:text-[2.8vw]">
        {research.headline}
      </h2>

      <p className="mt-6 max-w-[62ch] text-[18px] leading-relaxed font-medium text-ink/70">
        {research.body}
      </p>

      <p className="mt-7 text-[14px] font-bold text-ink/45">
        Research —{" "}
        {source.href ? (
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-blue"
          >
            {source.title}
          </a>
        ) : (
          <cite className="text-ink not-italic">{source.title}</cite>
        )}{" "}
        · {source.date}
      </p>
    </section>
  );
}
