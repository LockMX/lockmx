import { expect, test } from "@playwright/test";

const origin = "https://lockmx.com";
const instagram = "https://www.instagram.com/lockmx_modularsystem";

const locales = [
  {
    path: "/pt",
    title: "Contactos",
    subsections: ["E-mail", "Redes Sociais"],
    emailIcon: "E-mail",
  },
  {
    path: "/en",
    title: "Contact",
    subsections: ["Email", "Social media"],
    emailIcon: "Email",
  },
];

for (const locale of locales) {
  const address = `${locale.path}/contact`;

  test.describe(address, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(address);
    });

    test("has one h1 and a subsection for the email and one for the social networks", async ({
      page,
    }) => {
      const main = page.getByRole("main");

      await expect(main.getByRole("heading", { level: 1 })).toHaveText([locale.title]);
      await expect(main.getByRole("heading", { level: 2 })).toHaveText(locale.subsections);
    });

    test("shows the address as a mail link and the Instagram page of LockMX", async ({ page }) => {
      const main = page.getByRole("main");

      await expect(main.getByRole("link", { name: "crew@lockmx.com" })).toHaveAttribute(
        "href",
        "mailto:crew@lockmx.com",
      );
      const social = main.getByRole("link", { name: "@lockmx_modularsystem" });
      await expect(social).toHaveAttribute("href", instagram);
      await expect(social).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("has no form and asks for no data", async ({ page }) => {
      const main = page.getByRole("main");

      await expect(main.locator("form")).toHaveCount(0);
      await expect(main.locator("input, textarea")).toHaveCount(0);
    });

    test("the footer has the email, Instagram and Facebook icons under the logo", async ({ page }) => {
      const footer = page.getByRole("contentinfo");

      await expect(
        footer.getByRole("link", { name: locale.emailIcon, exact: true }),
      ).toHaveAttribute("href", "mailto:crew@lockmx.com");
      await expect(footer.getByRole("link", { name: "Instagram", exact: true })).toHaveAttribute(
        "href",
        instagram,
      );
      const facebook = footer.getByRole("link", { name: "Facebook", exact: true });
      await expect(facebook).toHaveAttribute("href", /^https:\/\/www\.facebook\.com\//);
      await expect(facebook).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("has its own title, canonical address and place in the sitemap", async ({
      page,
      request,
    }) => {
      await expect(page).toHaveTitle(`${locale.title} | LockMX`);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${origin}${address}`,
      );
      expect(await (await request.get("/sitemap.xml")).text()).toContain(
        `<loc>${origin}${address}</loc>`,
      );
    });

    for (const width of [320, 1440]) {
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
