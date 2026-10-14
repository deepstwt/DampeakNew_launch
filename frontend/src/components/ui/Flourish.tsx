/**
 * The shapes that go behind a cut-out subject.
 *
 * A cut-out on a flat field has no ground — it reads as pasted on, however good
 * the photograph is. These give it one: a disc it stands in front of, a ring
 * that repeats the brand's round language, and a few stars.
 *
 * Drawn rather than imported. They are three colours and four shapes, so an
 * asset would be a download and a cache entry for something a hundred bytes of
 * SVG says exactly, at any size, in the palette's own tokens — and these sit
 * behind photographs that are already the heavy thing on the page.
 *
 * All of it is decorative. `aria-hidden` throughout, and pointer-events-none, so
 * nothing here can take a click meant for the subject in front of it.
 */

/** One four-pointed star, the brand's sparkle. */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {/* Concave sides, not a polygon: straight-sided stars read as asterisks at
          small sizes, where the curve keeps the shape legible. */}
      <path d="M12 0c1.1 8.1 3.8 10.9 12 12-8.2 1.1-10.9 3.9-12 12-1.1-8.1-3.8-10.9-12-12C8.2 10.9 10.9 8.1 12 0Z" />
    </svg>
  );
}

/**
 * The disc, ring and stars behind a subject.
 *
 * `tone` picks what the disc is made of. "warm" is the lighter brown, for a
 * subject standing on the dark half of a backdrop; "sun" is the brand yellow at
 * low opacity, for one standing on the light half, where a brown disc would
 * read as a stain.
 */
export function Halo({
  tone = "warm",
  className = "",
}: {
  tone?: "warm" | "sun";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {/* The disc. Offset up and left of centre rather than concentric with the
          subject: a halo centred exactly behind a person is a saint, not a
          product shot. */}
      <div
        className={`absolute top-[6%] left-[8%] aspect-square w-[84%] rounded-full ${
          tone === "warm" ? "bg-cocoa/70" : "bg-yellow/25"
        }`}
      />

      {/* A ring, larger and barely there, so the disc has an edge to echo. */}
      <div className="absolute top-[1%] left-[2%] aspect-square w-[94%] rounded-full border border-yellow/30" />

      <Star className="text-yellow absolute top-[8%] right-[10%] size-5 md:size-7" />
      <Star className="text-yellow/70 absolute top-[26%] right-[3%] size-3 md:size-4" />
      <Star className="text-cream/80 absolute bottom-[22%] left-[2%] size-4 md:size-5" />
    </div>
  );
}
