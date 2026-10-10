import { expect, test } from "@playwright/test";

// The pages wait for the company data and the policy texts of the client
// (spec 004, T7). Until then each one only says it is being prepared.
const locales = [
  {
    path: "/pt",
    legalNavigation: "Legal",
    pending: "Em implementação",
    home: "Voltar ao início",
    pages: [
      { slug: "company", title: "Informação da empresa" },
      { slug: "privacy", title: "Política de privacidade" },
      { slug: "cookies", title: "Política de cookies" },
      { slug: "terms", title: "Termos e condições" },
    ],
  },
  {
    path: "/en",
    legalNavigation: "Legal",
    pending: "Under construction",
    home: "Back to home",
    pages: [
      { slug: "company", title: "Company information" },
      { slug: "privacy", title: "Privacy policy" },
      { slug: "cookies", title: "Cookie policy" },
      { slug: "terms", title: "Terms and conditions" },
    ],
  },
];

for (const locale of locales) {
  for (const legalPage of locale.pages) {
    const address = `${locale.path}/${legalPage.slug}`;

    test.describe(address, () => {
      test("is one click from the home page, in the footer", async ({ page }) => {
        await page.goto(locale.path);
        await page
          .getByRole("contentinfo")
          .getByRole("navigation", { name: locale.legalNavigation })
          .getByRole("link", { name: legalPage.title })
          .click();

        await expect(page).toHaveURL(new RegExp(`${address}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(legalPage.title);
      });

      test("says it is being prepared, inside the shell, with a link home", async ({ page }) => {
        const response = await page.goto(address);

        expect(response?.status()).toBe(200);
        await expect(page.getByRole("banner")).toHaveCount(1);
        await expect(page.getByRole("contentinfo")).toHaveCount(1);
        await expect(page.getByRole("main").getByText(locale.pending)).toBeVisible();
        await expect(
          page.getByRole("main").getByRole("link", { name: locale.home }),
        ).toHaveAttribute("href", locale.path);
      });

      test("has its own title and is kept out of search engines", async ({ page }) => {
        await page.goto(address);

        await expect(page).toHaveTitle(`${legalPage.title} | LockMX`);
        await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
          "content",
          /noindex/,
        );
      });

      test("marks its footer link as the current page", async ({ page }) => {
        await page.goto(address);

        await expect(
          page
            .getByRole("contentinfo")
            .getByRole("navigation", { name: locale.legalNavigation })
            .getByRole("link", { name: legalPage.title }),
        ).toHaveAttribute("aria-current", "page");
      });
    });
  }
}

test("the sitemap does not list the pages while they are placeholders", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  for (const slug of ["company", "privacy", "cookies", "terms"]) {
    expect(xml).not.toContain(`/${slug}<`);
  }
});

test("the footer does not scroll sideways at 320 px with the legal links", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/pt/privacy");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
