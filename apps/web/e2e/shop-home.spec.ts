import { expect, test, type Locator, type Page } from "@playwright/test";

// The shop sections of the landing page (spec 005, decision 1), with example data.
const locales = [
  {
    path: "/pt",
    title: "Lock it, send it!",
    featured: "Destaques",
    carousel: "Produtos em destaque",
    example: "Exemplo",
    pause: "Pausar rotação",
    play: "Retomar rotação",
    previous: "Anterior",
    next: "Seguinte",
    firstProduct: "Suporte de exemplo para capacetes",
    lastProduct: "Cabide de exemplo",
    contactHref: "/pt/contact",
  },
  {
    path: "/en",
    title: "Lock it, send it!",
    featured: "Featured",
    carousel: "Featured products",
    example: "Example",
    pause: "Pause rotation",
    play: "Resume rotation",
    previous: "Previous",
    next: "Next",
    firstProduct: "Example helmet support",
    lastProduct: "Example hanger",
    contactHref: "/en/contact",
  },
];

const EXAMPLES = 6;

function carouselOf(page: Page, name: string): Locator {
  return page.getByRole("main").getByRole("region", { name, exact: true });
}

for (const locale of locales) {
  test.describe(`${locale.path} featured products`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test("the page has one h1 and the section is the first under it", async ({ page }) => {
      const main = page.getByRole("main");

      await expect(page.getByRole("heading", { level: 1 })).toHaveText([locale.title]);
      await expect(main.getByRole("heading", { level: 2 }).first()).toHaveText(locale.featured);
      await expect(main.getByRole("region", { name: locale.featured, exact: true })).toBeVisible();
    });

    test("has one card per example product, each marked as an example", async ({ page }) => {
      const carousel = carouselOf(page, locale.carousel);

      await expect(carousel.locator("article")).toHaveCount(EXAMPLES);
      await expect(carousel.getByText(locale.example, { exact: true })).toHaveCount(EXAMPLES);
      await expect(carousel.getByRole("heading", { level: 3 }).first()).toHaveText(
        locale.firstProduct,
      );
    });

    test("an example card leads to the contact page", async ({ page }) => {
      const link = carouselOf(page, locale.carousel).getByRole("link", {
        name: locale.firstProduct,
      });

      await expect(link).toHaveAttribute("href", locale.contactHref);
    });

    test("the rotation control comes before the cards and pauses and resumes", async ({ page }) => {
      const carousel = carouselOf(page, locale.carousel);
      const firstControl = carousel.getByRole("button").first();

      await expect(firstControl).toHaveAccessibleName(locale.pause);
      await firstControl.click();
      await expect(firstControl).toHaveAccessibleName(locale.play);
      await firstControl.click();
      await expect(firstControl).toHaveAccessibleName(locale.pause);
    });

    test("next and previous move the row, and wrap at the ends", async ({ page }) => {
      const carousel = carouselOf(page, locale.carousel);
      const first = carousel.getByRole("link", { name: locale.firstProduct });
      const last = carousel.getByRole("link", { name: locale.lastProduct });
      // Paused first, so only the buttons move it.
      await carousel.getByRole("button", { name: locale.pause }).click();
      await carousel.scrollIntoViewIfNeeded();

      await expect(first).toBeInViewport();
      await carousel.getByRole("button", { name: locale.previous }).click();
      await expect(last).toBeInViewport();
      await expect(first).not.toBeInViewport();
      await carousel.getByRole("button", { name: locale.next }).click();
      await expect(first).toBeInViewport();
    });

    test("cards out of view cannot be reached with the keyboard", async ({ page }) => {
      const carousel = carouselOf(page, locale.carousel);
      await carousel.getByRole("button", { name: locale.pause }).click();
      await carousel.scrollIntoViewIfNeeded();

      // Hidden from assistive technology and inert: found only by a plain locator.
      const hidden = carousel.locator("[inert]");
      await expect(hidden).not.toHaveCount(0);
      await expect(carousel.locator("[role=group]:not([inert])")).not.toHaveCount(0);
      await expect(
        carousel.locator("[role=group]:not([inert])").getByRole("link").first(),
      ).toBeInViewport();
    });

    test("tabbing into it stops the rotation", async ({ page }) => {
      const carousel = carouselOf(page, locale.carousel);
      const control = carousel.getByRole("button").first();
      await expect(control).toHaveAccessibleName(locale.pause);

      await control.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");

      await expect(control).toBeFocused();
      await expect(control).toHaveAccessibleName(locale.play);
    });

    test("does not scroll the page sideways at 320 px", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await expect(carouselOf(page, locale.carousel)).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("with reduced motion the carousel starts paused", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt");

  await expect(
    carouselOf(page, "Produtos em destaque").getByRole("button").first(),
  ).toHaveAccessibleName("Retomar rotação");
});

// The corner brackets of a large card of the shop sections (spec 006, T6).
test.describe("the shop section cards", () => {
  function card(page: Page) {
    return page
      .getByRole("main")
      .getByRole("region", { name: "Loja", exact: true })
      .getByRole("link", { name: "Pneus" });
  }

  function bracketsOpacity(link: Locator) {
    return link.locator(".lock-brackets").evaluate((element) => getComputedStyle(element).opacity);
  }

  test("lock when one is tapped on a device without hover, then lead to its section", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Only a device without hover plays the effect on a tap.");
    await page.goto("/pt");
    const link = card(page);
    const wrapper = link.locator("..");

    await link.scrollIntoViewIfNeeded();
    await expect(wrapper).not.toHaveAttribute("data-active");
    await expect.poll(() => bracketsOpacity(link)).toBe("0");

    await link.tap();
    await expect(wrapper).toHaveAttribute("data-active");
    await expect(page).toHaveURL(/\/pt\/shop\/tyres$/);
  });

  test("lock on hover and on keyboard focus, and stay one link", async ({ page, isMobile }) => {
    test.skip(isMobile, "The mobile project has no hover.");
    await page.goto("/pt");
    const link = card(page);

    await expect.poll(() => bracketsOpacity(link)).toBe("0");
    await link.hover();
    await expect.poll(() => bracketsOpacity(link)).toBe("1");
    await expect(link.locator("..")).not.toHaveAttribute("data-active");

    await page.mouse.move(0, 0);
    await expect.poll(() => bracketsOpacity(link)).toBe("0");
    // Desktop WebKit does not move to links with Tab by default. A key pressed
    // before the focus moves makes it keyboard focus (`:focus-visible`).
    await page.keyboard.press("Shift");
    await link.focus();
    await expect(link).toBeFocused();
    await expect.poll(() => bracketsOpacity(link)).toBe("1");
  });
});
