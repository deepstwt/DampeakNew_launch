/**
 * Every string and image on the site lives here.
 * Later this becomes the CMS query result — same shape, so nothing else changes.
 *
 * Image-led by design: each block carries one photo and as few words as it can
 * get away with. All photography is placeholder until our own shoot lands.
 */

/** A real photograph. null until one exists for that product. */
export type ProductPhoto = { src: string; alt: string };

const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const site = {
  name: "Dampeak",
  tagline: "Small things that make the day easier.",

  /** Four products and one page about them — there is nothing else to navigate. */
  nav: [
    { label: "All products", href: "/products" },
    { label: "About", href: "/about" },
  ],

  hero: {
    headline: ["Everyday", "things,", "made easier."],
    primary: { label: "See all four", href: "/products" },
    secondary: { label: "What we won't do", href: "/about" },
    /**
     * The four products. This is the whole catalogue — there is no fifth.
     *
     * `specs` mirrors the manufacturing sheet exactly (shape, theme, surface
     * finish, colour, edge profile) so the details table on each product page is
     * the spec, not a retelling of it.
     *
     * `accent` is a brand colour, one per product, so the palette still gets
     * taught across the row. It no longer means a category — every one of these
     * is a squishy, so categories would all say the same thing.
     *
     * TODO — needs real data before launch:
     *   price:  no figures supplied yet, so no price renders anywhere.
     *   image:  placeholder tiles show each product's real colour. Drop in
     *           photographs and they replace the tiles automatically.
     */
    showcase: [
      {
        id: "blue-block",
        slug: "blue-block",
        name: "Blue Block",
        accent: "bg-blue",
        fact: "Big enough to need a whole hand. Squeeze it flat, let go, and it takes its own time coming back.",
        specs: {
          shape: "Rounded cube",
          theme: "Minimal",
          finish: "Smooth",
          colour: "Solid colour",
          edge: "Rounded",
        },
        swatch: "#1f3cff",
        // Fill these two in and the UI picks them up with no code change.
        image: null as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "pillow-squish",
        slug: "pillow-squish",
        name: "Pillow Squish",
        accent: "bg-orange",
        fact: "Matte foam, not plastic. It gives immediately, which makes it the one you reach for without thinking.",
        specs: {
          shape: "Pillow square",
          theme: "Food inspired",
          finish: "Matte foam",
          colour: "Pastel",
          edge: "Rounded",
        },
        swatch: "#f7b6c2",
        // Fill these two in and the UI picks them up with no code change.
        image: null as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "cheese-cube",
        slug: "cheese-cube",
        name: "Cheese Cube",
        accent: "bg-yellow",
        fact: "The moulded holes give your fingers somewhere to go, so it never lands in your hand the same way twice.",
        specs: {
          shape: "Cube",
          theme: "Food inspired",
          finish: "Moulded texture",
          colour: "Bright yellow",
          edge: "Soft edges",
        },
        swatch: "#ffce00",
        // Fill these two in and the UI picks them up with no code change.
        image: null as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "marble-cube",
        slug: "marble-cube",
        name: "Marble Cube",
        accent: "bg-ink",
        fact: "No two are marbled alike. Smooth all over, so it slides between your fingers rather than catching.",
        specs: {
          shape: "Rounded cube",
          theme: "Modern abstract",
          finish: "Smooth",
          colour: "Marble swirl",
          edge: "Rounded",
        },
        swatch: "#8b5cf6",
        // Fill these two in and the UI picks them up with no code change.
        image: null as ProductPhoto | null,
        price: null as string | null,
      },
    ],
  },

  quote: {
    lead: "If it doesn't help,",
    rest: "we don't make it.",
    source: "Our one rule",
  },

  band: {
    line: "Nothing precious. Everything useful.",
    cta: { label: "See all four", href: "/products" },
    image: {
      src: u("1674475760738-8c7af859f821", 2000),
      alt: "A chunky knitted blanket draped over a sofa",
    },
  },
  footer: {
    line: "Small things. Easier days.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All products", href: "/products" },
          { label: "Blue Block", href: "/products/blue-block" },
          { label: "Pillow Squish", href: "/products/pillow-squish" },
          { label: "Cheese Cube", href: "/products/cheese-cube" },
          { label: "Marble Cube", href: "/products/marble-cube" },
        ],
      },
      {
        title: "Dampeak",
        links: [
          { label: "About us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Questions", href: "/faq" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "Shipping", href: "/shipping" },
          { label: "Returns", href: "/returns" },
          { label: "Terms of sale", href: "/terms" },
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
      { label: "Email us", href: "mailto:hello@dampeak.com" },
    ],
  },
} as const;

/**
 * The catalogue. Products live under hero.showcase because the hero is where the
 * spread is presented; this alias is what the rest of the app should import, so
 * moving them later is a one-line change here rather than a find-and-replace.
 */
export const PRODUCTS = site.hero.showcase;

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

/**
 * Where each product is actually sold.
 *
 * This site is the pitch; Amazon is the checkout. Paste a listing URL here and
 * that product's page switches from a disabled "Currently unavailable" button to a
 * live "Buy Now". Nothing else needs changing — the structured data follows it.
 *
 * Kept as Record<string, string> rather than folded into the `as const` product
 * data on purpose: this is the field expected to change most often, and an empty
 * string here has to stay assignable to a real URL later.
 */
export const AMAZON_URLS: Record<string, string> = {
  "blue-block": "",
  "pillow-squish": "",
  "cheese-cube": "",
  "marble-cube": "",
};

/** null rather than "" so callers branch on presence, not on emptiness. */
export const getAmazonUrl = (slug: string) => AMAZON_URLS[slug]?.trim() || null;


