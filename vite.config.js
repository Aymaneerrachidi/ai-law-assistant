import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react_vendor: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
