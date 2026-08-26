import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { DOCS, LEGAL_DRAFT, getDoc } from "@/content/legal";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/** Only the documents below exist at this level; anything else 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[doc]">): Promise<Metadata> {
  const { doc: slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical: `/${doc.slug}` },
    openGraph: { title: doc.title, description: doc.summary, type: "article" },
  };
}

export default async function DocPage({ params }: PageProps<"/[doc]">) {
  const { doc: slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <article className="mx-auto max-w-[760px] px-6 py-16 md:py-24">
          <Link
            href="/"
            className="text-marker inline-flex items-center gap-2 text-ink/40 transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={3} />
            Back
          </Link>

          <h1 className="text-display mt-8 text-[13vw] leading-[0.9] sm:text-[8vw] lg:text-[4.6vw]">
            {doc.title}
          </h1>
          <p className="mt-5 text-[18px] leading-relaxed text-ink/55">{doc.summary}</p>
          <p className="text-marker mt-6 text-ink/35">Last updated {doc.updated}</p>

          {LEGAL_DRAFT && doc.legal !== false ? (
            <p className="mt-8 rounded-2xl bg-yellow px-5 py-4 text-[14px] font-bold text-ink">
              Draft — placeholder text in brackets still needs completing, and this
              document has not yet been reviewed by a lawyer.
            </p>
          ) : null}


          <div className="mt-12 space-y-10">
            {doc.format === "faq"
              ? doc.sections.map((section) => (
                  <details
                    key={section.heading}
                    className="group border-b border-ink/10 pb-5"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-[19px] font-extrabold marker:content-['']">
                      {section.heading}
                      <ChevronDown
                        className="size-5 shrink-0 text-ink/40 transition-transform group-open:rotate-180"
                        strokeWidth={3}
                      />
                    </summary>
                    {section.body?.map((p) => (
                      <p key={p} className="mt-4 text-[17px] leading-relaxed text-ink/65">
                        {p}
                      </p>
                    ))}
                  </details>
                ))
              : doc.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-[22px] font-extrabold tracking-tight">
                      {section.heading}
                    </h2>

                    {section.body?.map((p) => (
                      <p key={p} className="mt-4 text-[17px] leading-relaxed text-ink/65">
                        {p}
                      </p>
                    ))}

                    {section.list ? (
                      <ul className="mt-4 space-y-2.5">
                        {section.list.map((li) => (
                          <li
                            key={li}
                            className="flex gap-3 text-[17px] leading-relaxed text-ink/65"
                          >
                            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-blue" />
                            {li}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
          </div>

          {/* One way onward, where the document has one. About only. */}
          {doc.cta ? (
            <Link
              href={doc.cta.href}
              className="rounded-squish mt-14 inline-flex items-center gap-3 bg-blue px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
            >
              {doc.cta.label}
              <ArrowRight className="size-5" strokeWidth={3} />
            </Link>
          ) : null}

          {/* Cross-links: policies are useless if you can't get between them */}
          <nav aria-label="Other pages" className="mt-16 border-t border-ink/10 pt-8">
            <ul className="flex flex-wrap gap-2">
              {DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/${d.slug}`}
                    className="text-marker rounded-squish-alt inline-block border border-ink/15 px-4 py-2.5 text-ink/60 transition-colors hover:border-ink/40 hover:text-ink"
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </main>

      <Footer />
    </>
  );
}
