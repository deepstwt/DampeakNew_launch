"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Finalizing } from "@/components/checkout/Finalizing";
import { formatUSD, fromCents } from "@/lib/money";

/**
 * The express-checkout sheet: what opens when one of the three wallets is tapped.
 *
 * A real wallet does not ask for a card. It already holds the card and the
 * address, which is the entire reason anyone taps one — so this sheet has no
 * fields in it. It shows who is paying, what it costs, where it is going, and
 * one button. The only thing it collects is the decision.
 *
 * Nothing here is connected to a payment network. The sheet used to say so in a
 * panel above the button and no longer does — the confirmation is where that is
 * said now, which is worth knowing if this flow is ever shown to someone who was
 * not told beforehand that it is a demonstration.
 *
 * The profile shown is the account the visitor is signed into, falling back to
 * whatever the form on the way here has. Nothing is invented: a wallet sheet
 * quoting a name the visitor never gave reads as a mistake in the first second,
 * so a row with nothing behind it is dropped instead of filled in.
 */

export type Wallet = {
  name: string;
  src: string;
  width: number;
  height: number;
  background: string;
  border: boolean;
  /** What this wallet calls its own express flow. */
  tag: string;
  /** The funding source it would have brought with it. */
  instrument: string;
};

/** How long the "finalizing" state is held, in ms. */
const FINALIZING = 1800;

export function WalletSheet({
  wallet,
  name,
  email,
  address,
  total,
  onCancel,
  onPaid,
}: {
  wallet: Wallet;
  name: string;
  email: string;
  address: string;
  total: number;
  onCancel: () => void;
  onPaid: () => void;
}) {
  const [finalizing, setFinalizing] = useState(false);
  const payRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Escape closes, and the page behind stops scrolling.
   *
   * Neither applies once the button is pressed: a payment that can be escaped
   * halfway is a payment that can land twice, and the one moment this flow
   * should not be interruptible is the moment it is pretending to talk to a
   * bank.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !finalizing) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [finalizing, onCancel]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The pay button, not the close button: the sheet opens on the thing the
    // visitor came to do.
    payRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // A timer left running after the sheet is gone calls onPaid on a screen that
  // has moved on.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pay = () => {
    if (finalizing) return;
    setFinalizing(true);
    timer.current = setTimeout(onPaid, FINALIZING);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-sheet-title"
    >
      {/* The page behind, dimmed. Clicking it is the same as cancelling, which
          is what every wallet sheet does — except mid-payment. */}
      <button
        type="button"
        aria-label="Cancel payment"
        tabIndex={-1}
        onClick={() => !finalizing && onCancel()}
        className="absolute inset-0 cursor-default bg-ink/55 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-5">
          <span
            className={`flex h-9 items-center justify-center overflow-hidden rounded-lg px-3 ${
              wallet.border ? "border border-ink/15" : ""
            }`}
            style={{ background: wallet.background }}
          >
            <Image
              src={wallet.src}
              alt={wallet.name}
              width={wallet.width}
              height={wallet.height}
              className="h-5 w-auto object-contain"
            />
          </span>

          <h2 id="wallet-sheet-title" className="text-[15px] font-extrabold">
            {wallet.tag}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            disabled={finalizing}
            aria-label="Close"
            className="ml-auto rounded-full p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        {finalizing ? (
          <Finalizing />
        ) : (
          <>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 rounded-2xl bg-ink/[0.04] px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brown text-[13px] font-extrabold text-white">
                  {initials(name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-extrabold">
                    {name || "Saved profile"}
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-ink/55">
                    {[email, wallet.instrument].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </div>

              <dl className="mt-5 space-y-3">
                {/* Only when there is one. The sheet opens whether or not the
                    form below it has been filled, and a "Ship to" with nothing
                    after it reads as a bug rather than as an empty field. */}
                {address ? (
                  <div className="flex justify-between gap-6">
                    <dt className="text-[14px] font-semibold text-ink/55">Ship to</dt>
                    <dd className="max-w-[26ch] text-right text-[14px] font-bold">
                      {address}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-6 border-t border-ink/10 pt-3">
                  <dt className="text-[15px] font-bold">Total due</dt>
                  <dd className="text-[19px] font-extrabold tabular-nums">
                    {formatUSD(fromCents(total))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="px-6 pb-6">
              <button
                ref={payRef}
                type="button"
                onClick={pay}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink px-6 py-4 text-[16px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.99]"
              >
                <Check className="size-5" strokeWidth={3} />
                Pay {formatUSD(fromCents(total))}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full text-[14px] font-bold text-ink/50 transition-colors hover:text-ink"
              >
                Cancel and return to Dampeak
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Two letters at most, and never an empty circle. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
