import { expect, test } from "@playwright/test";

// The origin the test server is built with (playwright.config.ts).
const origin = "https://lockmx.com";

const alternates = [
  { hreflang: "pt-PT", href: `${origin}/pt` },
  { hreflang: "en", href: `${origin}/en` },
  { hreflang: "x-default", href: `${origin}/pt` },
];

for (const path of ["/pt", "/en"]) {
  test.describe(`${path} head`, () => {
    test("has one canonical link pointing at itself", async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('head link[rel="canonical"]');

      await expect(canonical).toHaveCount(1);
      await expect(canonical).toHaveAttribute("href", `${origin}${path}`);
    });

    test("names both locales and the default as alternates", async ({ page }) => {
      await page.goto(path);

      for (const { hreflang, href } of alternates) {
        const link = page.locator(`head link[rel="alternate"][hreflang="${hreflang}"]`);
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute("href", href);
      }
    });
  });
}
