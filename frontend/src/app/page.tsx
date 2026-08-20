import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/scenes/Hero";
import { Quote } from "@/components/scenes/Quote";
import { Band } from "@/components/scenes/Band";
import { Footer } from "@/components/ui/Footer";

/**
 * The Ranges grid and the Finder used to sit between Hero and Quote. Both existed
 * to route a visitor to one of four categories; with a flat catalogue of four
 * squishies there is nothing to route to, and the Hero already shows all four.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Quote />
        <Band />
      </main>
      <Footer />
    </>
  );
}
