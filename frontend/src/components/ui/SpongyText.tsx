"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Headline type as soft material.
 *
 * The hero sells a thing you press and it springs back, so the largest element on
 * the page behaves the same way. Letters compress under the cursor and spring
 * past their rest height on the way out — the same squash, bulge and overshoot
 * the product blob has, applied to typography.
 *
 * It preserves volume the way the blob does: a letter that loses height gains
 * width. Squashing on one axis alone reads as a scale animation, not as material.
 *
 * Scroll velocity squashes every letter at once, so the whole headline gives when
 * the page moves quickly and settles when it stops.
 *
 * Two deliberate constraints:
 *
 *   - Letters are always split, on the server as well as the client. Rendering
 *     plain text and splitting in an effect would mean a hydration mismatch, and
 *     branching the markup on prefers-reduced-motion would mean two different
 *     trees for the same heading. Reduced motion keeps the spans and skips the
 *     animation.
 *   - Only transform is animated. Nothing here affects layout, so a squashing
 *     headline cannot reflow the page under it.
 */

export type SpongySegment = { text: string; className?: string };

/** Cursor influence radius, in px. */
const REACH = 200;
/** Peak vertical compression, and the horizontal spread that compensates. */
const SQUASH = 0.3;
const SPREAD = 0.15;
/** How far a compressed letter sinks, in em of its own size. */
const SINK = 0.035;
/** Spring constants. Damping well below 1 is what produces the overshoot. */
const STIFFNESS = 0.2;
const DAMPING = 0.72;
/** Scroll speed to compression, and the ceiling it saturates at. */
const PER_PX = 0.0016;
const MAX_SCROLL_SQUASH = 0.45;

type Letter = {
  el: HTMLSpanElement;
  /** Page coordinates, so scrolling does not invalidate them. */
  cx: number;
  cy: number;
  /** Current compression and its velocity. */
  c: number;
  v: number;
};

export function SpongyText({
  segments,
  className,
}: {
  segments: SpongySegment[];
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Queried rather than collected through ref callbacks: gathering refs into an
    // array during render mutates a ref while rendering, which React forbids.
    const letters: Letter[] = [
      ...root.querySelectorAll<HTMLSpanElement>("[data-letter]"),
    ].map((el) => ({ el, cx: 0, cy: 0, c: 0, v: 0 }));
    if (!letters.length) return;

    const pointer = { x: 0, y: 0, active: false };
    let lastScroll = window.scrollY;
    let scrollSquash = 0;

    /**
     * Cache each letter's centre in page coordinates. Transforms are cleared
     * first: getBoundingClientRect reports the *transformed* box, so measuring a
     * mid-squash letter would bake that squash into its own rest position.
     */
    const measure = () => {
      for (const l of letters) l.el.style.transform = "";
      const sx = window.scrollX;
      const sy = window.scrollY;
      for (const l of letters) {
        const r = l.el.getBoundingClientRect();
        l.cx = r.left + r.width / 2 + sx;
        l.cy = r.top + r.height / 2 + sy;
      }
    };

    const tick = () => {
      const sy = window.scrollY;
      const speed = Math.abs(sy - lastScroll);
      lastScroll = sy;
      // Rise with the scroll immediately, fall back gently, so the squash tracks
      // a flick but does not flicker between frames of a steady scroll.
      scrollSquash = Math.max(
        Math.min(speed * PER_PX, MAX_SCROLL_SQUASH),
        scrollSquash * 0.9,
      );

      for (const l of letters) {
        let target = scrollSquash;
        if (pointer.active) {
          const d = Math.hypot(pointer.x - l.cx, pointer.y - l.cy);
          if (d < REACH) {
            // Squared falloff, matching the blob: soft at the rim, decisive at
            // the centre.
            const f = 1 - d / REACH;
            target = Math.max(target, f * f);
          }
        }

        l.v += (target - l.c) * STIFFNESS;
        l.v *= DAMPING;
        l.c += l.v;

        const c = l.c;
        // Skip the write when the letter is effectively at rest. Most letters
        // are, most frames, and this is the only per-frame style mutation here.
        if (Math.abs(c) < 0.0015 && Math.abs(l.v) < 0.0015) {
          if (l.el.style.transform) l.el.style.transform = "";
          continue;
        }
        l.el.style.transform = `translateY(${(c * SINK).toFixed(4)}em) scaleX(${(
          1 + c * SPREAD
        ).toFixed(4)}) scaleY(${(1 - c * SQUASH).toFixed(4)})`;
      }
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX + window.scrollX;
      pointer.y = e.clientY + window.scrollY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      for (const l of letters) l.el.style.transform = "";
    };
  }, [segments]);

  return (
    // pre-wrap keeps the space in "made easier." from collapsing between the
    // inline-block letters either side of it, while still allowing the line to
    // break there. Plain `pre` preserves the space but forbids wrapping, which
    // overflows the viewport at 17vw on a phone.
    <span ref={rootRef} className={className} style={{ whiteSpace: "pre-wrap" }}>
      {segments.map((seg, si) =>
        // Split on whitespace but keep the separators, so words can be grouped
        // and the spaces between them still rendered.
        seg.text.split(/(\s+)/).map((token, ti) => {
          const key = `${si}-${ti}`;
          if (!token) return null;
          // Spaces stay plain text: they never need a transform, and they are the
          // only place the line is allowed to break.
          if (/^\s+$/.test(token)) return <span key={key}>{token}</span>;

          return (
            // Every letter is its own inline-block, and the line breaker treats
            // each one as a break opportunity — so without this wrapper "easier."
            // wraps as "easie / r." on a narrow screen. nowrap confines breaks to
            // the spaces between words.
            <span key={key} style={{ whiteSpace: "nowrap" }}>
              {[...token].map((ch, ci) => (
                <span
                  key={ci}
                  data-letter=""
                  className={seg.className}
                  style={{
                    display: "inline-block",
                    // Compress toward the baseline rather than the middle — that
                    // is where a soft object resting on a surface gives way.
                    transformOrigin: "50% 100%",
                    willChange: "transform",
                  }}
                >
                  {ch}
                </span>
              ))}
            </span>
          );
        }),
      )}
    </span>
  );
}
