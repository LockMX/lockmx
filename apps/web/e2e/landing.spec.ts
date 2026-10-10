import { expect, test, type Locator, type Page } from "@playwright/test";

const locales = [
  {
    path: "/pt",
    mainNavigation: "Principal",
    menu: "Menu",
    title: "Lock it, send it!",
    headings: [
      "Mais tempo a rodar",
      "Pronto para arrumar a carrinha?",
      "Tudo para motocross",
      "Fala connosco",
    ],
    sections: [
      { link: "Porquê", id: "why", heading: "Mais tempo a rodar" },
      { link: "Contacto", id: "contact", heading: "Fala connosco" },
    ],
    primaryAction: "Fala connosco",
    secondaryAction: "Conhece o sistema",
    description: /^A tua loja online de motocross\./,
  },
  {
    path: "/en",
    mainNavigation: "Main",
    menu: "Menu",
    title: "Lock it, send it!",
    headings: [
      "More time riding",
      "Ready to sort out your van?",
      "Everything for motocross",
      "Get in touch",
    ],
    sections: [
      { link: "Why", id: "why", heading: "More time riding" },
      { link: "Contact", id: "contact", heading: "Get in touch" },
    ],
    primaryAction: "Get in touch",
    secondaryAction: "See the system",
    description: /^Your online motocross shop\./,
  },
];

// The heading a link jumps to must stop below the sticky header, not under it.
async function expectBelowHeader(page: Page, heading: Locator) {
  await expect(heading).toBeInViewport();
  await expect
    .poll(async () => {
      const header = await page.getByRole("banner").boundingBox();
      const target = await heading.boundingBox();
      if (!header || !target) return false;
      return target.y >= header.y + header.height - 1;
    })
    .toBe(true);
}

for (const locale of locales) {
  test.describe(`${locale.path} landing page`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test("has one h1 with the tagline", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.title);
    });

    test("has the section headings in order, each naming a region", async ({ page }) => {
      const main = page.getByRole("main");

      await expect(main.getByRole("heading", { level: 2 })).toHaveText(locale.headings);
      for (const heading of locale.headings) {
        await expect(main.getByRole("region", { name: heading })).toBeVisible();
      }
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

    test("moves to each section from the header and the focus follows", async ({
      page,
      isMobile,
    }) => {
      const navigation = page
        .getByRole("banner")
        .getByRole("navigation", { name: locale.mainNavigation });

      for (const section of locale.sections) {
        if (isMobile) await navigation.getByRole("button", { name: locale.menu }).click();
        await navigation.getByRole("link", { name: section.link, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${locale.path}#${section.id}$`));
        await expect(page.locator(`#${section.id}`)).toBeFocused();
        await expectBelowHeader(
          page,
          page.getByRole("main").getByRole("heading", { name: section.heading, level: 2 }),
        );
      }
    });

    test("the hero actions are reached with the keyboard and lead where they say", async ({
      page,
    }) => {
      const hero = page.getByRole("region", { name: locale.title });
      const primary = hero.getByRole("link", { name: locale.primaryAction });
      const secondary = hero.getByRole("link", { name: locale.secondaryAction });

      await expect(primary).toHaveAttribute("href", `${locale.path}#contact`);
      await expect(secondary).toHaveAttribute("href", `${locale.path}/modular-system`);

      await secondary.focus();
      await expect(secondary).toBeFocused();

      await primary.focus();
      await expect(primary).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${locale.path}#contact$`));
      await expect(page.locator("#contact")).toBeFocused();
    });

    test("a section link on another page opens the landing page with the focus on the section", async ({
      page,
      isMobile,
    }) => {
      await page.goto(`${locale.path}/no-such-page`);
      const navigation = page
        .getByRole("banner")
        .getByRole("navigation", { name: locale.mainNavigation });
      const section = locale.sections[0];

      if (isMobile) await navigation.getByRole("button", { name: locale.menu }).click();
      await navigation.getByRole("link", { name: section.link, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${locale.path}#${section.id}$`));
      await expect(page.locator(`#${section.id}`)).toBeFocused();
      await expectBelowHeader(
        page,
        page.getByRole("main").getByRole("heading", { name: section.heading, level: 2 }),
      );
    });

    test("opening the address of a section puts the focus on it", async ({ page }) => {
      await page.goto(`${locale.path}#contact`);

      await expect(page.locator("#contact")).toBeFocused();
    });

    test("shows the contact address as a mail link", async ({ page }) => {
      const link = page.locator("#contact").getByRole("link", { name: "crew@lockmx.com" });

      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", "mailto:crew@lockmx.com");
    });

    test("every image has dimensions and an alternative text", async ({ page }) => {
      const images = await page.getByRole("main").locator("img").evaluateAll((elements) =>
        elements.map((element) => ({
          width: element.getAttribute("width"),
          height: element.getAttribute("height"),
          alt: element.getAttribute("alt"),
        })),
      );

      for (const image of images) {
        expect(Number(image.width)).toBeGreaterThan(0);
        expect(Number(image.height)).toBeGreaterThan(0);
        expect(image.alt).not.toBeNull();
      }
    });

    test("has the short description of the client as meta description", async ({ page }) => {
      await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
        "content",
        locale.description,
      );
    });

    test("states no price", async ({ page }) => {
      await expect(page.getByRole("main")).not.toContainText(/€|EUR/);
    });

    for (const width of [320, 768, 1024, 1440]) {
      test(`does not scroll sideways at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test("shows every header link beside the logo at the md breakpoint", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 800 });
      const banner = page.getByRole("banner");
      const navigation = banner.getByRole("navigation", { name: locale.mainNavigation });

      for (const section of locale.sections) {
        await expect(navigation.getByRole("link", { name: section.link, exact: true })).toBeVisible();
      }

      const header = await banner.boundingBox();
      const lastLink = await navigation.getByRole("link").last().boundingBox();
      expect(lastLink && header && lastLink.y + lastLink.height <= header.y + header.height).toBe(
        true,
      );
    });
  });
}
