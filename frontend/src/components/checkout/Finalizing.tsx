"use client";

import { Loader2 } from "lucide-react";

/**
 * The wait between pressing pay and being told it worked.
 *
 * Shared by the wallet sheet and the card form, because the two have to feel
 * like the same moment — they are the same moment, and a card that confirms
 * instantly while a wallet takes two seconds reads as one of them not having
 * done anything.
 *
 * It is doing nothing at all, and it still earns its place: every real payment
 * has this pause, and a confirmation that appears on the same frame as the click
 * does not read as a payment. It reads as a link.
 */
export function Finalizing() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-brown" strokeWidth={2.5} />
      <p className="text-[17px] font-extrabold">Finalizing your payment…</p>
      <p className="text-[14px] font-semibold text-ink/50">
        Do not close this window.
      </p>
    </div>
  );
}
