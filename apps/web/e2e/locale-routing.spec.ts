import { expect, test } from "@playwright/test";

const homes = [
  { path: "/pt", lang: "pt-PT", switcher: "Idioma", current: "Português", other: "English", otherPath: "/en" },
  { path: "/en", lang: "en", switcher: "Language", current: "English", other: "Português", otherPath: "/pt" },
];

test.describe("address without a locale", () => {
  test.describe("visitor who prefers English", () => {
    test.use({ locale: "en-GB" });

    test("is sent to /en", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
    });
  });

  test.describe("visitor who prefers Portuguese", () => {
    test.use({ locale: "pt-PT" });

    test("is sent to /pt", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/pt$/);
    });
  });
});

for (const home of homes) {
  test.describe(home.path, () => {
    test("declares its language on the html element", async ({ page }) => {
      await page.goto(home.path);
      await expect(page.locator("html")).toHaveAttribute("lang", home.lang);
    });

    test("marks the current language and leads to the other one", async ({ page }) => {
      await page.goto(home.path);
      const switcher = page.getByRole("navigation", { name: home.switcher });

      await expect(switcher.getByRole("link", { name: home.current })).toHaveAttribute(
        "aria-current",
        "true",
      );

      await switcher.getByRole("link", { name: home.other }).click();
      await expect(page).toHaveURL(new RegExp(`${home.otherPath}$`));
    });
  });
}

test("serves the favicon without a locale redirect", async ({ request }) => {
  const response = await request.get("/favicon.ico", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
});
