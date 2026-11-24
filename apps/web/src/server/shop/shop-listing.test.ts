import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import { exampleSections } from "@/server/shop/example-catalogue";
import { getShopProducts, getShopSections } from "@/server/shop/shop-listing";

// Without the Shopify variables (as in CI): the example shop.
describe("getShopSections", () => {
  test("pt: one entry per section, in order, each with its listing", async () => {
    expect(await getShopSections("pt")).toEqual([
      { key: "racks", title: "Suportes LockMX", href: "/pt/shop/racks" },
      { key: "tyres", title: "Pneus", href: "/pt/shop/tyres" },
      { key: "merchandise", title: "Merchandise", href: "/pt/shop/merchandise" },
    ]);
  });

  test("en: same paths under its locale", async () => {
    expect((await getShopSections("en")).map((section) => section.href)).toEqual([
      "/en/shop/racks",
      "/en/shop/tyres",
      "/en/shop/merchandise",
    ]);
  });
});

describe("getShopProducts", () => {
  test.each(locales)("%s: every product is flagged as an example", async (locale) => {
    const products = await getShopProducts(locale, { availability: [] });

    expect(products.length).toBeGreaterThan(0);
    for (const product of products) expect(product.isExample, product.handle).toBe(true);
  });

  test("every section has products, and together they are the whole shop", async () => {
    const all = await getShopProducts("pt", { availability: [] });
    const bySection = await Promise.all(
      exampleSections.map((section) => getShopProducts("pt", { section, availability: [] })),
    );

    for (const products of bySection) expect(products.length).toBeGreaterThan(0);
    expect(bySection.flat().map((product) => product.id).sort()).toEqual(
      all.map((product) => product.id).sort(),
    );
  });

  test("a section shows only its products", async () => {
    const tyres = await getShopProducts("pt", { section: "tyres", availability: [] });

    expect(tyres.map((product) => product.productType)).toEqual(["Pneus", "Pneus"]);
  });

  test("the availability filter narrows the section", async () => {
    const racks = await getShopProducts("pt", { section: "racks", availability: [] });
    const inStock = await getShopProducts("pt", { section: "racks", availability: ["in"] });
    const soldOut = await getShopProducts("pt", { section: "racks", availability: ["out"] });

    expect(inStock.every((product) => product.availableForSale)).toBe(true);
    expect(soldOut.length).toBeGreaterThan(0);
    expect(soldOut.every((product) => !product.availableForSale)).toBe(true);
    expect(inStock.length + soldOut.length).toBe(racks.length);
  });

  test("ids and handles are unique across the shop", async () => {
    const products = await getShopProducts("pt", { availability: [] });

    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(new Set(products.map((product) => product.handle)).size).toBe(products.length);
  });
});
