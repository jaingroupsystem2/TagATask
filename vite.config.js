import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // Enables PWA in development
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2,woff,ttf}"], // Precaches important file types
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 86400 }, // 1 day
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-assets",
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 }, // 1 day
            },
          },
          {
            urlPattern: /^https:\/\/prioritease2-c953f12d76f1\.herokuapp\.com\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 }, // 1 day
            },
          },
        ],
      },
      manifest: {
        name: "Tag-A-Task App",
        short_name: "TagAtask",
        description: "A React PWA using Vite",
        start_url: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
