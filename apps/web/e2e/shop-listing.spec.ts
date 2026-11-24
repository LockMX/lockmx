import { expect, test } from "@playwright/test";

// The listings of the shop (spec 005, T13), with example data.
const locales = [
  {
    path: "/pt",
    filters: "Filtros",
    sectionsNav: "Secções",
    products: "Produtos",
    example: "Exemplo",
    availability: "Disponibilidade",
    inStock: "Em stock",
    soldOut: "Esgotado",
    apply: "Aplicar",
    clear: "Limpar filtros",
    empty: "Nenhum produto corresponde aos filtros.",
    search: "Pesquisar produtos",
    // A search of the example shop: one section and two products.
    query: "pneu",
    querySection: "Pneus",
    noMatch: "Nenhum produto corresponde à pesquisa.",
    shop: "Loja",
    all: "Todos",
    sections: [
      { key: "racks", title: "Suportes LockMX", count: 4, first: "Suporte de exemplo para capacetes" },
      { key: "tyres", title: "Pneus", count: 2, first: "Pneu traseiro de exemplo" },
      { key: "merchandise", title: "Merchandise", count: 3, first: "T-shirt de exemplo" },
    ],
  },
  {
    path: "/en",
    filters: "Filters",
    sectionsNav: "Sections",
    products: "Products",
    example: "Example",
    availability: "Availability",
    inStock: "In stock",
    soldOut: "Sold out",
    apply: "Apply",
    clear: "Clear filters",
    empty: "No product matches the filters.",
    search: "Search products",
    query: "tyre",
    querySection: "Tyres",
    noMatch: "No product matches the search.",
    shop: "Shop",
    all: "All",
    sections: [
      { key: "racks", title: "LockMX mounts", count: 4, first: "Example helmet support" },
      { key: "tyres", title: "Tyres", count: 2, first: "Example rear tyre" },
      { key: "merchandise", title: "Merchandise", count: 3, first: "Example T-shirt" },
    ],
  },
];

for (const locale of locales) {
  for (const section of locale.sections) {
    const address = `${locale.path}/shop/${section.key}`;

    test.describe(address, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(address);
      });

      test("is named by its section and shows only its products, each an example", async ({
        page,
      }) => {
        const main = page.getByRole("main");
        const grid = main.getByRole("region", { name: locale.products, exact: true });

        await expect(main.getByRole("heading", { level: 1 })).toHaveText([section.title]);
        await expect(grid.locator("article")).toHaveCount(section.count);
        await expect(grid.getByText(locale.example, { exact: true })).toHaveCount(section.count);
        await expect(grid.getByRole("heading", { level: 3 }).first()).toHaveText(section.first);
      });

      test("the filters mark this section and lead to the others", async ({ page }) => {
        const navigation = page
          .getByRole("complementary", { name: locale.filters })
          .getByRole("navigation", { name: locale.sectionsNav });

        await expect(
          navigation.getByRole("link", { name: section.title, exact: true }),
        ).toHaveAttribute("aria-current", "page");
        for (const other of locale.sections) {
          await expect(
            navigation.getByRole("link", { name: other.title, exact: true }),
          ).toHaveAttribute("href", `${locale.path}/shop/${other.key}`);
        }
      });

      test("has its own title and canonical address", async ({ page }) => {
        await expect(page).toHaveTitle(`${section.title} | LockMX`);
        await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
          "href",
          `https://lockmx.com${address}`,
        );
      });
    });
  }

  test.describe(`${locale.path}/shop/racks filters`, () => {
    const address = `${locale.path}/shop/racks`;

    test("sold out narrows the grid, stays in the address and survives a reload", async ({
      page,
    }) => {
      await page.goto(address);
      const filters = page.getByRole("complementary", { name: locale.filters });
      const grid = page.getByRole("main").getByRole("region", { name: locale.products, exact: true });

      await filters.getByRole("checkbox", { name: locale.soldOut }).check();
      await filters.getByRole("button", { name: locale.apply }).click();

      await expect(page).toHaveURL(new RegExp(`${address}\\?availability=out$`));
      await expect(grid.locator("article")).toHaveCount(1);

      await page.reload();
      await expect(grid.locator("article")).toHaveCount(1);
      await expect(filters.getByRole("checkbox", { name: locale.soldOut })).toBeChecked();
      await expect(filters.getByRole("checkbox", { name: locale.inStock })).not.toBeChecked();

      await filters.getByRole("link", { name: locale.clear }).click();
      await expect(page).toHaveURL(new RegExp(`${address}$`));
      await expect(grid.locator("article")).toHaveCount(4);
    });

    test("the filters are worked with the keyboard", async ({ page }) => {
      await page.goto(address);
      const filters = page.getByRole("complementary", { name: locale.filters });

      await filters.getByRole("checkbox", { name: locale.inStock }).focus();
      await page.keyboard.press("Space");
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL(new RegExp(`${address}\\?availability=in$`));
      await expect(
        page.getByRole("main").getByRole("region", { name: locale.products, exact: true }).locator("article"),
      ).toHaveCount(3);
    });

    test("a result without products says so", async ({ page }) => {
      await page.goto(`${locale.path}/shop/tyres?availability=out`);
      const grid = page.getByRole("main").getByRole("region", { name: locale.products, exact: true });

      await expect(grid.locator("article")).toHaveCount(0);
      await expect(grid.getByRole("status")).toHaveText(locale.empty);
    });

    test("a value the filter does not know changes nothing", async ({ page }) => {
      await page.goto(`${address}?availability=everything&sort=price`);

      await expect(
        page.getByRole("main").getByRole("region", { name: locale.products, exact: true }).locator("article"),
      ).toHaveCount(4);
    });

    test("has the search bar and skips no heading level", async ({ page }) => {
      await page.goto(address);
      const main = page.getByRole("main");

      await expect(main.getByRole("combobox", { name: locale.search })).toBeVisible();
      const levels = await main
        .getByRole("heading")
        .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
      }
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

  test.describe(`${locale.path}/shop`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${locale.path}/shop`);
    });

    test("lists every product of every section and marks the first filter link", async ({
      page,
    }) => {
      const main = page.getByRole("main");
      const total = locale.sections.reduce((sum, section) => sum + section.count, 0);

      await expect(main.getByRole("heading", { level: 1 })).toHaveText([locale.shop]);
      await expect(
        main.getByRole("region", { name: locale.products, exact: true }).locator("article"),
      ).toHaveCount(total);
      await expect(
        page
          .getByRole("complementary", { name: locale.filters })
          .getByRole("link", { name: locale.all, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    });

    test("the availability filter works on the whole shop", async ({ page }) => {
      const filters = page.getByRole("complementary", { name: locale.filters });

      await filters.getByRole("checkbox", { name: locale.soldOut }).check();
      await filters.getByRole("button", { name: locale.apply }).click();

      await expect(page).toHaveURL(new RegExp(`${locale.path}/shop\\?availability=out$`));
      await expect(
        page.getByRole("main").getByRole("region", { name: locale.products, exact: true }).locator("article"),
      ).toHaveCount(2);
    });

    test("a search lists the products that match, and keeps the text in the field", async ({
      page,
    }) => {
      const main = page.getByRole("main");
      const field = main.getByRole("combobox", { name: locale.search });

      await field.fill(locale.query);
      await field.press("Enter");

      await expect(page).toHaveURL(new RegExp(`${locale.path}/shop\\?q=${locale.query}$`));
      await expect(
        main.getByRole("region", { name: locale.products, exact: true }).locator("article"),
      ).toHaveCount(2);
      await expect(main.getByRole("combobox", { name: locale.search })).toHaveValue(locale.query);
    });

    test("suggests while typing, and a section suggestion leads to its listing", async ({
      page,
    }) => {
      const field = page.getByRole("main").getByRole("combobox", { name: locale.search });

      await field.pressSequentially(locale.query);
      const options = page.getByRole("listbox").getByRole("option");
      await expect(options).toHaveCount(3);
      await options.filter({ hasText: locale.querySection }).click();

      await expect(page).toHaveURL(new RegExp(`${locale.path}/shop/tyres$`));
    });

    test("the availability filter keeps the search", async ({ page }) => {
      await page.goto(`${locale.path}/shop?q=${locale.query}`);
      const filters = page.getByRole("complementary", { name: locale.filters });

      await filters.getByRole("checkbox", { name: locale.inStock }).check();
      await filters.getByRole("button", { name: locale.apply }).click();

      await expect(page).toHaveURL(
        new RegExp(`${locale.path}/shop\\?q=${locale.query}&availability=in$`),
      );
    });

    test("a search that finds nothing says so", async ({ page }) => {
      await page.goto(`${locale.path}/shop?q=zzzz`);

      await expect(
        page.getByRole("main").getByRole("region", { name: locale.products, exact: true }).getByRole("status"),
      ).toHaveText(locale.noMatch);
    });

    test("has its own title and canonical address, and is not in the sitemap", async ({
      page,
      request,
    }) => {
      await expect(page).toHaveTitle(`${locale.shop} | LockMX`);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://lockmx.com${locale.path}/shop`,
      );
      expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/shop");
    });
  });

  test(`${locale.path}/shop/no-such-section is not found`, async ({ request }) => {
    expect((await request.get(`${locale.path}/shop/no-such-section`)).status()).toBe(404);
  });
}

// The endpoint of the suggestions (spec 005, T17).
test.describe("/api/search", () => {
  test("answers with the suggestions for the text in the language asked", async ({ request }) => {
    const response = await request.get("/api/search?q=pneu&lang=pt");

    expect(response.status()).toBe(200);
    expect((await response.json()).suggestions[0]).toEqual({
      kind: "section",
      label: "Pneus",
      href: "/pt/shop/tyres",
    });
  });

  test("refuses a language the site does not have, and a text too short suggests nothing", async ({
    request,
  }) => {
    expect((await request.get("/api/search?q=pneu&lang=fr")).status()).toBe(400);
    expect(await (await request.get("/api/search?q=p&lang=pt")).json()).toEqual({ suggestions: [] });
  });
});
