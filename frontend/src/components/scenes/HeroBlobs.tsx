"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { createSoftBody, DEFAULT_TUNING } from "@/lib/softbody";

/**
 * The hero backdrop: the four ranges as four soft bodies, drifting.
 *
 * This replaces a photograph, and it is doing a job a photograph could not — it
 * puts the palette on screen before a single word is read.
 *
 * Two things keep it from fighting the page:
 *
 *   - The canvas is pointer-events-none, and the cursor is tracked on the window
 *     instead. The whole hero reacts to your cursor, but every click still lands
 *     on the button or card underneath. Putting the canvas in the hit path would
 *     have meant restacking the entire hero to get those clicks back.
 *   - It renders under the same white scrim the photo used, so 13vw ink type
 *     stays crisp over it.
 */

/** Fixed timestep, so a 120Hz display does not run the sim at double speed. */
const STEP = 1 / 60;

/** Coarser than the product blob — this sits behind a scrim, softened by it. */
const POINTS = 36;

/** How hard the cursor dents whatever it passes over. Ambient, not a squeeze. */
const PUSH = 3.2;

/**
 * The four ranges. `x`/`y` are fractions of the hero box; `r` is a fraction of
 * its WIDTH, so the bodies stay circular instead of stretching with the height.
 *
 * The composition is anchored to the edges rather than scattered through the
 * middle, and that is a responsiveness decision as much as an aesthetic one. The
 * headline always flows from the top-left downward, at 17vw on a phone and 13vw
 * on a desktop, so the middle is the one region whose occupancy changes with the
 * viewport. Edges and corners stay free at every width.
 *
 * A third region is now spoken for: the squeezable product sits in the right
 * half from a large breakpoint up. Bodies drifting behind it turned a saturated
 * blue product into two overlapping blues, so the field keeps to the top-right
 * corner above it and to the bottom edge below the copy. Nothing sits in the
 * band the product occupies.
 *
 * The top-right body is brown rather than the palette's orange, and lighter than
 * the brown token. Everything here is seen through a 50% white scrim, so a body
 * is drawn at roughly half its strength: the token's #4a2b18 comes through that
 * as a grey-brown with the warmth washed out of it. #8a4a1e lands on the scrim
 * at about the tone the token reads at on a solid fill, which is what makes it
 * the same colour to the eye rather than on paper.
 *
 * Two further constraints the placement has to respect:
 *
 *   - Nothing saturated behind "Everyday", which is set in orange. Orange type
 *     on an orange body is the one combination here that genuinely fails to
 *     read — and the brown that replaced it is close enough to keep the rule.
 *   - Ink is near-black, so it is small and kept clear of the type entirely. It
 *     is an accent that adds depth; behind a word it would read as a hole.
 *
 * Yellow behind the black "made" is fine and deliberate — that pairing has the
 * strongest contrast of any in the palette.
 */
const RANGES = [
  { color: "#8a4a1e", x: 0.95, y: 0.04, r: 0.11, sx: 0.16, sy: 0.23, phase: 1.9 },
  { color: "#ffce00", x: 0.06, y: 0.52, r: 0.14, sx: 0.21, sy: 0.17, phase: 0 },
  { color: "#1f3cff", x: 0.36, y: 1.08, r: 0.1, sx: 0.25, sy: 0.15, phase: 3.4 },
  { color: "#0b0b0f", x: 0.04, y: 0.9, r: 0.07, sx: 0.19, sy: 0.27, phase: 5.1 },
];

export function HeroBlobs({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bodies = RANGES.map((range) => ({
      range,
      body: createSoftBody(POINTS, DEFAULT_TUNING),
      cx: 0,
      cy: 0,
      radius: 0,
    }));

    let w = 0;
    let h = 0;
    let elapsed = 0;
    const pointer = { x: 0, y: 0, active: false };

    /** Where a body sits this instant, before the solver is told about it. */
    const placement = (b: (typeof bodies)[number]) => {
      const { range } = b;
      if (reduced) {
        return { cx: range.x * w, cy: range.y * h, restR: b.radius };
      }
      return {
        cx: range.x * w + Math.sin(elapsed * range.sx + range.phase) * w * 0.035,
        cy: range.y * h + Math.cos(elapsed * range.sy + range.phase) * w * 0.03,
        restR: b.radius * (1 + Math.sin(elapsed * 0.6 + range.phase) * 0.02),
      };
    };

    const draw = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (const b of bodies) {
        ctx.beginPath();
        b.body.trace(ctx);
        ctx.closePath();
        ctx.fillStyle = b.range.color;
        ctx.fill();

        // One soft light from upper-left, same as the product blob, so the two
        // read as the same material at different scales.
        const g = ctx.createRadialGradient(
          b.cx - b.radius * 0.4,
          b.cy - b.radius * 0.45,
          b.radius * 0.05,
          b.cx,
          b.cy,
          b.radius * 1.4,
        );
        g.addColorStop(0, "rgba(255,255,255,0.32)");
        g.addColorStop(0.5, "rgba(255,255,255,0.03)");
        g.addColorStop(1, "rgba(11,11,15,0.12)");
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    const resize = () => {
      // Capped harder than the product blob: this canvas is the full height of
      // the hero, so every extra pixel of scale costs real fill rate for
      // something the scrim is about to soften anyway.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const b of bodies) {
        b.radius = b.range.r * w;
        const at = placement(b);
        b.cx = at.cx;
        b.cy = at.cy;
        b.body.seed(b.cx, b.cy, b.radius);
      }
      draw();
    };

    const step = () => {
      elapsed += STEP;
      for (const b of bodies) {
        const at = placement(b);
        b.cx = at.cx;
        b.cy = at.cy;
        // Each body's reach is relative to its own radius, so a cursor far from
        // this blob has no effect on it without needing a distance test here.
        b.body.step(
          at.cx,
          at.cy,
          at.restR,
          pointer.active
            ? { x: pointer.x, y: pointer.y, depth: PUSH }
            : null,
        );
      }
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

    // Tracked on the window, not the canvas: the canvas must stay out of the hit
    // path so the buttons and product cards underneath still take clicks.
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= r.width && pointer.y <= r.height;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={className}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
