// Sources:
// https://nextjs.org/docs/app/guides/testing/vitest#manual-setup
// https://vite.dev/config/shared-options.html#resolve-tsconfigpaths
// Vite resolves tsconfig `paths` natively, so vite-tsconfig-paths (listed in
// the Next.js guide) is not needed.
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // Server modules import `server-only`, which only Next.js resolves.
    alias: { "server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // End-to-end tests are run by Playwright (pnpm test:e2e).
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
