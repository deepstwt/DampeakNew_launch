import Image from "next/image";
import type { ProductPhoto as Photo } from "@/content/site";
import { ProductRender } from "@/components/ui/ProductRender";

/**
 * A product's photograph, or an honest stand-in for one.
 *
 * There are no photographs of these four products yet, and the placeholder
 * imagery already in the repo is of a blanket, some jars and a desk — using any of
 * it for a squishy cube would be a picture of the wrong object, which is worse
 * than no picture.
 *
 * So until real photography lands, this draws the product: its shape, its
 * surface and its finish, straight off the spec sheet, with the same paint the
 * hero uses. That replaced a flat tile in the product's colour, which was honest
 * about having no photograph and said nothing else.
 *
 * It is still a drawing and it is still labelled as one — "Photo coming" stays
 * until there is a photograph, because a good render is exactly the kind of
 * thing someone could mistake for one.
 *
 * Set `image` on the product in site.ts and the photograph replaces it.
 */
export function ProductPhoto({
  image,
  name,
  slug,
  swatch,
  priority,
  className = "",
  showLabel = true,
}: {
  image: Photo | null;
  name: string;
  /** Decides the silhouette and the surface. See lib/product-art. */
  slug: string;
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
      aria-label={`${name} — drawing, photograph coming soon`}
      className={`absolute inset-0 ${className}`}
    >
      <ProductRender product={{ slug, swatch }} />

      {showLabel ? (
        <span className="text-marker absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1.5 text-ink/60 backdrop-blur-sm">
          Photo coming
        </span>
      ) : null}
    </div>
  );
}
