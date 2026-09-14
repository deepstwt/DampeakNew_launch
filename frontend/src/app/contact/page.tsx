import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Mail, Package, Phone } from "lucide-react";
import { site } from "@/content/site";
import { COMPANY } from "@/content/legal";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

/**
 * Contact — a page of its own rather than another entry in DOCS.
 *
 * Every other document under /[doc] is a wall of headed prose, which is right
 * for a policy and wrong for the one page whose whole job is to get someone to a
 * person. This one is two columns: the four products on the left, the ways to
 * reach us on the right.
 *
 * The left column is the products because that is what the visitor is writing
 * about. The reference this was built to had a stock photograph there; a
 * photograph of the actual catalogue says the same thing and is ours.
 */

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to a person at ${site.name} — by phone, by email, or from this page.`,
  alternates: { canonical: "/contact" },
};

/** The three ways in, before the form. */
const CARDS = [
  {
    icon: Phone,
    title: "Call us",
    lines: [COMPANY.phone],
    note: `Our customer care team is available ${COMPANY.hours}.`,
    href: COMPANY.phoneHref,
  },
  {
    icon: Mail,
    title: "Email us",
    lines: [COMPANY.supportEmail],
    note: "Include your order number if you have one — it gets you a faster answer.",
    href: `mailto:${COMPANY.supportEmail}`,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <div className="lg:grid lg:grid-cols-2">
          {/**
           * The page's picture: the product being used, not the product on a
           * white tile. Every other image on this site is a packshot; this is
           * the one place that shows what owning one looks like.
           *
           * Sticky on a wide screen so it holds while the right-hand column
           * scrolls past it, and hidden below lg — stacked, a full-height
           * photograph would stand between a visitor and a phone number.
           */}
          <aside className="relative hidden bg-brown lg:block">
            {/* Offset by the header rather than pinned to the top of the
                viewport. The nav is sticky and 90px tall, so a full-height
                panel at top-0 hangs 90px below the fold — and what falls off
                the bottom is the line the panel is there to say. */}
            <div className="sticky top-[90px] h-[calc(100vh-90px)]">
              <Image
                src="/lifestyle/contact.webp"
                alt="A man sitting outside in the late afternoon, squeezing a yellow squishy."
                fill
                priority
                sizes="(max-width: 1024px) 0px, 50vw"
                className="object-cover"
              />

              {/* The caption sits on the photograph, so it needs its own ground.
                  A scrim from the foot of the image rather than a flat overlay:
                  the picture stays the picture, and the words stay readable. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-12">
                <p className="text-marker flex items-center gap-3 text-yellow">
                  <span aria-hidden className="h-0.5 w-6 bg-yellow" />
                  Customer care
                </p>
                <p className="text-display mt-4 max-w-[16ch] text-[2.6vw] leading-[1.05] text-white">
                  We&apos;re here to help you every step of the way.
                </p>
              </div>
            </div>
          </aside>

          <div className="px-6 py-14 md:px-10 lg:px-14 lg:py-20">
            <div className="mx-auto max-w-[620px] lg:mx-0">
              <p className="text-marker inline-block rounded-full bg-cream px-4 py-2 text-ink/70">
                We answer every message
              </p>

              <h1 className="text-display mt-6 text-[11vw] leading-[0.92] sm:text-[7vw] lg:text-[3.4vw]">
                Talk to a person
              </h1>

              <p className="mt-6 text-[17px] leading-relaxed font-medium text-ink/65">
                Questions about an order, a return, or which squishy is the soft
                one — our team answers them. You can also call us on{" "}
                <a
                  href={COMPANY.phoneHref}
                  className="font-extrabold text-ink underline decoration-2 underline-offset-4"
                >
                  {COMPANY.phone}
                </a>
                .
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-ink/10 py-5">
                <p className="flex items-center gap-2.5 text-[15px] font-bold">
                  <Phone aria-hidden className="size-4 text-brown" strokeWidth={2.6} />
                  {COMPANY.phone}
                </p>
                <p className="flex items-center gap-2.5 text-[15px] font-bold text-ink/60">
                  <Clock aria-hidden className="size-4 text-brown" strokeWidth={2.6} />
                  {COMPANY.hours}
                </p>
              </div>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {CARDS.map((card) => (
                  <li
                    key={card.title}
                    className="rounded-2xl border border-ink/10 p-6"
                  >
                    <p className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="inline-flex size-10 items-center justify-center rounded-full bg-cream"
                      >
                        <card.icon className="size-[18px] text-brown" strokeWidth={2.4} />
                      </span>
                      <span className="text-marker text-ink">{card.title}</span>
                    </p>

                    {card.lines.map((line) => (
                      <a
                        key={line}
                        href={card.href}
                        className="mt-5 block text-[17px] font-extrabold break-words underline decoration-2 underline-offset-4 transition-colors hover:text-brown"
                      >
                        {line}
                      </a>
                    ))}

                    <p className="mt-4 border-t border-ink/10 pt-4 text-[14px] leading-relaxed font-semibold text-ink/50">
                      {card.note}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-2xl border border-ink/10 p-6">
                <p className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-10 items-center justify-center rounded-full bg-cream"
                  >
                    <Package className="size-[18px] text-brown" strokeWidth={2.4} />
                  </span>
                  <span className="text-marker text-ink">Returns</span>
                </p>
                <p className="mt-5 text-[16px] leading-relaxed text-ink/65">
                  All returns are pre-authorised. Email us first and read the{" "}
                  <Link
                    href="/returns"
                    className="font-extrabold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brown"
                  >
                    Refund &amp; Return Policy
                  </Link>{" "}
                  — items must be requested within 30 days of delivery, unused
                  and in their original condition.
                </p>
              </div>

              <section className="mt-14 border-t border-ink/10 pt-10">
                <h2 className="text-[22px] font-extrabold tracking-tight">
                  Send us a message
                </h2>
                <ContactForm />
              </section>

              {/**
               * The parts a policy page used to carry, kept because they are
               * required rather than because they are interesting: who we are,
               * and how a complaint escalates under the Consumer Protection
               * (E-Commerce) Rules 2020.
               */}
              <section className="mt-14 border-t border-ink/10 pt-10">
                <h2 className="text-[22px] font-extrabold tracking-tight">
                  Complaints
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-ink/65">
                  If we have got something wrong, say so and we will fix it. If
                  you are still unhappy, you can escalate to the grievance officer
                  below, as required by the Consumer Protection (E-Commerce) Rules
                  2020.
                </p>
                <p className="mt-3 text-[16px] leading-relaxed text-ink/65">
                  Grievance Officer: [Name], [email], [phone]. We acknowledge
                  complaints within 48 hours and resolve them within one month.
                </p>
              </section>

              <section className="mt-12">
                <h2 className="text-marker text-ink/45">Company details</h2>
                <dl className="mt-4 space-y-2 text-[15px]">
                  {[
                    ["Registered name", COMPANY.legalName],
                    ["Trading as", COMPANY.trading],
                    ["Registration number", COMPANY.cin],
                    ["GSTIN", COMPANY.gstin],
                    ["General enquiries", COMPANY.email],
                    ["Privacy requests", COMPANY.privacyEmail],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold text-ink/45">{label}:</dt>
                      <dd className="font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
