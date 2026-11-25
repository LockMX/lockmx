import { expect, test } from "@playwright/test";

// The landing page as the home of the shop (spec 005, decision 1), with the
// example data: every section of the shop has a large card.
const locales = [
  {
    path: "/pt",
    mainNavigation: "Principal",
    footerNavigation: "Rodapé",
    menu: "Menu",
    title: "Lock it, send it!",
    headings: ["Destaques", "Loja"],
    navigation: [
      { link: "Início", href: "/pt" },
      { link: "Sistema modular", href: "/pt/modular-system", heading: "Um quartel-general sobre rodas" },
      { link: "Merchandise", href: "/pt/shop/merchandise", heading: "Merchandise" },
      { link: "Contactos", href: "/pt/contact", heading: "Contactos" },
    ],
    cards: [
      { title: "Suportes LockMX", href: "/pt/shop/racks" },
      { title: "Pneus", href: "/pt/shop/tyres" },
      { title: "Merchandise", href: "/pt/shop/merchandise" },
    ],
    gone: ["Catálogo", "Categorias", "Pronto para arrumar a carrinha?", "Mais tempo a rodar"],
    primaryAction: "Ver a loja",
    secondaryAction: "Conhece o sistema",
    shop: "Loja",
    description: /^A tua loja online de motocross\./,
  },
  {
    path: "/en",
    mainNavigation: "Main",
    footerNavigation: "Footer",
    menu: "Menu",
    title: "Lock it, send it!",
    headings: ["Featured", "Shop"],
    navigation: [
      { link: "Home", href: "/en" },
      { link: "Modular system", href: "/en/modular-system", heading: "A command center on wheels" },
      { link: "Merchandise", href: "/en/shop/merchandise", heading: "Merchandise" },
      { link: "Contact", href: "/en/contact", heading: "Contact" },
    ],
    cards: [
      { title: "LockMX mounts", href: "/en/shop/racks" },
      { title: "Tyres", href: "/en/shop/tyres" },
      { title: "Merchandise", href: "/en/shop/merchandise" },
    ],
    gone: ["Catalogue", "Categories", "Ready to sort out your van?", "More time riding"],
    primaryAction: "See the shop",
    secondaryAction: "See the system",
    shop: "Shop",
    description: /^Your online motocross shop\./,
  },
];

for (const locale of locales) {
  test.describe(`${locale.path} landing page`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test("has one h1 with the tagline", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText([locale.title]);
    });

    test("has the featured products and then the shop sections, each a named region", async ({
      page,
    }) => {
      const main = page.getByRole("main");

      await expect(main.getByRole("heading", { level: 2 })).toHaveText(locale.headings);
      for (const heading of locale.headings) {
        await expect(main.getByRole("region", { name: heading, exact: true })).toBeVisible();
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

    test("has one large card per section of the shop, each leading to its listing", async ({
      page,
    }) => {
      const section = page
        .getByRole("main")
        .getByRole("region", { name: locale.headings[1], exact: true });

      await expect(section.getByRole("heading", { level: 3 })).toHaveText(
        locale.cards.map((card) => card.title),
      );
      await expect(section.getByRole("link")).toHaveCount(locale.cards.length);
      for (const card of locale.cards) {
        await expect(section.getByRole("link", { name: card.title })).toHaveAttribute(
          "href",
          card.href,
        );
      }

      await section.getByRole("link", { name: locale.cards[1].title }).click();
      await expect(page).toHaveURL(new RegExp(`${locale.cards[1].href}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText([locale.cards[1].title]);
    });

    test("no longer has the catalogue heading, the system, the benefits or the contact section", async ({
      page,
    }) => {
      const main = page.getByRole("main");

      for (const text of locale.gone) {
        await expect(main.getByText(text, { exact: true })).toHaveCount(0);
      }
      await expect(page.locator("#contact, #system, #why")).toHaveCount(0);
      await expect(main.getByRole("search")).toHaveCount(0);
    });

    test("the hero actions are reached with the keyboard and lead to the shop and to the system", async ({
      page,
    }) => {
      const hero = page.getByRole("region", { name: locale.title });
      const primary = hero.getByRole("link", { name: locale.primaryAction });
      const secondary = hero.getByRole("link", { name: locale.secondaryAction });

      await expect(primary).toHaveAttribute("href", `${locale.path}/shop`);
      await expect(secondary).toHaveAttribute("href", `${locale.path}/modular-system`);

      await secondary.focus();
      await expect(secondary).toBeFocused();

      await primary.focus();
      await expect(primary).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${locale.path}/shop$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText([locale.shop]);
    });

    test("the header and the footer have the four entries, each leading to its page", async ({
      page,
      isMobile,
    }) => {
      const header = page
        .getByRole("banner")
        .getByRole("navigation", { name: locale.mainNavigation });
      const footer = page
        .getByRole("contentinfo")
        .getByRole("navigation", { name: locale.footerNavigation });

      if (isMobile) await header.getByRole("button", { name: locale.menu }).click();
      // On a narrow screen the menu also holds the language links, after these.
      const first = header.getByRole("link").filter({ visible: true });
      for (const [index, entry] of locale.navigation.entries()) {
        await expect(first.nth(index)).toHaveText(entry.link);
      }
      for (const entry of locale.navigation) {
        await expect(
          header.getByRole("link", { name: entry.link, exact: true }),
        ).toHaveAttribute("href", entry.href);
        await expect(
          footer.getByRole("link", { name: entry.link, exact: true }),
        ).toHaveAttribute("href", entry.href);
      }
    });

    for (const entry of locale.navigation.slice(1)) {
      test(`the header leads to ${entry.href} and marks it as the current page`, async ({
        page,
        isMobile,
      }) => {
        const header = page
          .getByRole("banner")
          .getByRole("navigation", { name: locale.mainNavigation });

        if (isMobile) await header.getByRole("button", { name: locale.menu }).click();
        await header.getByRole("link", { name: entry.link, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${entry.href}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText([entry.heading ?? ""]);
        if (isMobile) await header.getByRole("button", { name: locale.menu }).click();
        await expect(
          header.getByRole("link", { name: entry.link, exact: true }),
        ).toHaveAttribute("aria-current", "page");
      });
    }

    test("opening the address of a section puts the focus on it", async ({ page }) => {
      await page.goto(`${locale.path}#featured`);

      await expect(page.locator("#featured")).toBeFocused();
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

    for (const width of [320, 768, 1024, 1440]) {
      test(`does not scroll sideways at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test("shows every header link on one line beside the logo at the lg breakpoint", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 800 });
      const banner = page.getByRole("banner");
      const navigation = banner.getByRole("navigation", { name: locale.mainNavigation });
      const tops = [];

      for (const entry of locale.navigation) {
        const link = navigation.getByRole("link", { name: entry.link, exact: true });
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        if (!box) throw new Error("The header was not laid out");
        tops.push([Math.round(box.y), Math.round(box.height)]);
      }

      // A wrapped entry would be taller than the others or sit on another line.
      expect(new Set(tops.map(([y, height]) => `${y}:${height}`)).size).toBe(1);
    });
  });
}
