import { expect, test } from "@playwright/test";

const origin = "https://lockmx.com";

const locales = [
  {
    path: "/pt",
    mainNavigation: "Principal",
    footerNavigation: "Rodapé",
    menu: "Menu",
    link: "Sistema modular",
    heroAction: "Conhece o sistema",
    title: "Um quartel-general sobre rodas",
    pageTitle: "Sistema modular | LockMX",
    parts: ["Suportes para capacetes", "Suportes para botas", "Cabides", "Prateleiras modulares"],
    opening: /^Criado para aventureiros/,
  },
  {
    path: "/en",
    mainNavigation: "Main",
    footerNavigation: "Footer",
    menu: "Menu",
    link: "Modular system",
    heroAction: "See the system",
    title: "A command center on wheels",
    pageTitle: "Modular system | LockMX",
    parts: ["Helmet mounts", "Boot mounts", "Hangers", "Modular shelves"],
    opening: /^Pure organization for those who live on the edge\./,
  },
];

for (const locale of locales) {
  const address = `${locale.path}/modular-system`;

  test.describe(address, () => {
    test("is reached from the header", async ({ page, isMobile }) => {
      await page.goto(locale.path);
      const navigation = page
        .getByRole("banner")
        .getByRole("navigation", { name: locale.mainNavigation });

      if (isMobile) await navigation.getByRole("button", { name: locale.menu }).click();
      await navigation.getByRole("link", { name: locale.link, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${address}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.title);
    });

    test("is reached from the footer and from the hero of the landing page", async ({ page }) => {
      await page.goto(locale.path);

      await expect(
        page
          .getByRole("contentinfo")
          .getByRole("navigation", { name: locale.footerNavigation })
          .getByRole("link", { name: locale.link, exact: true }),
      ).toHaveAttribute("href", address);
      await expect(
        page.getByRole("main").getByRole("link", { name: locale.heroAction }),
      ).toHaveAttribute("href", address);
    });

    test("marks its header link as the current page", async ({ page, isMobile }) => {
      await page.goto(address);
      const navigation = page
        .getByRole("banner")
        .getByRole("navigation", { name: locale.mainNavigation });

      if (isMobile) await navigation.getByRole("button", { name: locale.menu }).click();
      await expect(
        navigation.getByRole("link", { name: locale.link, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    });

    test("has one h1, the text of the client and the four parts", async ({ page }) => {
      await page.goto(address);
      const main = page.getByRole("main");

      await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(main.getByRole("region", { name: locale.title })).toBeVisible();
      await expect(main.getByText(locale.opening)).toBeVisible();
      await expect(main.getByRole("heading", { level: 2 })).toHaveText(locale.parts);
    });

    test("has its own title, canonical address and place in the sitemap", async ({
      page,
      request,
    }) => {
      await page.goto(address);

      await expect(page).toHaveTitle(locale.pageTitle);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${origin}${address}`,
      );
      expect(await (await request.get("/sitemap.xml")).text()).toContain(
        `<loc>${origin}${address}</loc>`,
      );
    });

    for (const width of [320, 768, 1440]) {
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
