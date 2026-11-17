import { expect, test } from "@playwright/test";

// The privacy policy, kept in the repository (spec 004, T7).
const locales = [
  {
    path: "/pt",
    title: "Política de privacidade",
    lastUpdated: "Última atualização: 16 de novembro de 2026",
    contents: "ÍNDICE",
    firstSection: "1. QUE INFORMAÇÕES RECOLHEMOS?",
  },
  {
    path: "/en",
    title: "Privacy policy",
    lastUpdated: "Last updated November 16, 2026",
    contents: "TABLE OF CONTENTS",
    firstSection: "1. WHAT INFORMATION DO WE COLLECT?",
  },
];

for (const locale of locales) {
  const address = `${locale.path}/privacy-policy`;

  test.describe(address, () => {
    test("is one click from the home page, in the footer", async ({ page }) => {
      await page.goto(locale.path);
      await page
        .getByRole("contentinfo")
        .getByRole("navigation", { name: "Legal" })
        .getByRole("link", { name: locale.title })
        .click();

      await expect(page).toHaveURL(new RegExp(`${address}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.title);
    });

    test("shows the policy text, with its sections", async ({ page }) => {
      const response = await page.goto(address);

      expect(response?.status()).toBe(200);
      const main = page.getByRole("main");
      await expect(main.getByText(locale.lastUpdated)).toBeVisible();
      await expect(main.getByRole("heading", { level: 2, name: locale.contents })).toBeVisible();
      await expect(main.getByRole("table")).toBeVisible();
    });

    test("leads the contents to its section", async ({ page }) => {
      await page.goto(address);
      await page.getByRole("main").getByRole("link", { name: locale.firstSection }).click();

      await expect(page).toHaveURL(new RegExp(`${address}#infocollect$`));
      await expect(
        page.getByRole("heading", { level: 2, name: locale.firstSection }),
      ).toBeInViewport();
    });

    test("has its own title and canonical address, and can be indexed", async ({ page }) => {
      await page.goto(address);

      await expect(page).toHaveTitle(`${locale.title} | LockMX`);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${address}$`),
      );
      await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
    });

    test("marks its footer link as the current page", async ({ page }) => {
      await page.goto(address);

      await expect(
        page
          .getByRole("contentinfo")
          .getByRole("navigation", { name: "Legal" })
          .getByRole("link", { name: locale.title }),
      ).toHaveAttribute("aria-current", "page");
    });

    for (const width of [320, 768, 1024, 1440]) {
      test(`does not scroll sideways at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(address);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test("the sitemap lists the privacy policy in both languages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  expect(xml).toContain("/pt/privacy-policy<");
  expect(xml).toContain("/en/privacy-policy<");
});

test("the old address is gone", async ({ page }) => {
  const response = await page.goto("/pt/privacy");

  expect(response?.status()).toBe(404);
});
