import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Адрес бэкенда знает только дев-сервер: в коде приложения запросы идут по относительному /api.
// По умолчанию — реальный сервер (make api), для Prism-мока — API_PROXY_TARGET=http://localhost:4010.
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
