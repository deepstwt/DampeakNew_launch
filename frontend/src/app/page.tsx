import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/scenes/Hero";
import { Showcase } from "@/components/scenes/Showcase";
import { Quote } from "@/components/scenes/Quote";
import { Band } from "@/components/scenes/Band";
import { Footer } from "@/components/ui/Footer";

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
        <Band />
      </main>
      <Footer />
    </>
  );
}
