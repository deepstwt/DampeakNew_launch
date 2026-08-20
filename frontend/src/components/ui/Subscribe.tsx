"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

const INITIAL: SubscribeState = { status: "idle", message: "" };

export function Subscribe() {
  const [state, formAction, pending] = useActionState(subscribe, INITIAL);

  return (
    <form action={formAction} className="mt-7 max-w-[440px]">
      <label htmlFor="email" className="text-marker text-white/50">
        Email
      </label>

      <div className="mt-3 flex gap-2">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby="subscribe-status"
          aria-invalid={state.status === "error"}
          className="rounded-squish min-w-0 flex-1 bg-white/10 px-5 py-4 text-[16px] font-semibold text-white placeholder:text-white/35"
        />

        {/* Honeypot — hidden from people, offered to bots */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute size-0 opacity-0"
        />

        <button
          type="submit"
          disabled={pending}
          className="rounded-squish-alt inline-flex shrink-0 items-center gap-2 bg-yellow px-6 py-4 text-[16px] font-extrabold text-ink transition-transform active:scale-[0.97] disabled:opacity-60"
        >
          {pending ? "Sending" : "Join"}
          <ArrowRight className="size-[18px]" strokeWidth={3} />
        </button>
      </div>

      <p
        id="subscribe-status"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-[13px] font-semibold ${
          state.status === "error" ? "text-orange" : "text-yellow"
        }`}
      >
        {state.message}
      </p>
    </form>
  );
}
