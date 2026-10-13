import { expect, test } from "@playwright/test";

const origin = "https://lockmx.com";

const locales = [
  {
    path: "/pt",
    title: "Um quartel-general sobre rodas",
    pageTitle: "Sistema modular | LockMX",
    parts: ["Suportes para capacetes", "Suportes para botas", "Cabides", "Prateleiras modulares"],
    opening: /^Criado para aventureiros/,
    why: "Mais tempo a rodar",
    benefits: 4,
    action: "Fala connosco",
  },
  {
    path: "/en",
    title: "A command center on wheels",
    pageTitle: "Modular system | LockMX",
    parts: ["Helmet mounts", "Boot mounts", "Hangers", "Modular shelves"],
    opening: /^Pure organization for those who live on the edge\./,
    why: "More time riding",
    benefits: 4,
    action: "Get in touch",
  },
];

for (const locale of locales) {
  const address = `${locale.path}/modular-system`;

  test.describe(address, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(address);
    });

    test("has one h1, the text of the client and the four parts", async ({ page }) => {
      const main = page.getByRole("main");
      const system = main.getByRole("region", { name: locale.title });

      await expect(main.getByRole("heading", { level: 1 })).toHaveText([locale.title]);
      await expect(system.getByText(locale.opening)).toBeVisible();
      await expect(system.getByRole("heading", { level: 2 })).toHaveText(locale.parts);
    });

    test("explains why after the parts and ends with the way to contact", async ({ page }) => {
      const why = page.getByRole("main").getByRole("region", { name: locale.why });

      await expect(why.getByRole("heading", { level: 3 })).toHaveCount(locale.benefits);
      await expect(why.getByRole("link")).toHaveCount(1);
      await expect(why.getByRole("link", { name: locale.action })).toHaveAttribute(
        "href",
        `${locale.path}/contact`,
      );
    });

    test("skips no heading level", async ({ page }) => {
      const levels = await page
        .getByRole("main")
        .getByRole("heading")
        .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));

      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
      }
    });

    test("has its own title, canonical address and place in the sitemap", async ({
      page,
      request,
    }) => {
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

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}
