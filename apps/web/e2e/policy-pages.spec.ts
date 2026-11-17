import { expect, test } from "@playwright/test";

// The policy texts kept in the repository (spec 004, T7).
const pages = [
  {
    address: "/pt/privacy-policy",
    home: "/pt",
    title: "Política de privacidade",
    lastUpdated: "Última atualização: 16 de novembro de 2026",
    firstHeading: "ÍNDICE",
    firstSection: "1. QUE INFORMAÇÕES RECOLHEMOS?",
    firstSectionId: "infocollect",
  },
  {
    address: "/en/privacy-policy",
    home: "/en",
    title: "Privacy policy",
    lastUpdated: "Last updated November 16, 2026",
    firstHeading: "TABLE OF CONTENTS",
    firstSection: "1. WHAT INFORMATION DO WE COLLECT?",
    firstSectionId: "infocollect",
  },
  {
    address: "/pt/terms",
    home: "/pt",
    title: "Termos e condições",
    lastUpdated: "Última atualização 16 de novembro de 2026",
    firstHeading: "ÍNDICE",
    firstSection: "1. OS NOSSOS SERVIÇOS",
    firstSectionId: "services",
  },
  {
    address: "/en/terms",
    home: "/en",
    title: "Terms and conditions",
    lastUpdated: "Last updated November 16, 2026",
    firstHeading: "TABLE OF CONTENTS",
    firstSection: "1. OUR SERVICES",
    firstSectionId: "services",
  },
  {
    address: "/pt/returns",
    home: "/pt",
    title: "Política de devolução",
    lastUpdated: "Última atualização: 16 de novembro de 2026",
    firstHeading: "DEVOLUÇÕES",
    firstSection: "",
    firstSectionId: "",
  },
  {
    address: "/en/returns",
    home: "/en",
    title: "Return policy",
    lastUpdated: "Last updated November 16, 2026",
    firstHeading: "RETURNS",
    firstSection: "",
    firstSectionId: "",
  },
];

for (const policy of pages) {
  const { address } = policy;

  test.describe(address, () => {
    test("is one click from the home page, in the footer", async ({ page }) => {
      await page.goto(policy.home);
      await page
        .getByRole("contentinfo")
        .getByRole("navigation", { name: "Legal" })
        .getByRole("link", { name: policy.title })
        .click();

      await expect(page).toHaveURL(new RegExp(`${address}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(policy.title);
    });

    test("shows the policy text, with its first section", async ({ page }) => {
      const response = await page.goto(address);

      expect(response?.status()).toBe(200);
      const main = page.getByRole("main");
      await expect(main.getByText(policy.lastUpdated)).toBeVisible();
      await expect(main.getByRole("heading", { level: 2, name: policy.firstHeading, exact: true })).toBeVisible();
    });

    test("leads the contents to its section", async ({ page }) => {
      test.skip(!policy.firstSectionId, "a policy without a table of contents");
      await page.goto(address);
      await page
        .getByRole("main")
        .getByRole("link", { name: policy.firstSection, exact: true })
        .click();

      await expect(page).toHaveURL(new RegExp(`${address}#${policy.firstSectionId}$`));
      await expect(
        page.getByRole("heading", { level: 2, name: policy.firstSection, exact: true }),
      ).toBeInViewport();
    });

    test("has its own title and canonical address, and can be indexed", async ({ page }) => {
      await page.goto(address);

      await expect(page).toHaveTitle(`${policy.title} | LockMX`);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${address}$`),
      );
      await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
    });

    test("marks its footer link as the current page", async ({ page }) => {
      await page.goto(address);

      await expect(
        page
          .getByRole("contentinfo")
          .getByRole("navigation", { name: "Legal" })
          .getByRole("link", { name: policy.title }),
      ).toHaveAttribute("aria-current", "page");
    });

    for (const width of [320, 768, 1024, 1440]) {
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

test("the privacy policy shows its table", async ({ page }) => {
  await page.goto("/en/privacy-policy");

  await expect(page.getByRole("main").getByRole("table")).toBeVisible();
});

test("the sitemap lists the policies in both languages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  for (const policy of pages) {
    expect(xml).toContain(`${policy.address}<`);
  }
});

for (const old of ["/pt/privacy"]) {
  test(`the old address ${old} is gone`, async ({ page }) => {
    const response = await page.goto(old);

    expect(response?.status()).toBe(404);
  });
}
