# Source artwork

The files handed over, untouched. Nothing here is served — every asset the site
loads is a derivative built from these and committed under
`frontend/public/`.

| Source | Ships as | Made by |
|---|---|---|
| `Rounded cube stress squeeze squish Toy.png` | `public/products/blue-block.webp` | trim → square → pad → WebP |
| `Toasted Bread stress squeeze squish Toy.png` | `public/products/pillow-squish.webp` | trim → square → pad → WebP |
| `Cheese cube stress squeeze squish Toy.png` | `public/products/cheese-cube.webp` | trim → square → pad → WebP |
| `Marbled cube stress squeeze squish Toy.png` | `public/products/marble-cube.webp` | trim → square → pad → WebP |
| `New Logo.jpg` | `public/brand/dampeak.webp` | trim → cut out to transparency |

**Products.** The four arrived at four aspect ratios with four different amounts
of air around the product, and every image slot on the site is square. Each is
trimmed of its white border, scaled into a 1200×1200 frame and re-padded to a
6% margin, so a row of four reads as one shoot instead of four separate photos.
Two of them include the retail box and a hand alongside the product, which is
why the site contains rather than crops them.

**Logo.** Deep blue on a near-white field. On a white header that field shows as
a rectangle, so it is trimmed and cut out. The cut-out is a coverage map, not a
threshold: alpha is how far each pixel has travelled from the paper toward the
ink, and the ink is sampled from the solid interior rather than from the single
darkest pixel, which JPEG ringing had pushed darker than the mark really is.

Replacing any of these means regenerating its derivative — the site does not
read this folder.
