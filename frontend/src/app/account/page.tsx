import type { Metadata } from "next";
import Link from "next/link";
import { listSaved, isAuthConfigured } from "@oscar/backend";
import { PRODUCTS } from "@/content/site";
import { getViewer } from "@/lib/session";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/ui/ProductCard";
import { SignInButton } from "@/components/ui/SignInButton";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/**
 * Saved products.
 *
 * noindex: it is per-visitor and behind a sign-in, so there is nothing here for a
 * crawler to file. Leaving it indexable would put an empty "Sign in" page in
 * search results under the site's own name.
 */
/** Per-visitor by definition — never prerendered, never cached across people. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your saved products",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const viewer = await getViewer();

  // Slugs are resolved against the catalogue in code, so a save of a product that
  // has since been renamed simply drops out rather than rendering a hole.
  const savedSlugs = viewer ? await listSaved(viewer.id) : [];
  const saved = savedSlugs
    .map((slug) => PRODUCTS.find((p) => p.slug === slug))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Saved" }]}
          />

          <h1 className="text-display mt-8 text-[13vw] leading-[0.9] sm:text-[8vw] lg:text-[4.4vw]">
            {viewer ? "Saved" : "Sign in"}
          </h1>

          {!isAuthConfigured ? (
            <p className="mt-6 max-w-[52ch] text-[17px] font-medium text-ink/60">
              Accounts aren&rsquo;t switched on for this deployment yet.
            </p>
          ) : !viewer ? (
            <>
              <p className="mt-6 max-w-[52ch] text-[17px] font-medium text-ink/60">
                Sign in to keep a list of the ones you like. That is all an account
                does here — buying happens on Amazon, so there is nothing else to
                keep track of.
              </p>
              <SignInButton className="mt-8" callbackURL="/account" />
            </>
          ) : saved.length === 0 ? (
            <>
              <p className="mt-6 max-w-[52ch] text-[17px] font-medium text-ink/60">
                Nothing saved yet. Press Save on any product and it will show up
                here.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-yellow px-8 py-4 text-[16px] font-extrabold text-ink transition hover:brightness-95"
              >
                See all four
              </Link>
            </>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
              {saved.map((item, i) => (
                <li key={item.slug}>
                  <ProductCard item={item} priority={i < 2} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
