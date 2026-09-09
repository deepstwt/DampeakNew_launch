"use client";

import { useState } from "react";
import type { ProductPhoto as Photo } from "@/content/site";
import { ProductPhoto } from "@/components/ui/ProductPhoto";

/**
 * One product, every shot of it: a rail of thumbnails beside the main frame.
 *
 * The rail is the full set of frames a product is going to have, not the set it
 * has. There is one photograph of each product so far, so the frames after it
 * stand empty — the drawn product with "Photo coming" on it, the same stand-in
 * the cards used before there was any photography at all.
 *
 * That is a deliberate choice and it cuts both ways. An empty frame admits that
 * a shot is missing, where showing one photograph alone quietly implies there is
 * nothing else to see; a shop with one angle of a squishy has not finished
 * photographing it. The cost is three honest gaps on every product page until
 * the shoot lands. Drop photographs into `images` and each one takes the next
 * frame — the placeholders retreat as the real shots arrive, and disappear once
 * there are FRAMES of them.
 *
 * The rail runs down the left on a wide screen and along the bottom on a narrow
 * one — a vertical strip beside a full-width image would leave the image too
 * small to be the thing you came to look at.
 */

/**
 * How many frames a product page shows.
 *
 * Four is the number of distinct things worth photographing about a squishy:
 * the object, the squeeze, the scale of it in a hand, and what arrives in the
 * box. It is not a limit — a product with more photographs than this shows all
 * of them.
 */
const FRAMES = 4;

export function ProductGallery({
  images,
  name,
  slug,
  swatch,
}: {
  images: readonly Photo[];
  name: string;
  /** Decides the silhouette and the surface of the drawing. See lib/product-art. */
  slug: string;
  swatch: string;
}) {
  const [index, setIndex] = useState(0);

  /** Real shots first, then whatever is still missing. */
  const frames: (Photo | null)[] = Array.from(
    { length: Math.max(images.length, FRAMES) },
    (_, i) => images[i] ?? null,
  );

  const current = frames[index] ?? null;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
      {/**
       * Buttons, not links or tabs.
       *
       * `aria-pressed` says which one is showing. The tab pattern would be the
       * other reading of this, and it is the wrong one: tabs own a panel of
       * content, while these swap the source of a single image that is already
       * described by its own alt text.
       */}
      <ul className="flex shrink-0 gap-3 sm:flex-col">
        {frames.map((frame, i) => (
          <li key={frame?.src ?? `empty-${i}`}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={
                frame
                  ? `Show image ${i + 1} of ${frames.length}`
                  : `Image ${i + 1} of ${frames.length} — photograph coming soon`
              }
              className={`relative block size-[68px] overflow-hidden rounded-2xl border-2 transition lg:size-[84px] ${
                i === index
                  ? "border-ink"
                  : "border-transparent bg-ink/[0.03] hover:bg-ink/[0.06]"
              }`}
            >
              {/* alt="" on purpose: the button's own label already says what
                  this does, and the photograph's description belongs to the
                  main frame, not to four copies of it in a strip.

                  The label is off at this size too — "Photo coming" does not fit
                  in 68px, and the empty frames read as empty without it. */}
              <ProductPhoto
                image={frame ? { src: frame.src, alt: "" } : null}
                name={name}
                slug={slug}
                swatch={swatch}
                showLabel={false}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-ink/5">
        <ProductPhoto
          image={current}
          name={name}
          slug={slug}
          swatch={swatch}
          priority={index === 0}
        />
      </div>
    </div>
  );
}
