import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process"],
    }),
  ],
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    "process.env": {},
  },
});
