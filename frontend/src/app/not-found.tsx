import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { DOCS } from "@/content/legal";

export default function NotFound() {
  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32">
          <p className="text-marker text-ink/35">404</p>

          <h1 className="text-display mt-6 max-w-[14ch] text-[14vw] leading-[0.86] sm:text-[9vw] lg:text-[6vw]">
            That page has <span className="text-orange">moved on.</span>
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-squish inline-flex items-center gap-3 bg-brown px-8 py-5 text-[17px] font-extrabold text-white transition-transform active:scale-[0.97]"
            >
              Back to the start
              <ArrowRight className="size-5" strokeWidth={3} />
            </Link>
            <Link
              href="/contact"
              className="rounded-squish-alt bg-yellow px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
            >
              Tell us what broke
            </Link>
          </div>

          <nav aria-label="Site pages" className="mt-16 border-t border-ink/10 pt-8">
            <ul className="flex flex-wrap gap-2">
              {DOCS.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/${doc.slug}`}
                    className="text-marker rounded-squish-alt inline-block border border-ink/15 px-4 py-2.5 text-ink/60 transition-colors hover:border-ink/40 hover:text-ink"
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
}
