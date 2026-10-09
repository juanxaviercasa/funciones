import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Funciones Lab",
        short_name: "Funciones",
        lang: "es",
        description: "Aprende funciones con práctica adaptativa y gráficas.",
        theme_color: "#5557d9",
        background_color: "#f6f7fb",
        display: "standalone",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,woff2,webp}"],
        maximumFileSizeToCacheInBytes: 4_000_000,
        navigateFallback: "index.html",
      },
    }),
  ],
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { sourcemap: false, target: "es2022", chunkSizeWarningLimit: 500 },
});
