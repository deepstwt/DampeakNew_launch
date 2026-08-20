import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dampeak",
    short_name: "Dampeak",
    description: "Small things that make the day easier.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f3cff",
  };
}
