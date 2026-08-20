import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The backend workspace ships TypeScript source, not a build artefact.
  transpilePackages: ["@oscar/backend"],
  images: {
    // Placeholder photography only — swap for our own CDN before launch.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
