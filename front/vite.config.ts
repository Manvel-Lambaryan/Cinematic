import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 8888,
    strictPort: true, // don't try another port if 8888 is busy
    allowedHosts: [
      "192.168.65.148.nip.io",
    ],
  },
});
