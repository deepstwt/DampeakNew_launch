/**
 * How a Dampeak product is drawn.
 *
 * There are no photographs of these four yet, so everywhere the site would show
 * one it shows this instead: the product as its own spec sheet describes it,
 * shaded like something that was lit and photographed rather than filled like a
 * shape. This module is the paint; it owns no canvas, no element and no loop.
 *
 * It was extracted from the hero's squeezable product, where it was written. The
 * hero passes a live soft-body outline that dents under the pointer; a product
 * card passes a body seeded at rest and paints once. Neither knows what the
 * other is doing, and both get the same object.
 *
 * The pass order is the whole trick, and it is the order a renderer would use:
 *
 *   1. base gradient      — light falls from above, so the bottom is darker
 *   2. surface            — holes, veins, bake; the thing that makes it *this* product
 *   3. key light          — one soft source, upper left, same as the backdrop field
 *   4. edge break         — the moulded corner radius, as a scaled inner outline
 *   5. occlusion          — the edges are darker than the middle. This is the pass
 *                           that turns a coloured shape into an object with volume
 *   6. subsurface + bounce— soft plastic is slightly translucent at its edges, and
 *                           the surface it sits on throws light back up at it
 *   7. seam               — moulded in two halves, like the real thing
 *   8. compression        — the dent under a press darkens, because it does
 *   9. grain              — a few percent of noise. Without it, every gradient
 *                           reads as vector art no matter how correct it is
 *
 * Everything from 1 to 9 is clipped to the silhouette handed in, so all of it
 * deforms with a squeeze instead of sliding around on top of it.
 */

import { createSoftBody, squircleRest, type RestShape, type SoftBody, type Tuning } from "@/lib/softbody";

/* ── Shape ───────────────────────────────────────────────────────────────── */

/**
 * A rounded cube, sitting very slightly squashed.
 *
 * The 0.96 on the vertical is what an object photographed from just above eye
 * level does — it is not a squarer square, it is a cube with weight in it. The
 * area scales linearly with that factor, so the pressure term stays honest.
 */
const squashed = (n: number, squash: number): RestShape => {
  const sq = squircleRest(n);
  return {
    at: (t) => {
      const u = sq.at(t);
      return { x: u.x, y: u.y * squash };
    },
    // Scaling one axis scales the area by exactly that factor, so this stays
    // exact and the pressure term keeps telling the truth.
    area: sq.area * squash,
  };
};

/**
 * Two silhouettes, because the spec sheet has two.
 *
 * A cube and a pillow are not the same object with different paint on it: the
 * pillow's corners are twice as generous and it sits wider than it is tall. Using
 * one shape for both was the thing that made the toasted bread look like a pink
 * version of the blue one rather than like a different product.
 */
export const SHAPES: Record<"cube" | "pillow", RestShape> = {
  cube: squashed(4, 0.96),
  pillow: squashed(2.5, 0.9),
};

export const shapeFor = (slug: string): keyof typeof SHAPES =>
  slug === "pillow-squish" ? "pillow" : "cube";

/** Finer than the backdrop field — these are looked at directly. */
export const POINTS = 72;

/**
 * Firmer than the drifting field, and deliberately under-smoothed.
 *
 * Smoothing is the term that fights the rest shape here: it pulls every point
 * toward the midpoint of its neighbours, and a corner is exactly where that
 * midpoint is furthest away. At the field's 0.2 over five passes the squircle
 * rounds off within a second and the thing reads as a ball. 0.1 over three passes
 * keeps the corners and still spreads a press into a curve instead of a spike.
 */
export const TUNING: Tuning = {
  memory: 0.075,
  damping: 0.93,
  smoothing: 0.1,
  pressure: 0.85,
  reach: 0.8,
  passes: 3,
};

/** A body with the right silhouette for this product. Nothing is seeded yet. */
export const bodyFor = (slug: string): SoftBody =>
  createSoftBody(POINTS, TUNING, SHAPES[shapeFor(slug)]);

/* ── Colour ──────────────────────────────────────────────────────────────── */

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/** Perceived lightness, 0..1. Decides how hard the shadows are allowed to be. */
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/** Mix toward white (t > 0) or toward ink (t < 0). */
const shade = (hex: string, t: number, alpha = 1) => {
  const [r, g, b] = rgb(hex);
  const to = t >= 0 ? [255, 255, 255] : [11, 11, 15];
  const k = Math.abs(t);
  return `rgba(${Math.round(r + (to[0] - r) * k)},${Math.round(g + (to[1] - g) * k)},${Math.round(b + (to[2] - b) * k)},${alpha})`;
};

/* ── Surfaces ────────────────────────────────────────────────────────────── */

const HOLES = [
  [-0.34, -0.3, 0.17],
  [0.28, -0.4, 0.11],
  [0.42, 0.12, 0.16],
  [-0.12, 0.3, 0.2],
  [-0.52, 0.24, 0.1],
  [0.06, -0.08, 0.13],
  [0.3, 0.5, 0.09],
] as const;

/**
 * Deterministic noise. The toasted top needs a scatter dense enough to read as
 * baking rather than as seven dots, and a hand-written list that size is just
 * noise typed out by hand. Seeded so every visitor gets the same loaf — and so a
 * screenshot taken twice is the same screenshot.
 */
const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Pulled toward the middle, so the crust stays clear like a real toasted top. */
const SPECKS = (() => {
  const rnd = mulberry(7);
  return Array.from({ length: 34 }, () => {
    const a = rnd() * Math.PI * 2;
    // Two samples averaged: a flat radius scatters evenly to the edges, this
    // clusters without needing a rejection loop.
    const r = ((rnd() + rnd()) / 2) * 0.62;
    return [Math.cos(a) * r, Math.sin(a) * r, 0.012 + rnd() * 0.032, 0.28 + rnd() * 0.34] as const;
  });
})();

/**
 * Marble veins: two tones, five paths, none of them the same width.
 *
 * Three even arcs of one colour was the first attempt and it read as three pen
 * strokes. Marble is a few heavy veins with lighter ones branching off, so the
 * widths vary by a factor of two and the darker tone sits under the lighter.
 */
const VEINS = [
  { p: [-0.95, -0.3, -0.3, -0.85, 0.35, -0.1, 1.0, -0.5], w: 0.05, c: "rgba(255,255,255,0.5)" },
  { p: [-1.0, 0.08, -0.35, -0.3, 0.3, 0.4, 1.0, 0.02], w: 0.026, c: "rgba(255,255,255,0.34)" },
  { p: [-0.95, 0.5, -0.25, 0.12, 0.4, 0.75, 1.0, 0.42], w: 0.055, c: "rgba(74,20,140,0.32)" },
  { p: [-0.85, 0.85, -0.2, 0.5, 0.45, 1.0, 0.95, 0.78], w: 0.03, c: "rgba(255,255,255,0.38)" },
  { p: [-0.65, -0.95, -0.1, -0.5, 0.45, -0.9, 0.9, -0.62], w: 0.02, c: "rgba(74,20,140,0.28)" },
] as const;

type Surface = "smooth" | "holes" | "speckle" | "marble";

const SURFACE: Record<string, Surface> = {
  "cheese-cube": "holes",
  "pillow-squish": "speckle",
  "marble-cube": "marble",
  "blue-block": "smooth",
};

/** Matte foam takes more grain and no specular; the moulded ones take a seam. */
const MATTE: Record<Surface, boolean> = {
  smooth: false,
  holes: false,
  marble: false,
  speckle: true,
};

/**
 * A noise tile, built once for the whole page and shared.
 *
 * Every gradient here is mathematically smooth, and smooth is exactly what a
 * photograph is not. A few percent of grain over the body is the difference
 * between "rendered" and "shot". Built lazily: this module is imported by client
 * components, but importing it must not touch the DOM.
 */
let tile: HTMLCanvasElement | null | undefined;

const grainTile = () => {
  if (tile !== undefined) return tile;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) {
    tile = null;
    return tile;
  }
  const img = g.createImageData(128, 128);
  const rnd = mulberry(23);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + rnd() * 90;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  tile = c;
  return tile;
};

/* ── Paint ───────────────────────────────────────────────────────────────── */

/** One place the body is being pressed, already normalised. */
export type Contact = {
  x: number;
  y: number;
  /** Absolute influence radius, in the same units as `radius`. */
  radius: number;
  /** 0..1. How hard, as a fraction of a full squeeze. */
  strength: number;
};

export type PaintOptions = {
  /** Only these two fields are read, so a card can pass its own row. */
  product: { slug: string; swatch: string };
  cx: number;
  cy: number;
  radius: number;
  /** Lays the silhouette into the current path. Does not begin or close it. */
  trace: (ctx: CanvasRenderingContext2D) => void;
  contacts?: (Contact | null)[];
  /** 0..1, how far the body is compressed. Only the ground shadow reads it. */
  squeeze?: number;
  /** The two ground shadows. Off for a thumbnail with no room under it. */
  ground?: boolean;
};

export function paintProduct(ctx: CanvasRenderingContext2D, opts: PaintOptions) {
  const { product: p, cx, cy, radius, trace, contacts = [], squeeze = 0, ground = true } = opts;

  const surface = SURFACE[p.slug] ?? "smooth";
  const matte = MATTE[surface];
  const lum = luminance(p.swatch);

  const path = (scale = 1) => {
    ctx.beginPath();
    if (scale === 1) {
      trace(ctx);
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
      trace(ctx);
      ctx.restore();
    }
    ctx.closePath();
  };

  /** Fill the whole clipped area. Cheaper than re-tracing the path to fill it. */
  const flood = (style: string | CanvasGradient | CanvasPattern) => {
    ctx.fillStyle = style;
    ctx.fillRect(cx - radius * 2.2, cy - radius * 2.2, radius * 4.4, radius * 4.4);
  };

  /* Ground. Two shadows, because one never looks right: a tight dark contact
     patch that says where it touches, and a wide soft pool that says how far the
     light wraps. Both tighten as it is pressed — a squeezed body sits lower and
     spreads. */
  if (ground) {
    for (const [rk, sy, a] of [
      [1.18, 0.14, 0.15],
      [0.62, 0.09, 0.3],
    ] as const) {
      ctx.save();
      ctx.translate(cx, cy + radius * (1.0 + squeeze * 0.04));
      ctx.scale(1 + squeeze * 0.06, sy * (1 - squeeze * 0.15));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * rk);
      g.addColorStop(0, `rgba(11,11,15,${a})`);
      g.addColorStop(0.6, `rgba(11,11,15,${a * 0.45})`);
      g.addColorStop(1, "rgba(11,11,15,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, radius * rk, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  path();
  ctx.save();
  ctx.clip();

  /* 1. Base. Lighter at the top because the light is above it. */
  const base = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  base.addColorStop(0, shade(p.swatch, 0.16));
  base.addColorStop(0.45, p.swatch);
  base.addColorStop(1, shade(p.swatch, -0.18));
  flood(base);

  /* 1b. Transmission. These are cast in something soft and slightly translucent,
         so light gets through the thin part at the bottom and comes back out
         brighter than the body above it. A body that only darkens toward the
         ground reads as solid rubber; this is what makes it read as jelly. Foam
         does not transmit, so it is skipped. */
  if (!matte) {
    const through = ctx.createRadialGradient(
      cx,
      cy + radius * 0.95,
      radius * 0.05,
      cx,
      cy + radius * 0.95,
      radius * 0.95,
    );
    through.addColorStop(0, shade(p.swatch, 0.5, 0.5));
    through.addColorStop(0.55, shade(p.swatch, 0.35, 0.16));
    through.addColorStop(1, shade(p.swatch, 0.3, 0));
    flood(through);
  }

  /* 2. Surface — the part that makes it this product and not another. */
  if (surface === "holes") {
    for (const [hx, hy, hr] of HOLES) {
      const x = cx + hx * radius;
      const y = cy + hy * radius;
      const r = hr * radius;

      // A hole is dark all the way to its edge and then stops. Fading the
      // darkness out at the rim — the obvious way to write this — is what made
      // the first pass look like seven brown smudges.
      const g = ctx.createRadialGradient(x, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, "rgba(92,58,0,0.72)");
      g.addColorStop(0.72, "rgba(120,78,0,0.62)");
      g.addColorStop(1, "rgba(176,120,0,0.42)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // The lit far wall. One bright arc on the side away from the key light is
      // what tells the eye this is a pit and not a spot.
      ctx.strokeStyle = "rgba(255,236,150,0.55)";
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.92, Math.PI * 0.1, Math.PI * 0.85);
      ctx.stroke();
    }
  }

  if (surface === "speckle") {
    const bake = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.8);
    bake.addColorStop(0, "rgba(214,110,120,0.35)");
    bake.addColorStop(1, "rgba(214,110,120,0)");
    flood(bake);

    for (const [sx, sy, sr, a] of SPECKS) {
      ctx.fillStyle = `rgba(188,74,92,${a})`;
      ctx.beginPath();
      ctx.arc(cx + sx * radius, cy + sy * radius, sr * radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (surface === "marble") {
    ctx.lineCap = "round";
    for (const vein of VEINS) {
      const [x1, y1, c1x, c1y, c2x, c2y, x2, y2] = vein.p;
      ctx.strokeStyle = vein.c;
      ctx.lineWidth = radius * vein.w;
      ctx.beginPath();
      ctx.moveTo(cx + x1 * radius, cy + y1 * radius);
      ctx.bezierCurveTo(
        cx + c1x * radius,
        cy + c1y * radius,
        cx + c2x * radius,
        cy + c2y * radius,
        cx + x2 * radius,
        cy + y2 * radius,
      );
      ctx.stroke();
    }
  }

  /* 3. Key light. One source, upper left, the same direction the backdrop field
        uses, so the two read as the same material at two scales. */
  const key = ctx.createRadialGradient(
    cx - radius * 0.44,
    cy - radius * 0.5,
    radius * 0.02,
    cx - radius * 0.22,
    cy - radius * 0.28,
    radius * 1.25,
  );
  key.addColorStop(0, "rgba(255,255,255,0.34)");
  key.addColorStop(0.35, "rgba(255,255,255,0.07)");
  key.addColorStop(1, "rgba(255,255,255,0)");
  flood(key);

  /* 4. The edge break. A moulded cube has a corner radius, and the boundary
        between that radius and the flat face catches light on the top and loses
        it on the bottom. Drawn as the same outline scaled inward — one faint
        line that does more for "this is a real object" than any amount of extra
        gradient.

        Skipped on foam: a cast foam pillow has no moulded corner break, and
        drawing one put a visible contour line inside a soft object. */
  if (!matte) {
    const breakGrad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
    breakGrad.addColorStop(0, "rgba(255,255,255,0.18)");
    breakGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
    breakGrad.addColorStop(1, "rgba(11,11,15,0.08)");
    ctx.strokeStyle = breakGrad;
    ctx.lineWidth = Math.max(1, radius * 0.013);
    path(0.91);
    ctx.stroke();
  }

  /* 5. Occlusion. Clipped to the body and stroked wide, so only the inner half
        of the stroke lands: the edges go dark, the middle stays lit. Two passes,
        because real falloff is not linear.

        In the product's own hue, and weaker the paler the product. Neutral ink
        at a fixed strength is correct for the blue and completely wrong for the
        pastel — on pink it stopped reading as shadow and started reading as a
        grey frame around a picture. Shadow on a pink object is dark pink. */
  const ao = 0.55 + (1 - lum) * 0.7;
  ctx.strokeStyle = shade(p.swatch, -0.62, (matte ? 0.13 : 0.2) * ao);
  ctx.lineWidth = radius * (matte ? 0.44 : 0.36);
  path();
  ctx.stroke();
  // The second, tighter pass is what gives a moulded body its crisp edge. On
  // foam it reads as a drawn ring, so foam gets the wide pass only.
  if (!matte) {
    ctx.strokeStyle = shade(p.swatch, -0.66, 0.24 * ao);
    ctx.lineWidth = radius * 0.09;
    path();
    ctx.stroke();
  }

  /* 6. Subsurface, then bounce. Soft plastic passes light at its thin edges, so
        the rim is a lighter version of its own colour rather than white; the
        surface underneath throws a cooler light back up at the bottom. */
  if (!matte) {
    ctx.strokeStyle = shade(p.swatch, 0.55, 0.26);
    ctx.lineWidth = radius * 0.022;
    path(0.995);
    ctx.stroke();
  }

  const bounce = ctx.createLinearGradient(cx, cy + radius * 0.2, cx, cy + radius);
  bounce.addColorStop(0, "rgba(255,255,255,0)");
  bounce.addColorStop(1, `rgba(255,255,255,${matte ? 0.16 : 0.3})`);
  ctx.strokeStyle = bounce;
  ctx.lineWidth = radius * (matte ? 0.08 : 0.05);
  path(0.99);
  ctx.stroke();

  /* 7. The seam. Moulded in two halves, and the join shows — a hair of shadow
        with a hair of highlight under it. Foam is cast, not moulded, so the
        toasted one has none. */
  if (!matte) {
    ctx.lineWidth = Math.max(1, radius * 0.012);
    ctx.strokeStyle = "rgba(11,11,15,0.1)";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.1, cy + radius * 0.07);
    ctx.bezierCurveTo(
      cx - radius * 0.4,
      cy + radius * 0.16,
      cx + radius * 0.4,
      cy + radius * 0.16,
      cx + radius * 1.1,
      cy + radius * 0.05,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.1, cy + radius * 0.09);
    ctx.bezierCurveTo(
      cx - radius * 0.4,
      cy + radius * 0.18,
      cx + radius * 0.4,
      cy + radius * 0.18,
      cx + radius * 1.1,
      cy + radius * 0.07,
    );
    ctx.stroke();
  }

  /* 8. Compression. The silhouette already dents; without this the dent has no
        shading in it and the squeeze reads as a shape change rather than as
        material being displaced. */
  for (const c of contacts) {
    if (!c) continue;
    const dent = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
    dent.addColorStop(0, `rgba(11,11,15,${0.26 * c.strength})`);
    dent.addColorStop(0.55, `rgba(11,11,15,${0.1 * c.strength})`);
    dent.addColorStop(1, "rgba(11,11,15,0)");
    flood(dent);

    // The material has to go somewhere: a soft bulge of light just outside the
    // dent, which is what makes it look full rather than dented in.
    const bulge = ctx.createRadialGradient(
      c.x,
      c.y,
      c.radius * 0.8,
      c.x,
      c.y,
      c.radius * 1.5,
    );
    bulge.addColorStop(0, "rgba(255,255,255,0)");
    bulge.addColorStop(0.5, `rgba(255,255,255,${0.16 * c.strength})`);
    bulge.addColorStop(1, "rgba(255,255,255,0)");
    flood(bulge);
  }

  /* 9. Grain. Last, over everything, at a few percent. */
  const grain = grainTile();
  const pattern = grain ? ctx.createPattern(grain, "repeat") : null;
  if (pattern) {
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = matte ? 0.1 : 0.05;
    flood(pattern);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();

  /* Specular, outside the clip so it can sit right on the edge. Gloss gets a
     tight hotspot and a hard glint; matte foam gets neither, which is the
     difference you can see between the pillow and the other three. */
  const hx = cx - radius * 0.42;
  const hy = cy - radius * 0.46;
  ctx.save();
  path(0.97);
  ctx.clip();
  // Matte foam still catches light — it just scatters it over a wide area
  // instead of returning a hotspot. Giving it no specular at all was what made
  // the pastel look like a flat shape next to three lit objects.
  const wide = matte ? 0.62 : 0.34;
  const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius * wide);
  spec.addColorStop(0, `rgba(255,255,255,${matte ? 0.2 : 0.62})`);
  spec.addColorStop(0.5, `rgba(255,255,255,${matte ? 0.07 : 0.16})`);
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.ellipse(hx, hy, radius * wide, radius * wide * 0.7, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // The glint is the one thing foam does not do.
  if (!matte) {
    const glint = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius * 0.075);
    glint.addColorStop(0, "rgba(255,255,255,0.85)");
    glint.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(hx, hy, radius * 0.075, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
