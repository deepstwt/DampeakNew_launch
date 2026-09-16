# Source artwork

The files handed over, untouched. Nothing here is served — every asset the site
loads is a derivative built from these and committed under
`frontend/public/`.

| Source | Ships as | Made by |
|---|---|---|
| `Rounded cube stress squeeze squish Toy.png` | `public/products/blue-block-1.webp` | trim → square → pad → WebP |
| `Toasted Bread stress squeeze squish Toy.png` | `public/products/pillow-squish.webp` | trim → square → pad → WebP |
| `Cheese cube stress squeeze squish Toy.png` | — superseded, see below | — |
| `Marbled cube stress squeeze squish Toy.png` | `public/products/marble-cube.webp` | trim → square → pad → WebP |
| `New Logo.jpg` | `public/brand/dampeak.webp` | trim → cut out to transparency |
| `new_logo.png` | `public/brand/dampeak-brown.webp` | trim → resize (already had alpha) |
| `ShopPay.jpeg` / `PayPal.jpeg` / `GPay.jpeg` | `public/brand/pay/*.webp` | trim → re-pad on the brand's own field |
| `Contact page.png` | `public/lifestyle/contact.webp` | WebP at 1400px wide |
| `Product Gallery Cube/Rounded Cube1-3.png` | `public/products/blue-block-2…4.webp` | trim → square → pad → WebP |
| `Product Gallery image Toasted/Toasted1-4.png` | `public/products/pillow-squish-2…5.webp` | trim → square → pad → WebP |
| `Product Gallery Image Cheese/Cheese4.jpeg` | `public/products/cheese-cube-1.webp` | trim → square → pad → WebP |
| `Product Gallery Image Cheese/Cheese1-3.jpeg` | `public/products/cheese-cube-2…4.webp` | trim → square → pad → WebP |
| `Product Gallery Image Marble/Marble1-3.png` | `public/products/marble-cube-2…4.webp` | trim → square → pad → WebP |

**Products.** The four arrived at four aspect ratios with four different amounts
of air around the product, and every image slot on the site is square. Each is
trimmed of its white border, scaled into a 1200×1200 frame and re-padded to a
6% margin, so a row of four reads as one shoot instead of four separate photos.
One of them (Toasted Bread) includes the retail box and a hand alongside the
product — which is why the site contains rather than crops them. Crop any of
these to fill a square and the part that explains the product is the part that
goes.

The cheese is the exception: all four of its images are now photographs of the
real product, and its render is superseded. `Cheese cube stress squeeze squish
Toy.png` stays here as the source it was, but nothing is built from it any more.
Its replacement (`Cheese4.jpeg`) carries a lot of white, so it trims to 775px
and is enlarged into the frame rather than sitting smaller in it than the other
three products — a consistent margin is what makes a row of four read as one
shoot, and it is displayed at 548px at the very most.

**Gallery sets.** The four `Product Gallery *` folders are the rest of each
product's rail: the product alone, the product in a hand, and a second angle.
They arrive at two ratios (1151×1366 and 1254×1254) with their own amounts of
air, so they go through the same trim → square → pad as the packshots — without
it, one frame of a gallery shows the product small in the middle and the next
has it touching the edge. The packshot stays first in `images`, because that
first shot is also the product's card, its share preview and its cart thumbnail;
reordering the array changes all three.

**Logo.** Deep blue on a near-white field. On a white header that field shows as
a rectangle, so it is trimmed and cut out. The cut-out is a coverage map, not a
threshold: alpha is how far each pixel has travelled from the paper toward the
ink, and the ink is sampled from the solid interior rather than from the single
darkest pixel, which JPEG ringing had pushed darker than the mark really is.

**Wallets.** Each arrives on the flat field its owner drew it against, so the
derivative keeps that field and the checkout button takes it as a background
rather than sitting the mark on a colour of ours. They are trimmed and re-padded
to one ratio, because three logos supplied at three scales otherwise sit at three
different sizes in identical buttons. These are third-party marks: each brand
publishes its own button guidelines, and those are also where the approved dark
and light variants come from.

Replacing any of these means regenerating its derivative — the site does not
read this folder.

**And give the derivative a new filename when you do.** The same rule the logo
carries, for the same reason: artwork replaced under a name that already exists
stays cached under that URL — by the dev server's image optimiser here, by a CDN
in production, and by the browser of anyone who has already loaded the page. Both
packshots that changed hit exactly this. They went out as `blue-block.webp` and
`cheese-cube.webp`, kept serving the picture they used to hold, and are now
`blue-block-1.webp` and `cheese-cube-1.webp` — a new URL nothing can have a stale
copy of. A rail whose packshot has never been replaced keeps its unnumbered name
(`pillow-squish.webp`, `marble-cube.webp`); the number appears when the artwork
behind it does.
