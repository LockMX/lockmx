import { expect, test } from "@playwright/test";

const locales = [
  {
    path: "/pt",
    skip: "Saltar para o conteúdo",
    mainNavigation: "Principal",
    footerNavigation: "Rodapé",
    home: "Início",
    logo: "LockMX, página inicial",
    language: "Idioma",
    complaintsBook: "Livro de Reclamações",
    other: "English",
    otherPath: "/en",
  },
  {
    path: "/en",
    skip: "Skip to content",
    mainNavigation: "Main",
    footerNavigation: "Footer",
    home: "Home",
    logo: "LockMX, home",
    language: "Language",
    complaintsBook: "Complaints Book",
    other: "Português",
    otherPath: "/pt",
  },
];

for (const locale of locales) {
  test.describe(`${locale.path} shell`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test("has one banner, one main and one content information landmark", async ({ page }) => {
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });

    test("names its navigation landmarks", async ({ page, isMobile }) => {
      const banner = page.getByRole("banner");
      const footer = page.getByRole("contentinfo");

      await expect(banner.getByRole("navigation", { name: locale.language })).toBeVisible();
      await expect(footer.getByRole("navigation", { name: locale.footerNavigation })).toBeVisible();
      await expect(footer.getByRole("navigation", { name: locale.language })).toBeVisible();

      // Below the `md` breakpoint the section links are in the footer only.
      const main = banner.getByRole("navigation", { name: locale.mainNavigation });
      if (isMobile) await expect(main).toBeHidden();
      else await expect(main).toBeVisible();
    });

    test("marks the home link as the current page", async ({ page }) => {
      const navigation = page
        .getByRole("contentinfo")
        .getByRole("navigation", { name: locale.footerNavigation });

      await expect(navigation.getByRole("link", { name: locale.home })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    test("links the logo to the home of the locale", async ({ page }) => {
      const logo = page.getByRole("banner").getByRole("link", { name: locale.logo });
      await expect(logo).toHaveAttribute("href", locale.path);
    });

    test("skip link is the first stop, shows on focus and moves focus to the content", async ({
      page,
    }) => {
      const skip = page.getByRole("link", { name: locale.skip });
      const first = page.locator("a[href], button, input, select, textarea, [tabindex]").first();

      await expect(skip).not.toBeInViewport();
      expect(await first.evaluate((element) => element.textContent)).toBe(locale.skip);

      await skip.focus();
      await expect(skip).toBeInViewport();

      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
    });

    test("links to the Complaints Book platform from the footer", async ({ page }) => {
      const link = page.getByRole("contentinfo").getByRole("link", { name: locale.complaintsBook });

      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", "https://www.livroreclamacoes.pt");
    });

    test("switches language from the footer and keeps the page", async ({ page }) => {
      await page
        .getByRole("contentinfo")
        .getByRole("navigation", { name: locale.language })
        .getByRole("link", { name: locale.other })
        .click();

      await expect(page).toHaveURL(new RegExp(`${locale.otherPath}$`));
    });

    test("does not scroll sideways", async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });

  test(`${locale.path}/coming-soon has no header and no footer`, async ({ page }) => {
    await page.goto(`${locale.path}/coming-soon`);

    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });
}

test("does not scroll sideways at 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/pt");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
