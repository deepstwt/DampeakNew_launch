"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { PRODUCTS } from "@/content/site";
import { bodyFor, paintProduct, shapeFor, TUNING, type Contact } from "@/lib/product-art";
import type { SoftBody } from "@/lib/softbody";
import { ProductRender } from "@/components/ui/ProductRender";

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
 * shape. That shading is not here — it is in lib/product-art, because the cards
 * on every other page now draw the same object from the same paint. What lives
 * in this file is the part only the hero has: a body that deforms under your
 * pointer, and the contacts that deform it.
 */

/** Fixed timestep, so a 120Hz display does not run the sim at double speed. */
const STEP = 1 / 60;

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
    const bodies = new Map<string, SoftBody>();
    const bodyOf = (slug: string) => {
      const key = shapeFor(slug);
      let b = bodies.get(key);
      if (!b) {
        b = bodyFor(slug);
        bodies.set(key, b);
      }
      return b;
    };

    let shapeKey = shapeFor(PRODUCTS[0].slug);
    let body = bodyOf(PRODUCTS[0].slug);

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
    type Dent = { x: number; y: number; depth: number; reach: number };
    let touch: Dent | null = null;
    let thumb: Dent | null = null;
    /** The unprompted squeeze, kept apart from the two the pointer drives. */
    let invite: Dent | null = null;

    /**
     * The solver speaks in depths and reaches; the paint speaks in radii and a
     * 0..1 strength. One translation, in one place.
     */
    const asContact = (c: Dent | null): Contact | null =>
      c && {
        x: c.x,
        y: c.y,
        radius: c.reach,
        strength: Math.min(c.depth / HOLD_PUSH, 1),
      };

    const draw = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      paintProduct(ctx, {
        product: PRODUCTS[indexRef.current],
        cx,
        cy,
        radius,
        trace: (c) => body.trace(c),
        contacts: [touch, thumb, invite].map(asContact),
        squeeze: Math.min(depth / HOLD_PUSH, 1),
      });
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
      // Dead centre of its box, and small enough that the ground shadow still
      // fits underneath. It used to sit above centre with a bigger radius, which
      // meant the optical centre of the product and the geometric centre of the
      // box were 6% apart — and anything aligned to the box, the rail beside it
      // included, lined up with nothing.
      cy = h * 0.5;
      radius = Math.min(w, h) * 0.36;
      for (const b of bodies.values()) b.seed(cx, cy, radius);
      draw();
    };

    const step = () => {
      elapsed += STEP;

      const slug = PRODUCTS[indexRef.current].slug;
      const wanted = shapeFor(slug);
      if (wanted !== shapeKey) {
        shapeKey = wanted;
        body = bodyOf(slug);
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
      {/* Three cells, placed rather than nested.
          
          The product and the rail share the first row, so the rail centres on
          the product and not on some box that contains both of them. The two
          lines of text take the second row of the product's column alone, so
          they centre under the product rather than under product-plus-rail —
          which is what had the caption sitting a rail's width to the right of
          the line above it.
          
          Stacked on a phone it is DOM order: product, rail, text. */}
      <div className="grid justify-center gap-x-6 gap-y-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative aspect-square w-full max-w-[440px] sm:col-start-1 sm:row-start-1 lg:max-w-[480px]">
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
        </div>

        {/* The rail. Each one is the product itself, drawn by the same paint as
            the big one and then left alone — no solver, no loop, four canvases
            that each paint once.

            The names moved into aria-label rather than under the tiles. Four
            objects this distinct do not need labelling to be told apart, and the
            captions were three lines of type competing with a headline; a screen
            reader still hears every name. */}
        <ul className="flex shrink-0 gap-3 sm:col-start-2 sm:row-start-1 sm:flex-col sm:self-center">
          {PRODUCTS.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={p.name}
                className={`relative block size-[68px] overflow-hidden rounded-2xl border-2 transition lg:size-[84px] ${
                  i === index
                    ? "border-ink"
                    : "border-transparent bg-ink/[0.03] hover:bg-ink/[0.06]"
                }`}
              >
                <ProductRender product={p} />
              </button>
            </li>
          ))}
        </ul>

        <div className="text-center sm:col-start-1 sm:row-start-2">
          {/* Asks once, then gets out of the way. It holds its line whether or
              not it is showing, so the caption under it never moves. */}
          <p
            aria-hidden
            className={`text-marker text-ink/45 transition-opacity duration-500 ${
              pressed ? "opacity-0" : "opacity-100"
            }`}
          >
            Press and hold to squeeze
          </p>

          <p className="mt-3 text-[15px] font-semibold text-ink/50">
            <span className="font-extrabold text-ink">{product.name}</span> ·{" "}
            {product.specs.finish} · {product.specs.colour} ·{" "}
            <Link
              href={`/products/${product.slug}`}
              className="font-extrabold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-blue"
            >
              See it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
