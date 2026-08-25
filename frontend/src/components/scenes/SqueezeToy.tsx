"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { PRODUCTS } from "@/content/site";
import { createSoftBody, squircleRest, type RestShape, type Tuning } from "@/lib/softbody";

/**
 * The hero's right half: one of the four products, actual size, actually squishy.
 *
 * The hero was type on the left and nothing on the right. What belongs in that
 * space is not more type or a stock photograph — it is the thing being sold, in
 * the only state that matters for a squishy: being pressed. There are no product
 * photographs yet, and this is not pretending to be one. It is the product's
 * behaviour, which a photograph could not show anyway.
 *
 * It has to survive being looked at directly, next to a nav bar and a 150px
 * headline, so it is shaded like a photographed object rather than filled like a
 * shape. The pass order below is the whole trick, and it is the order a renderer
 * would use:
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
 *   8. compression        — the dent under the press darkens, because it does
 *   9. grain              — a few percent of noise. Without it, every gradient
 *                           reads as vector art no matter how correct it is
 *
 * Everything above is clipped to the silhouette the solver produces, so all of it
 * deforms with the squeeze instead of sliding around on top of it.
 */

/** Fixed timestep, so a 120Hz display does not run the sim at double speed. */
const STEP = 1 / 60;

/** Finer than the backdrop field — this one is looked at directly. */
const POINTS = 72;

/**
 * Firmer than the drifting field, and deliberately under-smoothed.
 *
 * Smoothing is the term that fights the rest shape here: it pulls every point
 * toward the midpoint of its neighbours, and a corner is exactly where that
 * midpoint is furthest away. At the field's 0.2 over five passes the squircle
 * rounds off within a second and the thing reads as a ball. 0.1 over three passes
 * keeps the corners and still spreads a press into a curve instead of a spike.
 */
const TUNING: Tuning = {
  memory: 0.075,
  damping: 0.93,
  smoothing: 0.1,
  pressure: 0.85,
  reach: 0.8,
  passes: 3,
};

/**
 * Dent depth: a fingertip resting on it, versus a thumb-and-finger squeeze.
 *
 * Lower than the point-press values these replaced. A finger pad spreads its
 * load over a wide contact, so the same visible dent needs less depth — and
 * there are two contacts once you hold, pressing from opposite sides.
 */
const HOVER_PUSH = 2.4;
const HOLD_PUSH = 12;

/**
 * Contact radius as a fraction of the body: a pad, not a point.
 *
 * A drawn hand used to sit on top of these contacts and explain them. It is gone
 * — it read as a second cursor on the one object the page wants you to touch —
 * but the two-sided contact stays, because that is what a squeeze is. You press
 * one side, the grip answers from the other, and the body flattens between them.
 */
const FINGER_REACH = 0.46;
const THUMB_REACH = 0.5;

/** How much of the finger's movement the surface is dragged along by. */
const HOVER_GRIP = 0.1;
const HOLD_GRIP = 0.42;

/**
 * Recovery, in seconds, and how soft the shape memory goes while it lasts.
 *
 * "Soft slow rising" is on the product page, and a body that springs back at the
 * rate it gave way is a rubber band instead. Memory drops on release and ramps
 * back over this window, so the surface rises slowly and arrives without the
 * overshoot a spring would give it.
 */
const RISE = 0.85;
const RISE_MEMORY = 0.018;

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
const SHAPES: Record<"cube" | "pillow", RestShape> = {
  cube: squashed(4, 0.96),
  pillow: squashed(2.5, 0.9),
};

const SHAPE_OF: Record<string, keyof typeof SHAPES> = {
  "pillow-squish": "pillow",
};

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
 * A noise tile, built once.
 *
 * Every gradient on this canvas is mathematically smooth, and smooth is exactly
 * what a photograph is not. Four percent of grain over the whole body is the
 * difference between "rendered" and "shot".
 */
const grainTile = () => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return null;
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
  return c;
};

export function SqueezeToy({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState(false);

  /**
   * The loop reads these instead of closing over state. Re-running the effect on
   * every colour change would reseed the body — the squishy would snap back to
   * rest mid-squeeze just because you picked a different one.
   *
   * Mirrored in an effect rather than assigned during render: a render can be
   * thrown away, and the animation loop is not something to hand a value from a
   * render that never committed.
   */
  const indexRef = useRef(0);
  const pressedRef = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    pressedRef.current = pressed;
  }, [pressed]);

  const product = PRODUCTS[index];

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * One body per silhouette, built on first use and kept.
     *
     * The effect deliberately does not re-run when the selected product changes
     * — that would reseed mid-squeeze — so the swap happens inside the loop. A
     * body that has not been on screen is seeded at rest before it is shown,
     * because coming back mid-wobble from four selections ago is not a wobble
     * anyone asked for.
     */
    const bodies = new Map<keyof typeof SHAPES, ReturnType<typeof createSoftBody>>();
    const bodyFor = (key: keyof typeof SHAPES) => {
      let b = bodies.get(key);
      if (!b) {
        b = createSoftBody(POINTS, TUNING, SHAPES[key]);
        bodies.set(key, b);
      }
      return b;
    };

    let shapeKey: keyof typeof SHAPES = "cube";
    let body = bodyFor(shapeKey);

    const grain = grainTile();
    const grainPattern = grain ? ctx.createPattern(grain, "repeat") : null;

    let w = 0;
    let h = 0;
    let radius = 0;
    let cx = 0;
    let cy = 0;
    let elapsed = 0;

    /** Where the finger is, and how hard it is pushing right now. */
    const finger = { x: 0, y: 0, over: false, down: false };
    /** Last step's position, so the drag term has something to measure. */
    let prevX = 0;
    let prevY = 0;
    /** Eased, so grabbing and letting go are not two instant jumps. */
    let depth = 0;
    /** Seconds left of the slow rise after a release. */
    let rising = 0;
    let wasDown = false;

    /**
     * What the last solver step was told, so the shading agrees with the
     * deformation instead of guessing at it.
     */
    type Contact = { x: number; y: number; depth: number; reach: number };
    let touch: Contact | null = null;
    let thumb: Contact | null = null;
    /** The unprompted squeeze, kept apart from the two the pointer drives. */
    let invite: Contact | null = null;

    const path = (scale = 1) => {
      ctx.beginPath();
      if (scale === 1) {
        body.trace(ctx);
      } else {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        body.trace(ctx);
        ctx.restore();
      }
      ctx.closePath();
    };

    /** Fill the whole clipped area. Cheaper than re-tracing the path to fill it. */
    const flood = (style: string | CanvasGradient | CanvasPattern) => {
      ctx.fillStyle = style;
      ctx.fillRect(cx - radius * 2.2, cy - radius * 2.2, radius * 4.4, radius * 4.4);
    };

    const draw = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      const p = PRODUCTS[indexRef.current];
      const surface = SURFACE[p.slug] ?? "smooth";
      const matte = MATTE[surface];
      const squeeze = Math.min(depth / HOLD_PUSH, 1);
      const lum = luminance(p.swatch);

      /* Ground. Two shadows, because one never looks right: a tight dark contact
         patch that says where it touches, and a wide soft pool that says how far
         the light wraps. Both tighten as it is pressed — a squeezed body sits
         lower and spreads. */
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

      path();
      ctx.save();
      ctx.clip();

      /* 1. Base. Lighter at the top because the light is above it. */
      const base = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
      base.addColorStop(0, shade(p.swatch, 0.16));
      base.addColorStop(0.45, p.swatch);
      base.addColorStop(1, shade(p.swatch, -0.18));
      flood(base);

      /* 1b. Transmission. These are cast in something soft and slightly
             translucent, so light gets through the thin part at the bottom and
             comes back out brighter than the body above it. A body that only
             darkens toward the ground reads as solid rubber; this is what makes
             it read as jelly. Foam does not transmit, so it is skipped. */
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
          // darkness out at the rim — the obvious way to write this — is what
          // made the first pass look like seven brown smudges.
          const g = ctx.createRadialGradient(x, y - r * 0.35, r * 0.1, x, y, r);
          g.addColorStop(0, "rgba(92,58,0,0.72)");
          g.addColorStop(0.72, "rgba(120,78,0,0.62)");
          g.addColorStop(1, "rgba(176,120,0,0.42)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();

          // The lit far wall. One bright arc on the side away from the key light
          // is what tells the eye this is a pit and not a spot.
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

      /* 3. Key light. One source, upper left, the same direction the backdrop
            field uses, so the two read as the same material at two scales. */
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
            between that radius and the flat face catches light on the top and
            loses it on the bottom. Drawn as the same outline scaled inward — one
            faint line that does more for "this is a real object" than any amount
            of extra gradient. */
      const breakGrad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
      breakGrad.addColorStop(0, "rgba(255,255,255,0.18)");
      breakGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
      breakGrad.addColorStop(1, "rgba(11,11,15,0.08)");
      ctx.strokeStyle = breakGrad;
      // Tight to the silhouette and faint. At 0.86 and full strength it stopped
      // being an edge and became a drawn border inside the object.
      //
      // Skipped on foam: a cast foam pillow has no moulded corner break, and
      // drawing one put a visible contour line inside a soft object.
      if (!matte) {
        ctx.lineWidth = Math.max(1, radius * 0.013);
        path(0.91);
        ctx.stroke();
      }

      /* 5. Occlusion. Clipped to the body and stroked wide, so only the inner
            half of the stroke lands: the edges go dark, the middle stays lit.
            Two passes, because real falloff is not linear.

            In the product's own hue, and weaker the paler the product. Neutral
            ink at a fixed strength is correct for the blue and completely wrong
            for the pastel — on pink it stopped reading as shadow and started
            reading as a grey frame around a picture. Shadow on a pink object is
            dark pink. */
      const ao = 0.55 + (1 - lum) * 0.7;
      ctx.strokeStyle = shade(p.swatch, -0.62, (matte ? 0.13 : 0.2) * ao);
      ctx.lineWidth = radius * (matte ? 0.44 : 0.36);
      path();
      ctx.stroke();
      // The second, tighter pass is what gives a moulded body its crisp edge.
      // On foam it reads as a drawn ring, so foam gets the wide pass only.
      if (!matte) {
        ctx.strokeStyle = shade(p.swatch, -0.66, 0.24 * ao);
        ctx.lineWidth = radius * 0.09;
        path();
        ctx.stroke();
      }

      /* 6. Subsurface, then bounce. Soft plastic passes light at its thin edges,
            so the rim is a lighter version of its own colour rather than white;
            the surface underneath throws a cooler light back up at the bottom. */
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

      /* 7. The seam. Moulded in two halves, and the join shows — a hair of
            shadow with a hair of highlight under it. Foam is cast, not moulded,
            so the toasted one has none. */
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

      /* 8. Compression. The silhouette already dents; without this the dent has
            no shading in it and the squeeze reads as a shape change rather than
            as material being displaced. */
      for (const c of [touch, thumb, invite]) {
        if (!c) continue;
        const r = c.reach;
        const strength = Math.min(c.depth / HOLD_PUSH, 1);
        const dent = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
        dent.addColorStop(0, `rgba(11,11,15,${0.26 * strength})`);
        dent.addColorStop(0.55, `rgba(11,11,15,${0.1 * strength})`);
        dent.addColorStop(1, "rgba(11,11,15,0)");
        flood(dent);

        // The material has to go somewhere: a soft bulge of light just outside
        // the dent, which is what makes it look full rather than dented in.
        const bulge = ctx.createRadialGradient(c.x, c.y, r * 0.8, c.x, c.y, r * 1.5);
        bulge.addColorStop(0, "rgba(255,255,255,0)");
        bulge.addColorStop(0.5, `rgba(255,255,255,${0.16 * strength})`);
        bulge.addColorStop(1, "rgba(255,255,255,0)");
        flood(bulge);
      }

      /* 9. Grain. Last, over everything, at a few percent. */
      if (grainPattern) {
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = matte ? 0.1 : 0.05;
        flood(grainPattern);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.restore();

      /* Specular, outside the clip so it can sit right on the edge. Gloss gets a
         tight hotspot and a hard glint; matte foam gets neither, which is the
         difference you can see between the pillow and the other three. */
      {
        const hx = cx - radius * 0.42;
        const hy = cy - radius * 0.46;
        ctx.save();
        path(0.97);
        ctx.clip();
        // Matte foam still catches light — it just scatters it over a wide area
        // instead of returning a hotspot. Giving it no specular at all was what
        // made the pastel look like a flat shape next to three lit objects.
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
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = w / 2;
      // Above centre: the two ground shadows need room under it.
      cy = h * 0.44;
      radius = Math.min(w, h) * 0.39;
      for (const b of bodies.values()) b.seed(cx, cy, radius);
      draw();
    };

    const step = () => {
      elapsed += STEP;

      const wanted = SHAPE_OF[PRODUCTS[indexRef.current].slug] ?? "cube";
      if (wanted !== shapeKey) {
        shapeKey = wanted;
        body = bodyFor(shapeKey);
        body.seed(cx, cy, radius);
      }

      const target = finger.over ? (finger.down ? HOLD_PUSH : HOVER_PUSH) : 0;
      depth += (target - depth) * 0.22;

      // Release: go soft, then firm up over RISE seconds. Applied to the active
      // body only, which is correct — an unselected body is at rest anyway.
      if (wasDown && !finger.down) rising = RISE;
      wasDown = finger.down;
      if (rising > 0) {
        rising = Math.max(0, rising - STEP);
        const t = 1 - rising / RISE;
        body.tune({ memory: RISE_MEMORY + (TUNING.memory - RISE_MEMORY) * t * t });
      }

      // Breathing, so it does not look like a still image waiting for a cursor.
      const restR = reduced ? radius : radius * (1 + Math.sin(elapsed * 0.9) * 0.012);

      // Drag, clamped: a cursor that jumps across the canvas in one frame must
      // not hand the solver a displacement bigger than the body.
      const cap = radius * 0.18;
      let dx = finger.x - prevX;
      let dy = finger.y - prevY;
      const moved = Math.hypot(dx, dy);
      if (moved > cap) {
        dx = (dx / moved) * cap;
        dy = (dy / moved) * cap;
      }
      prevX = finger.x;
      prevY = finger.y;

      touch = null;
      thumb = null;
      invite = null;

      if (depth > 0.15 && finger.over) {
        touch = { x: finger.x, y: finger.y, depth, reach: radius * FINGER_REACH };

        // The thumb, mirrored through the centre — which is where a thumb
        // actually is when you pinch something. It arrives with the squeeze
        // rather than being there all along, and it presses a little softer
        // than the finger, the same as a real grip.
        const grip = Math.min(depth / HOLD_PUSH, 1);
        if (grip > 0.06) {
          thumb = {
            x: cx - (finger.x - cx),
            y: cy - (finger.y - cy),
            depth: depth * 0.82,
            reach: radius * THUMB_REACH,
          };
        }
      } else if (!pressedRef.current && !reduced) {
        // The invitation: one slow squeeze from the upper left every ~3.6s,
        // until someone takes the hint.
        const t = elapsed % 3.6;
        if (t < 0.9) {
          invite = {
            x: cx - radius * 0.45,
            y: cy - radius * 0.35,
            depth: Math.sin((t / 0.9) * Math.PI) * 9,
            reach: radius * TUNING.reach,
          };
        }
      }

      const grip = finger.down ? HOLD_GRIP : HOVER_GRIP;
      body.step(cx, cy, restR, [
        touch ? { ...touch, radius: touch.reach, dx, dy, grip } : null,
        // The thumb is the still hand: you move the finger against it, so it
        // gets no drag of its own.
        thumb ? { ...thumb, radius: thumb.reach } : null,
        invite ? { ...invite, radius: invite.reach } : null,
      ]);
    };

    let acc = 0;
    const tick = (_t: number, dt: number) => {
      acc = Math.min(acc + dt / 1000, STEP * 5);
      while (acc >= STEP) {
        step();
        acc -= STEP;
      }
      draw();
    };

    /**
     * Off-screen, it stops. The hero already runs the drifting field on the same
     * ticker, and there is no reason for two solvers to keep integrating while
     * someone reads the footer. Re-seeding is not needed on the way back in — the
     * body is left exactly as it was, mid-wobble if that is where it stopped.
     */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      finger.x = e.clientX - r.left;
      finger.y = e.clientY - r.top;
      finger.over =
        finger.x >= 0 && finger.y >= 0 && finger.x <= r.width && finger.y <= r.height;
    };

    const onMove = (e: PointerEvent) => at(e);
    const onDown = (e: PointerEvent) => {
      at(e);
      if (!finger.over) return;
      finger.down = true;
      // Touch only: keep the page from scrolling out from under a squeeze.
      if (e.pointerType !== "mouse") e.preventDefault();
      if (!pressedRef.current) setPressed(true);
    };
    const onUp = (e: PointerEvent) => {
      finger.down = false;
      // There is no such thing as hovering on glass: lifting a finger ends the
      // contact entirely, or the dent would stay pressed into the product.
      if (e.pointerType !== "mouse") finger.over = false;
    };
    const onLeave = () => {
      finger.over = false;
      finger.down = false;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Move and up on the window: a squeeze that starts on the body should not
    // stick down because the cursor wandered off it mid-press.
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mx-auto aspect-square w-full max-w-[560px]">
        {/* Lifts the body off the drifting backdrop without a hard edge. Kept
            weak: the backdrop field is composed to leave this side clear, so
            this only has to soften what drifts through, not white it out. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-8%] rounded-full bg-white/45 blur-3xl"
        />

        <div ref={wrapRef} className="absolute inset-0">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="size-full cursor-grab touch-none active:cursor-grabbing"
          />
        </div>

        {/* Asks once, then gets out of the way. */}
        <p
          aria-hidden
          className={`text-marker pointer-events-none absolute inset-x-0 bottom-1 text-center text-ink/45 transition-opacity duration-500 ${
            pressed ? "opacity-0" : "opacity-100"
          }`}
        >
          Press and hold to squeeze
        </p>
      </div>

      {/* The four, switchable. Colour is the navigation, so the rail is the
          palette — and each one is a real button with a real name. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {PRODUCTS.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            className={`flex items-center gap-2 rounded-full border py-2 pr-3.5 pl-2.5 text-[13px] font-extrabold transition-colors ${
              i === index
                ? "border-ink/80 text-ink"
                : "border-ink/15 text-ink/50 hover:border-ink/40 hover:text-ink"
            }`}
          >
            <span
              aria-hidden
              className="size-3.5 rounded-full"
              style={{ background: p.swatch }}
            />
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[15px] font-semibold text-ink/50">
        {product.specs.finish} · {product.specs.colour} ·{" "}
        <Link
          href={`/products/${product.slug}`}
          className="font-extrabold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-blue"
        >
          See it
        </Link>
      </p>
    </div>
  );
}
