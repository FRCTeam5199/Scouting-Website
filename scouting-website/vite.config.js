import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      // Tell Vite PWA to use your existing sw.js as-is without injecting Workbox
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",

      injectManifest: {
        injectionPoint: undefined, // Don't inject anything — use the file as-is
      },

      includeAssets: [
        "icons/redAllianceField-2026.png",
        "icons/blueAllianceField-2026.png",
        "icons/*.png",
        "*.png",
      ],

      manifest: {
        name: "FRC Scouting App",
        short_name: "Scouting",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});