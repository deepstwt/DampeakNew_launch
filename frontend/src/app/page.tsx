import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/scenes/Hero";
import { Showcase } from "@/components/scenes/Showcase";
import { Quote } from "@/components/scenes/Quote";
import { Band } from "@/components/scenes/Band";
import { Footer } from "@/components/ui/Footer";
import { BrandRule } from "@/components/ui/BrandRule";

/**
 * Four sections, in the order the copy deck sets them:
 *
 *   Hero      — Made for Better Everyday
 *   Showcase  — Shop Your Relaxation (the four products)
 *   Quote     — the one rule
 *   Band      — Something Soft for Stressful Moments
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Showcase />
        <Quote />
        {/* Brown meets brown here — the quote's flat colour against the top edge
            of the photograph below. The rule is what makes that a join rather
            than a mismatch. */}
        <BrandRule middle="bg-cocoa" />
        <Band />
      </main>
      <Footer />
    </>
  );
}
