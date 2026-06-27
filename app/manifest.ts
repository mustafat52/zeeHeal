import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "zeeheal",
    short_name: "zeeheal",
    description: "Your skin. Your weight. Your hormones. One root cause.",
    start_url: "/login",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#FAF8F3",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
