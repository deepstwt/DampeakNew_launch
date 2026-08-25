import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { site } from "@/content/site";
import { ProductPhoto } from "@/components/ui/ProductPhoto";

export type ShowcaseItem = (typeof site.hero.showcase)[number];

type Props = {
  item: ShowcaseItem;
  priority?: boolean;
};

/**
 * A product, and a Buy Now beneath it.
 *
 * Two links, one destination, and only one of them reachable by keyboard. The
 * image is a big mouse target but carries tabIndex={-1} and aria-hidden, so it
 * does not become a second tab stop announcing the same link twice; the Buy pill
 * is the labelled one. A card that offers the same destination twice to a screen
 * reader is noise, not affordance.
 *
 * No state and no handlers, so the card itself is a Server Component. It is no
 * longer free of JavaScript, though: until there are photographs, the image is
 * drawn on a canvas by ProductRender, which is a client component. That is one
 * paint per card at mount and nothing after it — no loop, no listeners — and it
 * disappears the day a real photograph is set on the product.
 */
/**
 * Four layers, each roughly tripling the blur of the one before it. Real shadows
 * are not one blur — they are a dark contact point directly under the object
 * fading out to a wide, weak ambient pool. Stacking the falloff like this is what
 * reads as height rather than as an outline.
 */
const LIFT = {
  boxShadow: [
    "0 2px 2px rgba(11,11,15,0.16)", // contact
    "0 8px 8px rgba(11,11,15,0.14)", // close
    "0 22px 24px rgba(11,11,15,0.16)", // mid
    "0 48px 56px rgba(11,11,15,0.26)", // ambient pool
  ].join(", "),
};

export function ProductCard({ item, priority }: Props) {
  const href = `/products/${item.slug}`;

  return (
    <figure>
      <div className="relative aspect-square">
        <Link href={href} tabIndex={-1} aria-hidden className="block size-full">
          <div
            className="relative size-full overflow-hidden rounded-3xl bg-ink/5"
            style={LIFT}
          >
            <ProductPhoto
              image={item.image}
              name={item.name}
              slug={item.slug}
              swatch={item.swatch}
              priority={priority}
            />
          </div>
        </Link>
      </div>

      <figcaption className="mt-4">
        <span className="flex items-center gap-2.5">
          {/* The product's own colour, not its brand accent. The accents were
              assigned when the tile beside them was a flat block and nothing on
              screen contradicted them; now that the card shows the product, an
              orange dot next to a pink squishy is just wrong. */}
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ background: item.swatch }}
          />
          <span className="text-[15px] font-extrabold">{item.name}</span>
        </span>
        {/* Price only renders once there is one. See the TODO in site.ts. */}
        {item.price ? (
          <span className="text-display mt-1.5 block text-[22px]">{item.price}</span>
        ) : (
          <span className="mt-1.5 block text-[14px] font-semibold text-ink/40">
            {item.specs.shape} · {item.specs.finish}
          </span>
        )}
      </figcaption>

      <Link
        href={href}
        aria-label={`Buy ${item.name}`}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-yellow px-5 py-3.5 text-[15px] font-extrabold text-ink transition hover:brightness-95 active:scale-[0.98]"
      >
        Buy Now
        <ShoppingBag className="size-[17px]" strokeWidth={2.8} />
      </Link>
    </figure>
  );
}
