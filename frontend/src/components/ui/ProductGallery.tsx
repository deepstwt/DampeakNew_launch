"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ProductPhoto as Photo } from "@/content/site";
import { ProductPhoto } from "@/components/ui/ProductPhoto";

/**
 * One product, its shots, and the frames still waiting for one.
 *
 * There is a single photograph of each product, so three of the four frames are
 * empty — outlines, holding the shape the rail will have. They are not buttons:
 * an empty frame that can be pressed would blank the picture the page is about,
 * which is a worse answer than one that plainly has nothing in it yet.
 *
 * Drop photographs into `images` and each one fills the next frame and becomes
 * selectable. Nothing else changes.
 */

/**
 * How many frames the rail shows.
 *
 * Four is the number of distinct things worth photographing about a squishy: the
 * object, the squeeze, its scale in a hand, and what arrives in the box. It is
 * not a cap — a product with more photographs than this shows all of them.
 */
const FRAMES = 4;

export function ProductGallery({
  images,
  name,
  slug,
  swatch,
  overlay,
}: {
  images: readonly Photo[];
  name: string;
  /** Decides the silhouette and the surface of the drawing. See lib/product-art. */
  slug: string;
  swatch: string;
  /** Sits on the main frame — the Save button, on the picture. */
  overlay?: ReactNode;
}) {
  const [index, setIndex] = useState(0);

  const frames: (Photo | null)[] = Array.from(
    { length: Math.max(images.length, FRAMES) },
    (_, i) => images[i] ?? null,
  );

  const current = frames[index] ?? frames[0] ?? null;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
      <ul className="flex shrink-0 gap-3 sm:flex-col">
        {frames.map((frame, i) =>
          frame ? (
            <li key={frame.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={`Show image ${i + 1}`}
                className={`relative block size-[60px] overflow-hidden rounded-2xl border-2 bg-white transition lg:size-[72px] ${
                  i === index ? "border-ink" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                {/* alt="" on purpose: the button's own label says what it does,
                    and the photograph's description belongs to the main frame,
                    not to four copies of it in a strip. */}
                <ProductPhoto
                  image={{ src: frame.src, alt: "" }}
                  name={name}
                  slug={slug}
                  swatch={swatch}
                  showLabel={false}
                />
              </button>
            </li>
          ) : (
            <li key={`empty-${i}`}>
              {/* Not a button, and hidden from assistive tech: there is nothing
                  here to announce or to press. */}
              <div
                aria-hidden
                className="size-[60px] rounded-2xl border-2 border-dashed border-ink/10 bg-ink/[0.02] lg:size-[72px]"
              />
            </li>
          ),
        )}
      </ul>

      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-ink/5">
        {overlay}
        <ProductPhoto
          image={current}
          name={name}
          slug={slug}
          swatch={swatch}
          priority
        />
      </div>
    </div>
  );
}
