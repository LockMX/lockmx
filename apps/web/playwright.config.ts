// Sources:
// https://playwright.dev/docs/test-webserver (webServer, reuseExistingServer)
// https://playwright.dev/docs/test-projects (browser and device projects)
// https://playwright.dev/docs/ci (one worker on CI)
// https://playwright.dev/docs/test-reporters (github reporter), https://playwright.dev/docs/api/class-testconfig#test-config-max-failures
// Bundled Next.js guide: 01-app/02-guides/testing/playwright.md (run against the production build)
import { defineConfig, devices } from "@playwright/test";

// Not 3000, so a development server left running is never reused by mistake.
const port = 3100;
const baseURL = `http://localhost:${port}`;

// The origin the pages are built with. In CI the build step sets the same value.
const siteUrl = "https://lockmx.com";

// Next.js is started with node, not through `pnpm exec`: when the run ends
// Playwright kills the process group of the command and waits for its output
// to close. On the Linux runner of CI the server outlived that kill behind
// pnpm, and the run never ended although every test had passed.
const next = "node node_modules/next/dist/bin/next";

// CI builds in its own step before the tests; locally the command builds first.
const start = `${next} start --port ${port}`;

// A second server on the same build, with the coming soon switch on (e2e/seo.spec.ts).
const comingSoonPort = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // A run where everything fails would retry every test until the job is
  // cancelled by hand: in CI it stops after a few failures instead.
  maxFailures: process.env.CI ? 10 : undefined,
  // The github reporter turns each failure into an annotation on the run.
  reporter: process.env.CI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
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
      command: process.env.CI ? start : `${next} build && ${start}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      // The tests cover the real pages, not the placeholder. The production
      // build needs the public origin (server/site/site-url.ts).
      env: { COMING_SOON: "false", SITE_URL: siteUrl },
    },
    {
      command: `${next} start --port ${comingSoonPort}`,
      url: `http://localhost:${comingSoonPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { COMING_SOON: "true", SITE_URL: siteUrl },
    },
  ],
});
