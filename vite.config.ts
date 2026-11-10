/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// Theme colours here must match `src/styles/tokens.css` (--bg) and index.html.
const THEME_COLOR = "#0b0d17";

export default defineConfig({
  server: { host: "::", port: 8080 },
  preview: { port: 4173 },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: { astronomy: ["astronomy-engine"], react: ["react", "react-dom", "react-router"] },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // "prompt": a new service worker waits until the user accepts the update,
      // so a running session never mixes old and new chunks.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Calwiz — Cosmic Calendar",
        short_name: "Calwiz",
        description:
          "The Moon, the planets and the numbers of every day. Real astronomical calculations, symbolic astrology and numerology — private and offline.",
        lang: "en",
        dir: "ltr",
        start_url: "/?source=pwa",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "any",
        background_color: THEME_COLOR,
        theme_color: THEME_COLOR,
        categories: ["lifestyle", "education", "utilities"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icons/monochrome.svg", sizes: "any", type: "image/svg+xml", purpose: "monochrome" },
        ],
        shortcuts: [
          { name: "Moon tonight", short_name: "Moon", url: "/moon?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
          { name: "Calendar", short_name: "Calendar", url: "/calendar?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,webmanifest}"],
        // Only Latin + Latin-extended font subsets are precached; others load on demand.
        globIgnores: ["**/*vietnamese*", "**/*cyrillic*", "**/*greek*", "**/og-image.png"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        // Never cache the optional AI webhook; it is network-only by design.
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Pin the process zone so date tests are deterministic on any machine.
    env: { TZ: "UTC" },
  },
});
