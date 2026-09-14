import { ChevronRight } from "lucide-react";

/**
 * Cart → Information → Shipping → Payment.
 *
 * A breadcrumb by shape and a progress indicator by job. Steps behind the
 * current one are marked as done rather than merely unvisited: the same grey for
 * "filled in already" and "cannot be reached yet" tells a visitor nothing about
 * how far through they are.
 *
 * None of the steps is a destination — the flow runs in one page — so none of
 * these is a link. `aria-current` is what tells a screen reader which one is
 * open.
 */
export const STEPS = ["Cart", "Information", "Shipping", "Payment"] as const;

export type Step = (typeof STEPS)[number];

export function CheckoutSteps({ current }: { current: Step }) {
  const at = STEPS.indexOf(current);

  return (
    <nav aria-label="Checkout steps" className="mt-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-current={i === at ? "step" : undefined}
              className={`text-[13px] font-bold ${
                i === at ? "text-ink" : i < at ? "text-ink/55" : "text-ink/30"
              }`}
            >
              {step}
            </span>
            {i < STEPS.length - 1 ? (
              <ChevronRight
                aria-hidden
                className="size-3.5 text-ink/25"
                strokeWidth={3}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
