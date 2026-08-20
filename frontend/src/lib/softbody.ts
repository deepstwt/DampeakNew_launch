/**
 * Soft-body solver — a ring of points that behaves like it is filled.
 *
 * Shared by the squeezable product blob and the drifting hero field, so the
 * physics lives here and the components only decide where the bodies are, how
 * big, and what colour.
 *
 * Three forces per step:
 *
 *   1. Shape memory — each point springs toward its rest position on the circle.
 *      This is what returns the body to round.
 *   2. Neighbour smoothing — each point is pulled toward the midpoint of its two
 *      neighbours, so a dent spreads into a curve instead of a spike.
 *   3. Pressure — the enclosed area is held near its rest value, so pushing one
 *      side in displaces material rather than just scaling the shape down.
 *
 * Point 3 is the one that matters. Without it you get a wobbly ring; with it you
 * get something that reads as filled, which is the whole difference between a
 * shape and a stress ball.
 *
 * Integration is Verlet — position and previous position, no stored velocity.
 * Damping below 1 leaves energy in the system, which is where the overshoot on
 * release comes from. Nothing animates it back; it springs past and settles.
 */

export type Tuning = {
  /** Pull toward the rest circle. Higher = firmer, less squishy. */
  memory: number;
  /** Verlet damping. Lower = the jiggle dies sooner. */
  damping: number;
  /** Neighbour averaging. Keeps the silhouette curved under a sharp poke. */
  smoothing: number;
  /** Volume preservation. This is what makes material move sideways. */
  pressure: number;
  /** How far the dent reaches from the press point, as a fraction of radius. */
  reach: number;
  /** Constraint passes per step. */
  passes: number;
};

export const DEFAULT_TUNING: Tuning = {
  memory: 0.055,
  damping: 0.9,
  smoothing: 0.2,
  pressure: 0.8,
  reach: 0.95,
  passes: 4,
};

export type Point = {
  x: number;
  y: number;
  px: number;
  py: number;
  /** Rest position on the unit circle — the shape it remembers. */
  ux: number;
  uy: number;
};

/** Where the surface is being pushed, and how hard. */
export type Press = { x: number; y: number; depth: number } | null;

export type SoftBody = {
  points: Point[];
  /** Snap every point onto the rest circle, killing any stored velocity. */
  seed(cx: number, cy: number, radius: number): void;
  /**
   * Advance one fixed step. The caller owns the centre and the rest radius, so
   * drifting the body around or compressing it under a grip is done by passing
   * different values rather than by reaching into the solver.
   */
  step(cx: number, cy: number, restR: number, press: Press): void;
  /** Lay the outline into the current path. Does not fill or stroke. */
  trace(ctx: CanvasRenderingContext2D): void;
};

export function createSoftBody(count = 48, tuning: Tuning = DEFAULT_TUNING): SoftBody {
  const points: Point[] = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return { x: 0, y: 0, px: 0, py: 0, ux: Math.cos(a), uy: Math.sin(a) };
  });

  /** Shoelace. Sign is dropped — winding direction is not interesting here. */
  const areaOf = () => {
    let a = 0;
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      a += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(a) / 2;
  };

  return {
    points,

    seed(cx, cy, radius) {
      for (const p of points) {
        p.x = cx + p.ux * radius;
        p.y = cy + p.uy * radius;
        p.px = p.x;
        p.py = p.y;
      }
    },

    step(cx, cy, restR, press) {
      // The target area has to track the target radius. Pin it to a fixed
      // radius while restR moves and the pressure term — an order of magnitude
      // stronger than shape memory — silently cancels that movement out.
      const restArea = Math.PI * restR * restR;
      const reach = restR * tuning.reach;

      for (const p of points) {
        const vx = (p.x - p.px) * tuning.damping;
        const vy = (p.y - p.py) * tuning.damping;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;

        // 1. Shape memory
        p.x += (cx + p.ux * restR - p.x) * tuning.memory;
        p.y += (cy + p.uy * restR - p.y) * tuning.memory;

        // The dent travels INWARD, toward the centre — not away from the press
        // point. Away-from-the-point is the intuitive way to write this and it
        // is wrong: the press point sits inside the body, so repelling from it
        // drives the near surface outward and the body inflates under your
        // finger instead of denting. A finger displaces material inward.
        if (press) {
          const d = Math.hypot(p.x - press.x, p.y - press.y) || 1;
          if (d < reach) {
            // Squared falloff: soft at the edge of the influence circle,
            // decisive at its centre.
            const f = 1 - d / reach;
            const nx = p.x - cx;
            const ny = p.y - cy;
            const nd = Math.hypot(nx, ny) || 1;
            const w = f * f * press.depth;
            p.x -= (nx / nd) * w;
            p.y -= (ny / nd) * w;
          }
        }
      }

      for (let pass = 0; pass < tuning.passes; pass++) {
        // 2. Neighbour smoothing
        for (let i = 0; i < count; i++) {
          const a = points[(i - 1 + count) % count];
          const b = points[(i + 1) % count];
          const p = points[i];
          p.x += ((a.x + b.x) / 2 - p.x) * tuning.smoothing;
          p.y += ((a.y + b.y) / 2 - p.y) * tuning.smoothing;
        }

        // 3. Pressure. The area deficit is pushed back out along each point's
        //    outward normal, which is what shifts material to the far side.
        const shove = ((restArea - areaOf()) / restArea) * restR * tuning.pressure;
        if (Math.abs(shove) > 0.001) {
          for (const p of points) {
            const dx = p.x - cx;
            const dy = p.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            p.x += (dx / d) * shove;
            p.y += (dy / d) * shove;
          }
        }
      }
    },

    trace(ctx) {
      // Catmull-Rom through every point, expressed as cubic beziers. A closed
      // spline is what keeps the outline reading as one soft surface — a
      // polyline through the points shows its facets once the body is squashed.
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < count; i++) {
        const p0 = points[(i - 1 + count) % count];
        const p1 = points[i];
        const p2 = points[(i + 1) % count];
        const p3 = points[(i + 2) % count];
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6,
          p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6,
          p2.y - (p3.y - p1.y) / 6,
          p2.x,
          p2.y,
        );
      }
    },
  };
}
