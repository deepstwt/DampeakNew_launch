import { ChevronRight } from "lucide-react";

/**
 * Cart → Information → Shipping → Payment.
 *
 * A breadcrumb by shape and a progress indicator by job, which is why the steps
 * behind you are links and the ones ahead are not: you can go back to what you
 * have already filled in, and you cannot skip to a step that has nothing in it
 * yet. Marking the current one with aria-current is what tells a screen reader
 * where in the flow it is.
 *
 * None of the destinations exist yet. Rather than link to 404s, the past steps
 * are rendered as text too — the shape is right, and it starts working the day
 * the steps do.
 */
const STEPS = ["Cart", "Information", "Shipping", "Payment"] as const;

const CURRENT = "Information";

export function CheckoutSteps() {
  return (
    <nav aria-label="Checkout steps" className="mt-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {STEPS.map((step, i) => {
          const isCurrent = step === CURRENT;
          return (
            <li key={step} className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={`text-[13px] font-bold ${
                  isCurrent ? "text-ink" : "text-ink/40"
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
          );
        })}
      </ol>
    </nav>
  );
}
