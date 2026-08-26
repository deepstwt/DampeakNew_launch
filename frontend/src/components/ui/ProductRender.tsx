"use client";

import { useEffect, useRef } from "react";
import { bodyFor, paintProduct } from "@/lib/product-art";

/**
 * A product, drawn once and left alone.
 *
 * Same paint as the squeezable one in the hero — same light, same seam, same
 * grain — but with the body seeded at rest and no animation loop behind it. This
 * is what a product card wants: something that looks like the object without
 * spending a frame budget to say so.
 *
 * It replaces the flat colour tile the cards used to show. That tile was honest
 * about having no photograph and said nothing else; this is honest about the
 * same thing and also shows the shape, the surface and the finish from the spec
 * sheet. It is still a drawing, not a photograph, and the caller is expected to
 * keep saying so — see ProductPhoto, which labels it.
 *
 * Redrawn on resize only. A card that never changes size paints exactly once.
 */
export function ProductRender({
  product,
  className = "",
}: {
  /** Only these two fields are read. */
  product: { slug: string; swatch: string };
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const slug = product.slug;
  const swatch = product.swatch;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const body = bodyFor(slug);

    const paint = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      // Centred, and smaller than the hero's, because the ground shadow has to
      // fit inside the tile rather than run off the bottom of it.
      const cy = rect.height * 0.5;
      const radius = Math.min(rect.width, rect.height) * 0.34;

      body.seed(cx, cy, radius);
      paintProduct(ctx, {
        product: { slug, swatch },
        cx,
        cy,
        radius,
        trace: (c) => body.trace(c),
      });
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [slug, swatch]);

  return (
    <div ref={wrapRef} aria-hidden className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
