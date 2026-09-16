/**
 * Every string and image on the site lives here.
 * Later this becomes the CMS query result — same shape, so nothing else changes.
 *
 * Image-led by design: each block carries one photo and as few words as it can
 * get away with. All photography is placeholder until our own shoot lands.
 *
 * Copy source: site_copy.md at the repo root (the copy deck). Where the deck
 * carries an author placeholder, the copy around it is cut rather than shipped
 * with brackets in it — see the note on `reasons` below.
 */

/**
 * A real photograph. A product's `images` is every shot of it, in the order they
 * are shown; the first is the one that stands for the product everywhere else —
 * the card, the metadata, the structured data. An empty array means no
 * photography yet, and the product is drawn instead.
 *
 * What is in public/products is not the file that was handed over — it is that
 * file trimmed of its white border, scaled into a square and re-padded to a
 * fixed margin. The originals arrive at four different aspect ratios with four
 * different amounts of air around the product, and every slot on this site is
 * square: dropped in as they came, one product sat small in the middle of a tile
 * while the next one filled it. Squaring them is what makes a row of four look
 * like one shoot. The untouched originals are in design/ at the repo root.
 */
export type ProductPhoto = { src: string; alt: string };

/**
 * Every product's description, as four headed sections.
 *
 * The copy is the same for all four but for two places — the name in the first
 * line and the subject of the gift sentence — so it is written once here rather
 * than four times in the catalogue below. The gift subject is its own parameter
 * because it is not always the product's name: the toasted bread is "the Toasted
 * Bread squish" in that sentence and the others are not.
 */
const squeezeCopy = (name: string, giftSubject: string) => [
  {
    heading: "Soft satisfying squeeze",
    body: [
      `This slow-rising ${name} squishy is soft, and very satisfying to squeeze.`,
      "Easy to keep nearby and fun to pick up whenever you feel like fidgeting, playing, or just enjoying the feel of something soft in your hands.",
    ],
  },
  {
    heading: "Safe soft material",
    body: [
      "This stress relief squishy toy gives a simple, direct satisfaction. Its non-toxic TPR material provides a smooth, and gentle feel and rebound with every squeeze, making it satisfying to handle.",
    ],
  },
  {
    heading: "Perfect for every scenario",
    body: [
      "Keep it at your desk during homework or work, take it along on a road trip, keep it nearby during movie nights, or toss it in your bag for something to squeeze on the go. It's a fun little companion for kids, teens, and adults alike, whether you're looking for something to keep your hands busy, add a little fun to your day, or simply enjoy a satisfying squeeze.",
    ],
  },
  {
    heading: "A perfect little gift",
    body: [
      `${giftSubject} makes an easy and fun little gift for birthdays, holidays, Christmas, stocking stuffers, party favors, or a just-because surprise. Tuck one into a stocking, add it to a gift bag, or give it on its own to someone who loves fun, tactile things.`,
      "Sometimes the best gifts are the ones you can't help but squeeze.",
    ],
  },
];

/**
 * The three things a product page says under its price, before the description.
 *
 * The same three on all four, because they are true of all four — who it is for,
 * what it does, and what it is bought as. They replace the one-line `fact` that
 * used to sit here, which was a different sentence per product and described the
 * material ("matte foam, not plastic") to someone who has not decided to care yet.
 *
 * `icon` names a drawing in ProductHighlights rather than carrying an emoji.
 * Emoji are a font, not artwork: 🧑 renders as a different person on every
 * platform and as a blank box where the font is missing, and none of them can be
 * asked to match the stroke weight of the rest of this page.
 */
export const HIGHLIGHTS = [
  { icon: "age", label: "14+" },
  { icon: "squeeze", label: "Satisfying Squeeze" },
  { icon: "gift", label: "Perfect Gift" },
] as const;

export type Highlight = (typeof HIGHLIGHTS)[number];

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
     * `name` is the product's name, and there is only one of it: the heading on
     * its page, the card, the breadcrumb, the checkout line, the <title>, the
     * share preview and the structured data all print this string.
     *
     * There used to be two — a short shelf name for the heading and a longer
     * listing title underneath it — which read as two products with similar
     * names rather than as one product named once. Keeping the listing title as
     * the name is what lets the second field go: it already carries the words
     * someone types into a search box, so nothing is left for a `fullName` to
     * do that this does not.
     *
     * `fact` is the one-line description, and it is also no longer on the page:
     * it is the meta and share description, which is where a sentence about how
     * the thing feels does its work — in a search result, before the visitor has
     * arrived. On the page it sat between the price and the three highlights,
     * saying something about the material to someone still deciding whether they
     * want one at all.
     *
     * `specs` mirrors the manufacturing sheet exactly (shape, theme, surface
     * finish, colour, edge profile) so the details table on each product page is
     * the spec, not a retelling of it.
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
     * `price` is a display string, and the currency in it is the currency the
     * structured data publishes — see the Offer in the product page. Changing
     * "$" here without changing that leaves search engines quoting the number
     * in the wrong money.
     */
    showcase: [
      {
        id: "blue-block",
        slug: "blue-block",
        name: "Rounded Cube Squeeze Toy",
        fact: "Big enough to need a whole hand. Squeeze it flat, let go, and it takes its own time coming back.",
        description: squeezeCopy(
          "Rounded Cube",
          "The Rounded Cube",
        ),
        specs: {
          shape: "Rounded cube",
          theme: "Minimal",
          finish: "Smooth",
          colour: "Solid colour",
          edge: "Rounded",
        },
        swatch: "#33b6d6",
        images: [
          {
            src: "/products/blue-block.webp",
            alt: "The Rounded Cube squishy tipped onto one corner: a translucent blue cube with softly rounded edges.",
          },
          {
            src: "/products/blue-block-2.webp",
            alt: "The Rounded Cube squishy alone on white, its glassy faces catching the light.",
          },
          {
            src: "/products/blue-block-3.webp",
            alt: "The Rounded Cube squishy squeezed in one hand, its faces buckling inward around the fingers.",
          },
          {
            src: "/products/blue-block-4.webp",
            alt: "The Rounded Cube squishy from a lower angle, showing the rippled surface of its top face.",
          },
        ] as ProductPhoto[],
        price: "$14.99" as string | null,
      },
      {
        id: "pillow-squish",
        slug: "pillow-squish",
        name: "Toasted Bread Squeeze Toy",
        fact: "Matte foam, not plastic. It gives immediately, which makes it the one you reach for without thinking.",
        description: squeezeCopy(
          "Toasted Bread",
          "The Toasted Bread squish",
        ),
        specs: {
          shape: "Pillow square",
          theme: "Food inspired",
          finish: "Matte foam",
          colour: "Pastel",
          edge: "Rounded",
        },
        swatch: "#f0aeba",
        images: [
          {
            src: "/products/pillow-squish.webp",
            alt: "The Toasted Bread squishy beside its retail box, and a second one being squeezed in one hand.",
          },
          {
            src: "/products/pillow-squish-2.webp",
            alt: "The Toasted Bread squishy face on, its pink centre freckled like a toasted crust.",
          },
          {
            src: "/products/pillow-squish-3.webp",
            alt: "The Toasted Bread squishy pressed deeply with a thumb, dimpling in one hand.",
          },
          {
            src: "/products/pillow-squish-4.webp",
            alt: "Two Toasted Bread squishies resting one behind the other.",
          },
          {
            src: "/products/pillow-squish-5.webp",
            alt: "The Toasted Bread squishy at an angle, showing how thick and pillowed it is.",
          },
        ] as ProductPhoto[],
        price: "$14.99" as string | null,
      },
      {
        id: "cheese-cube",
        slug: "cheese-cube",
        name: "Cheese Cube Squeeze Toy",
        fact: "The moulded holes give your fingers somewhere to go, so it never lands in your hand the same way twice.",
        description: squeezeCopy(
          "Cheese Cube",
          "The Cheese Cube",
        ),
        specs: {
          shape: "Cube",
          theme: "Food inspired",
          finish: "Moulded texture",
          colour: "Bright yellow",
          edge: "Soft edges",
        },
        swatch: "#eeba3c",
        images: [
          {
            src: "/products/cheese-cube.webp",
            alt: "The Cheese Cube squishy on white, moulded with holes across every face.",
          },
          {
            src: "/products/cheese-cube-2.webp",
            alt: "One Cheese Cube squishy crushed in a fist, beside a second one left uncompressed.",
          },
          {
            src: "/products/cheese-cube-3.webp",
            alt: "Three views of the Cheese Cube squishy: the cube itself, and it being squeezed from either side.",
          },
          {
            src: "/products/cheese-cube-4.webp",
            alt: "Three Cheese Cube squishies together, one of them pressed flat under a finger.",
          },
        ] as ProductPhoto[],
        price: "$14.99" as string | null,
      },
      {
        id: "marble-cube",
        slug: "marble-cube",
        name: "Marbled Cube Squeeze Toy",
        fact: "No two are marbled alike. Smooth all over, so it slides between your fingers rather than catching.",
        description: squeezeCopy(
          "Marbled Cube",
          "The Marbled Cube",
        ),
        specs: {
          shape: "Rounded cube",
          theme: "Modern abstract",
          finish: "Smooth",
          colour: "Marble swirl",
          edge: "Rounded",
        },
        swatch: "#b743bd",
        images: [
          {
            src: "/products/marble-cube.webp",
            alt: "Four Marbled Cube squishies stacked together — purple, orange, blue and green, each marbled differently.",
          },
          {
            src: "/products/marble-cube-2.webp",
            alt: "The Marbled Cube squishy in purple, pink and white swirls, alone on white.",
          },
          {
            src: "/products/marble-cube-3.webp",
            alt: "The Marbled Cube squishy squeezed in one hand until its sides fold.",
          },
          {
            src: "/products/marble-cube-4.webp",
            alt: "The Marbled Cube squishy held in the fingertips, one corner still unsqueezed.",
          },
        ] as ProductPhoto[],
        price: "$14.99" as string | null,
      },
    ],
  },

  /** Section 2 — the lineup, given its own heading rather than sharing the hero's. */
  showcase: {
    heading: "Shop Your Relaxation",
    cta: { label: "See all four", href: "/products" },
  },

  quote: {
    lead: "If it doesn't make life better,",
    rest: "we don't make it.",
    source: "Our one rule",
  },

  /** Section 4 — the soft-moment band. */
  band: {
    line: "Something Soft for Stressful Moments",
    tagline:
      "Because sometimes anxiety and stress isn't loud, and a little squeeze is what you need at that moment.",
    cta: { label: "Start Squeezing", href: "/products" },
    /**
     * The lifestyle shot, at last — and the right object this time: the thing in
     * his hand is one of ours, being squeezed, which is what the headline is
     * about. The stand-in it replaces was a stock knitted blanket.
     *
     * The composition decides where the type goes. He sits in the left half and
     * looks across to the right, so the copy sits in the right half: the empty
     * half of the frame, and the one his eyeline already points at. Moving the
     * copy left would lay it over him and make him look past it at nothing.
     */
    image: {
      src: "/lifestyle/soft-moments.webp",
      alt: "A man sitting outside in an evening garden, squeezing a yellow squishy in one hand.",
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
          { label: "Rounded Cube Squeeze Toy", href: "/products/blue-block" },
          { label: "Toasted Bread Squeeze Toy", href: "/products/pillow-squish" },
          { label: "Cheese Cube Squeeze Toy", href: "/products/cheese-cube" },
          { label: "Marbled Cube Squeeze Toy", href: "/products/marble-cube" },
        ],
      },
      {
        title: "Dampeak",
        links: [
          { label: "About us", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        /**
         * The two policies with finished copy, under the names the documents
         * themselves carry. Questions and Shipping are not linked here because
         * they no longer exist — both were removed from DOCS.
         *
         * Terms of sale does still exist and is deliberately not in this column
         * while its copy is the placeholder draft; it stays reachable from the
         * legal row below and from every other policy page.
         */
        title: "Help",
        links: [
          { label: "Refund & Return Policy", href: "/returns" },
          { label: "Privacy Policy", href: "/privacy" },
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
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
 * The shot that stands for the product: its card, its share preview, its
 * structured data. null while a product has no photography.
 *
 * Everywhere outside the gallery wants one image, and every one of those places
 * would otherwise carry its own `images[0] ?? null` and its own opinion about
 * what happens when the array is empty.
 */
export const primaryImage = (p: { images: readonly ProductPhoto[] }) =>
  p.images[0] ?? null;

