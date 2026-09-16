import { HIGHLIGHTS, type Highlight } from "@/content/site";

/**
 * The three things every product page says under its price.
 *
 * Drawn, not typed: the copy deck writes these with emoji (🧑 🤩 🎁), and an
 * emoji is a font rather than artwork. It renders as a different picture on
 * every platform, as a blank box where the font is missing, and at a weight no
 * one here chose — next to type set at 900 that reads as a paste, not a design.
 *
 * Each icon is inline SVG on a 24 box with a 2.2 stroke, which is the weight
 * lucide draws at elsewhere on this page, so the row sits with the rest of the
 * site instead of beside it. `currentColor` throughout: the row is one colour,
 * set once on the container.
 */

const ICON = {
  /** A person, for the age rating. The "14+" is the label beside it. */
  age: (
    <>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </>
  ),

  /**
   * The squish itself, with something pressing in from both sides.
   *
   * A hand was the obvious drawing and the wrong one: a hand at 22px is five
   * fingers' worth of detail in a space that can hold about three strokes, and
   * every attempt read as a leaf. The soft shape and the two arrows pointing
   * into it say "squeeze" at any size.
   */
  squeeze: (
    <>
      <path d="M9.5 8h5a3.2 3.2 0 0 1 3.2 3.2v1.6A3.2 3.2 0 0 1 14.5 16h-5a3.2 3.2 0 0 1-3.2-3.2v-1.6A3.2 3.2 0 0 1 9.5 8z" />
      <path d="M1.9 12h2.5M3.2 10.7 4.5 12l-1.3 1.3" />
      <path d="M22.1 12h-2.5M20.8 10.7 19.5 12l1.3 1.3" />
    </>
  ),

  /** A gift: box, lid, ribbon. */
  gift: (
    <>
      <path d="M3.5 11.5h17v8a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M2.6 7.8h18.8v3.7H2.6z" />
      <path d="M12 7.8V21" />
      <path d="M12 7.8S10.8 3 8.4 3a2.4 2.4 0 0 0 0 4.8zM12 7.8S13.2 3 15.6 3a2.4 2.4 0 0 1 0 4.8z" />
    </>
  ),
} satisfies Record<Highlight["icon"], React.ReactNode>;

function Icon({ name }: { name: Highlight["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative: the label next to it already says what this is, and a second
      // reading of "gift" helps nobody.
      aria-hidden
      focusable="false"
      className="size-[22px] shrink-0"
    >
      {ICON[name]}
    </svg>
  );
}

export function ProductHighlights({ className = "" }: { className?: string }) {
  return (
    /**
     * A list, because it is one — three claims of equal weight, not a sentence
     * broken up by pictures.
     *
     * One per row, as the copy deck writes them. Side by side they read as a row
     * of tags to be skimmed past; stacked, each one is a line to be read, and
     * the three icons line up down the left where the eye already is. The pills
     * stay as wide as their own words — `items-start`, not `stretch`, which
     * would give "14+" the width of "Satisfying Squeeze".
     */
    <ul className={`flex flex-col items-start gap-2.5 ${className}`}>
      {HIGHLIGHTS.map((highlight) => (
        <li
          key={highlight.label}
          className="inline-flex items-center gap-2 rounded-full bg-cream/45 px-4 py-2.5 text-[15px] font-extrabold text-ink"
        >
          <span className="text-brown">
            <Icon name={highlight.icon} />
          </span>
          {highlight.label}
        </li>
      ))}
    </ul>
  );
}
