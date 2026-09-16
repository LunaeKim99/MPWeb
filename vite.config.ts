import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import type { PluginOption } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react() as PluginOption],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
