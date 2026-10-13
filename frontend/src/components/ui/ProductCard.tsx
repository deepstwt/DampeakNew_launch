import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { primaryImage, type site } from "@/content/site";
import { ProductPhoto } from "@/components/ui/ProductPhoto";

export type ShowcaseItem = (typeof site.hero.showcase)[number];

type Props = {
  item: ShowcaseItem;
  priority?: boolean;
  /**
   * What the card is standing on.
   *
   * "dark" is the default and means ink type — the products page and every
   * white surface. "light" is for the cards on the home page's photographic
   * backdrop, where ink would be lost in the brown. Only the caption changes;
   * the picture and its shadow are the same either way.
   */
  tone?: "dark" | "light";
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

export function ProductCard({ item, priority, tone = "dark" }: Props) {
  const onLight = tone === "light";
  const href = `/products/${item.slug}`;

  return (
    /**
     * On a light surface the card is just a picture with words under it. On the
     * photographic backdrop it has to become a panel, because the field it sits
     * on is brown at the top and yellow at the bottom — white captions clear the
     * brown and vanish into the yellow, and no single text colour clears both.
     * Giving the caption its own white ground settles it wherever the wave
     * happens to fall, which is the point: the wave moves with the viewport and
     * the type cannot be made to dodge it.
     */
    <figure
      className={
        onLight ? "rounded-[28px] bg-white p-3 pb-4 shadow-[0_18px_40px_rgba(11,11,15,0.18)]" : ""
      }
    >
      <div className="relative aspect-square">
        <Link href={href} tabIndex={-1} aria-hidden className="block size-full">
          <div
            className={`relative size-full overflow-hidden bg-ink/5 ${
              onLight ? "rounded-[20px]" : "rounded-3xl"
            }`}
            // Inside a panel the picture is flush with it, so the lift belongs
            // to the panel and stacking a second one here reads as a sticker.
            style={onLight ? undefined : LIFT}
          >
            <ProductPhoto
              image={primaryImage(item)}
              name={item.name}
              slug={item.slug}
              swatch={item.swatch}
              priority={priority}
            />
          </div>
        </Link>
      </div>

      <figcaption className={onLight ? "mt-3.5 px-1" : "mt-4"}>
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
