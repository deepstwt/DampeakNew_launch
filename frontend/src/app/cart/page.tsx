import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartScreen } from "@/components/cart/CartScreen";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

/**
 * The cart page — the furniture around CartScreen.
 *
 * Everything on it depends on what is in the browser's storage, so the contents
 * are client state and this file holds only what a server can settle: the
 * heading, the crumbs, and the header and footer every page carries.
 */

export const metadata: Metadata = {
  title: "Your cart",
  description: "The things you have added, before you check out.",
  // Per-visitor and never the same page twice — nothing for a crawler here.
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <Nav />

      <main id="top" className="bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "All products", href: "/products" },
              { label: "Cart" },
            ]}
          />

          <h1 className="text-display mt-8 text-[13vw] leading-[0.9] sm:text-[8vw] lg:text-[4.4vw]">
            Your cart
          </h1>

          <CartScreen />
        </div>
      </main>

      <Footer />
    </>
  );
}
