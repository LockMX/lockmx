// Sources:
// https://nextjs.org/docs/app/guides/testing/vitest#manual-setup
// https://vite.dev/config/shared-options.html#resolve-tsconfigpaths
// Vite resolves tsconfig `paths` natively, so vite-tsconfig-paths (listed in
// the Next.js guide) is not needed.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
