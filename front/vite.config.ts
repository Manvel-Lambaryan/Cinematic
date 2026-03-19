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
          ui: ['framer-motion', 'lucide-react'],
          auth: ['@react-oauth/google', 'jwt-decode'],
          utils: ['axios', 'i18next', 'react-i18next'],
          forms: ['react-hook-form', 'react-imask'],
          state: ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
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
