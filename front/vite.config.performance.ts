import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          auth: ['@react-oauth/google', 'google-auth-library', 'jwt-decode'],
          utils: ['axios', 'i18next', 'react-i18next'],
          forms: ['react-hook-form', 'react-imask'],
          state: ['zustand'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Minify options
    minify: 'terser',
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "0.0.0.0",
    port: 8888,
    strictPort: true,
    allowedHosts: [
      "192.168.65.148.nip.io",
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
