import Image from "next/image";
import type { ProductPhoto as Photo } from "@/content/site";

/**
 * A product's photograph, or an honest stand-in for one.
 *
 * There are no photographs of these four products yet, and the placeholder
 * imagery already in the repo is of a blanket, some jars and a desk — using any of
 * it for a squishy cube would be a picture of the wrong object, which is worse
 * than no picture. So until real photography lands, this renders a tile in the
 * product's actual specified colour, labelled as a placeholder so nobody mistakes
 * it for the product.
 *
 * Set `image` on the product in site.ts and the photograph replaces the tile.
 */
export function ProductPhoto({
  image,
  name,
  swatch,
  priority,
  className = "",
  showLabel = true,
}: {
  image: Photo | null;
  name: string;
  /** The product's real colour, from the manufacturing spec. */
  swatch: string;
  priority?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  if (image) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      // role=img with a label: a screen reader should hear what this stands for,
      // not silence where a product picture belongs.
      role="img"
      aria-label={`${name} — photograph coming soon`}
      className={`absolute inset-0 ${className}`}
      style={{
        // Off-centre highlight over the flat colour, so it reads as a soft object
        // with volume rather than as a swatch.
        background: `radial-gradient(120% 120% at 30% 25%, rgba(255,255,255,0.55), transparent 55%), ${swatch}`,
      }}
    >
      {showLabel ? (
        <span className="text-marker absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1.5 text-ink/60 backdrop-blur-sm">
          Photo coming
        </span>
      ) : null}
    </div>
  );
}
