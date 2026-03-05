import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'



// Automatic Service Workers setup with Vite PWA plugin,
// which will handle caching and offline functionality for the app.
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "icons/redAllianceField-2026.png",
        "icons/blueAllianceField-2026.png"
      ],

      manifest: {
        name: "FRC Scouting App",
        short_name: "Scouting",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",

        icons: [
          {
            public: "blueAllianceField-2026.png",
            sizes: "534x382",
            type: "image/png"
          },
          {
            public: "redAllianceField-2026.png",
            sizes: "530x380",
            type: "image/png"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-cache"
            }
          }
        ]
      }
    })
  ]
});


// Automatically sends queued data to the server when back online
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /exec/,  // your Apps Script endpoint
        handler: 'NetworkOnly',
        options: {
          backgroundSync: {
            name: 'scoutingQueue',
            options: {
              maxRetentionTime: 24 * 60
            }
          }
        }
      }
    ]
  }
})
