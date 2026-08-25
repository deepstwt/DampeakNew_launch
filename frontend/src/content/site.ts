/**
 * Every string and image on the site lives here.
 * Later this becomes the CMS query result — same shape, so nothing else changes.
 *
 * Image-led by design: each block carries one photo and as few words as it can
 * get away with. All photography is placeholder until our own shoot lands.
 *
 * Copy source: site_copy.md at the repo root (the copy deck). Where the deck
 * still carries an author placeholder — "(material)" in every product's first
 * bullet — it is reproduced verbatim rather than invented around. Search this
 * file for MATERIAL_TBD to find them all.
 */

/** A real photograph. null until one exists for that product. */
export type ProductPhoto = { src: string; alt: string };

const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * The deck writes this as "(material)" because the compound has not been chosen
 * yet. One constant so the day it is decided is a one-line change, not four.
 */
const MATERIAL_TBD = "(material)";

/**
 * Every product's description follows the same three-part shape from the deck:
 * a section headline, one paragraph, then the reasons. Shared so a fifth product
 * cannot arrive with a different structure.
 */
const squeezeCopy = (product: string, design: string) => ({
  headline: "Soft, Satisfying & Made to Squeeze",
  body: `Meet your new favorite squeeze companion. Our ${product} is designed for satisfying, repetitive squeezing whenever you're anxious, stressed, and your hands need something to do. Its soft squishy texture and soft slow rising feel makes it enjoyable to squeeze again and again.`,
  reasonsTitle: "Why You'll Love It",
  reasons: [
    {
      title: "Soft & Satisfying",
      text: `Made with ${MATERIAL_TBD} for a soft, squeezable texture.`,
    },
    {
      title: "Made for Repeated Squeezing",
      text: "Designed to withstand regular use without easily losing its shape.",
    },
    { title: "Fun, Unique Design", text: design },
    {
      title: "Perfect Desk Companion",
      text: "Keep it at your desk, in your room, or anywhere you want a little hands-on activity.",
    },
    {
      title: "Great for Gifting",
      text: "A fun choice for birthdays, holidays, party favors, stocking stuffers, and more.",
    },
  ],
});

export const site = {
  name: "Dampeak",
  tagline: "Made for Better Everyday",

  /** Four products and one page about them — there is nothing else to navigate. */
  nav: [
    { label: "All products", href: "/products" },
    { label: "About", href: "/about" },
  ],

  hero: {
    headline: ["Made for", "Better", "Everyday"],
    /**
     * The deck's subheading. Long for a hero, and deliberately kept whole — it
     * is the only place the three product promises (comfort, relaxation, fun)
     * are named.
     */
    sub: "Thoughtfully designed products that make everyday life easier and better — from comfort, to relaxation, to fun.",
    primary: { label: "Own It Now", href: "/products" },
    /**
     * The four products. This is the whole catalogue — there is no fifth.
     *
     * `name` is the shelf name, short enough for a card. `fullName` is the
     * listing title from the deck, used as the page heading and in metadata,
     * because that is the string a search for "cheese cube stress toy" matches.
     *
     * `specs` mirrors the manufacturing sheet exactly (shape, theme, surface
     * finish, colour, edge profile) so the details table on each product page is
     * the spec, not a retelling of it.
     *
     * `accent` is a brand colour, one per product, so the palette still gets
     * taught across the row. It no longer means a category — every one of these
     * is a squishy, so categories would all say the same thing.
     *
     * Slugs are unchanged from launch on purpose: they are in the saved-products
     * collection and in every link already shared, so renaming the product does
     * not renumber the URL.
     *
     * `swatch` is sampled from the photograph rather than taken off the spec
     * sheet. It is what the colour dot beside each name is set from, and that
     * dot now sits next to the picture — so the picture is what it has to agree
     * with. It also tints the drawn product in the hero.
     *
     * TODO — needs real data before launch:
     *   price:  no figures supplied yet, so no price renders anywhere.
     */
    showcase: [
      {
        id: "blue-block",
        slug: "blue-block",
        name: "Rounded Cube",
        fullName: "Rounded cube stress squeeze squish Toy",
        accent: "bg-blue",
        fact: "Big enough to need a whole hand. Squeeze it flat, let go, and it takes its own time coming back.",
        description: squeezeCopy(
          "Rounded Cube Stress squeeze Toy",
          "The satisfying blue design gives it a calming feel, and makes it as fun to look at as it is to squeeze.",
        ),
        specs: {
          shape: "Rounded cube",
          theme: "Minimal",
          finish: "Smooth",
          colour: "Solid colour",
          edge: "Rounded",
        },
        swatch: "#33b6d6",
        // Photographed. The price is still outstanding.
        image: {
          src: "/products/blue-block.png",
          alt: "The Rounded Cube squishy: a translucent blue cube with softly rounded corners.",
        } as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "pillow-squish",
        slug: "pillow-squish",
        name: "Toasted Bread",
        fullName: "Toasted Bread stress squeeze squish Toy",
        accent: "bg-orange",
        fact: "Matte foam, not plastic. It gives immediately, which makes it the one you reach for without thinking.",
        description: squeezeCopy(
          "Toasted bread Stress squeeze Toy",
          "The beautiful toasted bread design makes it as fun to look at as it is to squeeze.",
        ),
        specs: {
          shape: "Pillow square",
          theme: "Food inspired",
          finish: "Matte foam",
          colour: "Pastel",
          edge: "Rounded",
        },
        swatch: "#f0aeba",
        // Photographed. The price is still outstanding.
        image: {
          src: "/products/pillow-squish.png",
          alt: "The Toasted Bread squishy beside its retail box, and a second one being squeezed in one hand.",
        } as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "cheese-cube",
        slug: "cheese-cube",
        name: "Cheese Cube",
        fullName: "Cheese cube stress squeeze squish Toy",
        accent: "bg-yellow",
        fact: "The moulded holes give your fingers somewhere to go, so it never lands in your hand the same way twice.",
        description: squeezeCopy(
          "Cheese Cube Stress squeeze Toy",
          "The intricate cheese design makes it as fun to look at as it is to squeeze.",
        ),
        specs: {
          shape: "Cube",
          theme: "Food inspired",
          finish: "Moulded texture",
          colour: "Bright yellow",
          edge: "Soft edges",
        },
        swatch: "#eeba3c",
        // Photographed. The price is still outstanding.
        image: {
          src: "/products/cheese-cube.png",
          alt: "The Cheese Cube squishy, moulded with holes on every face, with four miniature cheese cubes in front of it.",
        } as ProductPhoto | null,
        price: null as string | null,
      },
      {
        id: "marble-cube",
        slug: "marble-cube",
        name: "Marbled Cube",
        fullName: "Marbled cube stress squeeze squish Toy",
        accent: "bg-ink",
        fact: "No two are marbled alike. Smooth all over, so it slides between your fingers rather than catching.",
        description: squeezeCopy(
          "Marbled Cube Stress squeeze Toy",
          "The intricate marble design makes it as fun to look at as it is to squeeze.",
        ),
        specs: {
          shape: "Rounded cube",
          theme: "Modern abstract",
          finish: "Smooth",
          colour: "Marble swirl",
          edge: "Rounded",
        },
        swatch: "#b743bd",
        // Photographed. The price is still outstanding.
        image: {
          src: "/products/marble-cube.png",
          alt: "Marbled Cube squishies in five colourways beside the retail box, and one being squeezed in one hand.",
        } as ProductPhoto | null,
        price: null as string | null,
      },
    ],
  },

  /** Section 2 — the lineup, given its own heading rather than sharing the hero's. */
  showcase: {
    heading: "Shop Your Relaxation",
    cta: { label: "See all four", href: "/products" },
  },

  quote: {
    lead: "If it doesn't make life easier,",
    rest: "we don't make it.",
    source: "Our one rule",
  },

  /** Section 4 — the soft-moment band. */
  band: {
    line: "Something Soft for Stressful Moments",
    tagline:
      "Because sometimes anxiety and stress isn't loud, and a little squeeze is what you need at that moment.",
    cta: { label: "Start Squeezing", href: "/products" },
    image: {
      // TODO — placeholder. The deck's lifestyle shot (a hand squeezing the
      // toasted bread at a desk, the other three on a plate) is still being
      // generated; drop it in here and the section takes it as-is.
      src: u("1674475760738-8c7af859f821", 2000),
      alt: "A soft knitted blanket draped over a sofa",
    },
  },

  /**
   * The bottom of the products page.
   *
   * Deliberately worded as what the research observed, not as what the product
   * does: fidgeting rises with stress, so restless hands are worth giving
   * something to squeeze. It stops short of a therapeutic claim, which is a
   * promise we have no standing to make. See "What we won't do" in the About
   * page — the two have to keep agreeing.
   */
  research: {
    eyebrow: "Did You Know?",
    headline: "Sometimes, your hands just need something to do.",
    body: "Research has found that stress and anxiety can be accompanied by more repetitive hand movements and fidgeting. So when your hands feel a little restless, give them something satisfying to squeeze.",
    // TODO — the deck links the title; the URL was not supplied. Until it is,
    // the citation renders as plain text rather than as a link to nowhere.
    source: {
      title: "Effects of Anxiety on Spontaneous Ritualized Behavior",
      date: "20 July 2015",
      href: null as string | null,
    },
  },

  footer: {
    line: "Made for Better Everyday.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All products", href: "/products" },
          { label: "Rounded Cube", href: "/products/blue-block" },
          { label: "Toasted Bread", href: "/products/pillow-squish" },
          { label: "Cheese Cube", href: "/products/cheese-cube" },
          { label: "Marbled Cube", href: "/products/marble-cube" },
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
