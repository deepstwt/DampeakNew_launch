"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { COMPANY } from "@/content/legal";

/**
 * Send us a message.
 *
 * There is no inbox behind this site — no contact endpoint, no transactional
 * email — so the send is a `mailto:` the form composes as you type. The message
 * opens in whatever the visitor already uses for email, addressed and filled in,
 * and it genuinely arrives. A form that posts nowhere would look identical right
 * up to the moment someone needed an answer.
 *
 * The tradeoff is honest and worth stating: the visitor sees their own mail
 * client open, and they have to press send in it. That is the cost of not
 * pretending.
 */

const TOPICS = [
  "Order support",
  "Returns and refunds",
  "Product question",
  "Something else",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");

  const body = [
    message,
    "",
    "—",
    name ? `From: ${name}` : "",
    email ? `Reply to: ${email}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const href = `mailto:${COMPANY.supportEmail}?subject=${encodeURIComponent(
    `${topic} — Dampeak`,
  )}&body=${encodeURIComponent(body)}`;

  const field =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-ink placeholder:text-ink/30 transition-colors hover:border-ink/30";

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="text-marker text-ink/45">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className={`mt-2 ${field}`}
        />
      </div>

      <div>
        <label htmlFor="email" className="text-marker text-ink/45">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={`mt-2 ${field}`}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="topic" className="text-marker text-ink/45">
          Topic
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`mt-2 ${field}`}
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="text-marker text-ink/45">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your order number helps, if you have one."
          className={`mt-2 ${field} resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        {/* An anchor, not a submit: there is nothing to post to. It is disabled
            in the only way an anchor can be — by not being one — until there is
            a message to send. */}
        {message.trim() ? (
          <a
            href={href}
            className="rounded-squish inline-flex items-center gap-3 bg-brown px-8 py-4.5 text-[17px] font-extrabold text-white transition hover:brightness-150 active:scale-[0.98]"
          >
            Send message
            <ArrowRight className="size-5" strokeWidth={3} />
          </a>
        ) : (
          <span
            aria-disabled
            className="rounded-squish inline-flex cursor-not-allowed items-center gap-3 bg-ink/10 px-8 py-4.5 text-[17px] font-extrabold text-ink/35"
          >
            Send message
            <ArrowRight className="size-5" strokeWidth={3} />
          </span>
        )}

        <p className="mt-3 text-[13px] font-semibold text-ink/45">
          This opens the message in your own email app, addressed to{" "}
          {COMPANY.supportEmail}.
        </p>
      </div>
    </div>
  );
}
