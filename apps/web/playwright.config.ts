// Sources:
// https://playwright.dev/docs/test-webserver (webServer, reuseExistingServer)
// https://playwright.dev/docs/test-projects (browser and device projects)
// https://playwright.dev/docs/ci (one worker on CI)
// Bundled Next.js guide: 01-app/02-guides/testing/playwright.md (run against the production build)
import { defineConfig, devices } from "@playwright/test";

// Not 3000, so a development server left running is never reused by mistake.
const port = 3100;
const baseURL = `http://localhost:${port}`;

// The origin the pages are built with. In CI the build step sets the same value.
const siteUrl = "https://lockmx.com";

// CI builds in its own step before the tests; locally the command builds first.
const start = `pnpm exec next start --port ${port}`;

// A second server on the same build, with the coming soon switch on (e2e/seo.spec.ts).
const comingSoonPort = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  // Firefox is slow when the four projects run in parallel: a test there went
  // over the default 30 s, and a client navigation over the default 5 s.
  timeout: 60_000,
  expect: { timeout: 10_000 },
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
  webServer: [
    {
      command: process.env.CI ? start : `pnpm exec next build && ${start}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      // The tests cover the real pages, not the placeholder. The production
      // build needs the public origin (server/site/site-url.ts).
      env: { COMING_SOON: "false", SITE_URL: siteUrl },
    },
    {
      command: `pnpm exec next start --port ${comingSoonPort}`,
      url: `http://localhost:${comingSoonPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { COMING_SOON: "true", SITE_URL: siteUrl },
    },
  ],
});
