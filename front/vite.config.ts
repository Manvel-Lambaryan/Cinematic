import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          'motion': ['framer-motion'],
          icons: ['lucide-react'],
          auth: ['@react-oauth/google', 'jwt-decode'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          http: ['axios'],
          forms: ['react-hook-form', 'react-imask'],
          state: ['zustand'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 600,
    target: 'esnext',
    cssCodeSplit: true,
  },
  server: {
    host: "0.0.0.0",
    port: 8888,
    strictPort: true,
    allowedHosts: [
      "192.168.65.148.nip.io",
    ],
  },
});
