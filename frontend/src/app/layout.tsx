import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { COMPANY } from "@/content/legal";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dampeak — Made for Better Everyday",
    template: "%s — Dampeak",
  },
  description:
    "Thoughtfully designed products that make everyday life easier and better — from comfort, to relaxation, to fun. Four stress squeeze squish toys: Rounded Cube, Toasted Bread, Cheese Cube and Marbled Cube.",
  applicationName: "Dampeak",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Dampeak",
    url: SITE_URL,
    title: "Dampeak — Made for Better Everyday",
    description:
      "Four stress squeeze squish toys, made for the moments your hands need something to do.",
  },
  // TODO: drop a 1200x630 PNG at public/og.png and add
  //   openGraph.images / twitter.images pointing at it.
  //   The dynamic next/og route failed under Node 26 (sharp: "unsupported image
  //   format"), and a 500ing image endpoint is worse for crawlers than none.
  twitter: {
    card: "summary",
    title: "Dampeak — Made for Better Everyday",
    description:
      "Four stress squeeze squish toys, made for the moments your hands need something to do.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
  colorScheme: "light",
};

/** Organization data, so search engines can attribute the brand correctly. */
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Dampeak",
  url: SITE_URL,
  description: "Made for Better Everyday.",
  email: COMPANY.email,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: COMPANY.supportEmail,
      availableLanguage: ["en"],
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Extensions inject attributes onto <html> before React hydrates
    // (data-psi-id and friends). Suppressing here covers that one element only.
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        {/* Warm the TLS handshake to Google before sign-in needs it: One Tap
            loads its script from accounts.google.com, and the redirect fallback
            navigates to the same host. Saves the connection setup either way. */}
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body className="bg-white text-ink">
        {/* First tab stop on every page — required for keyboard users */}
        <a
          href="#top"
          className="sr-only rounded-squish focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-[15px] focus:font-extrabold focus:text-white"
        >
          Skip to content
        </a>

        <SmoothScroll>{children}</SmoothScroll>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
      </body>
    </html>
  );
}
