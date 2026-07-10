import { defineConfig } from "vitest/config";
import path from "path";
import type { Plugin } from "vite";

function stripNextDirectives(): Plugin {
  return {
    name: "strip-next-directives",
    transform(code) {
      return code
        .replace(/^["']use server["'];?\s*/m, "")
        .replace(/^["']use client["'];?\s*/m, "");
    },
  };
}

export default defineConfig({
  plugins: [stripNextDirectives()],
  test: {
    environment: "node",
    pool: "vmThreads",
  },
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "src/$1") },
    ],
  },
});
