import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


// Automatic Service Workers setup with Vite PWA plugin,
// which will handle caching and offline functionality for the app.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Scouting App',
        short_name: 'Scouting',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        // icons: [
        //   {
        //     src: '/icon-192.png',
        //     sizes: '192x192',
        //     type: 'image/png'
        //   },
        //   {
        //     src: '/icon-512.png',
        //     sizes: '512x512',
        //     type: 'image/png'
        //   }
        // ]
      }
    })
  ]
})


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
