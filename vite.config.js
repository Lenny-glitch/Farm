import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/leaf.svg'],
      manifest: {
        name: 'FarmMapper',
        short_name: 'FarmMapper',
        description: 'Personal farm & land planning reference',
        theme_color: '#4a7c59',
        background_color: '#f6f3ea',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/leaf.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/leaf.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        // App shell + static assets cache-first so the UI loads with zero
        // connection. Firestore's own SDK persistence (persistentLocalCache)
        // handles offline reads/writes of catalog/user data separately —
        // this only covers the HTML/JS/CSS shell.
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
