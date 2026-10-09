import { expect, test } from "@playwright/test";

const locales = [
  { path: "/pt", heading: "Página não encontrada", home: "Voltar ao início" },
  { path: "/en", heading: "Page not found", home: "Back to home" },
];

for (const locale of locales) {
  test.describe(`${locale.path}/does-not-exist`, () => {
    test("answers 404 with the translated page inside the shell", async ({ page }) => {
      const response = await page.goto(`${locale.path}/does-not-exist`);

      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: locale.heading })).toBeVisible();
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });

    test("links back to the home of the locale", async ({ page }) => {
      await page.goto(`${locale.path}/does-not-exist/deeper`);

      const home = page.getByRole("main").getByRole("link", { name: locale.home });
      await expect(home).toHaveAttribute("href", locale.path);
    });

    test("is not indexable", async ({ page }) => {
      await page.goto(`${locale.path}/does-not-exist`);

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  });
}
