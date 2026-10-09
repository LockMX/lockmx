// Sources:
// https://playwright.dev/docs/test-webserver (webServer, reuseExistingServer)
// https://playwright.dev/docs/test-projects (browser and device projects)
// https://playwright.dev/docs/ci (one worker on CI)
// Bundled Next.js guide: 01-app/02-guides/testing/playwright.md (run against the production build)
import { defineConfig, devices } from "@playwright/test";

// Not 3000, so a development server left running is never reused by mistake.
const port = 3100;
const baseURL = `http://localhost:${port}`;

// CI builds in its own step before the tests; locally the command builds first.
const start = `pnpm exec next start --port ${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: process.env.CI ? start : `pnpm exec next build && ${start}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // The tests cover the real pages, not the placeholder.
    env: { COMING_SOON: "false" },
  },
});
