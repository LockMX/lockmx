import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import { productTypeKeys } from "@/lib/shop/product";
import { exampleFeaturedProducts } from "@/server/shop/example-catalogue";
import { getFeaturedProducts, getProductTypes } from "@/server/shop/home-catalogue";

describe("getFeaturedProducts", () => {
  test.each(locales)("%s: returns the example products, every one flagged", async (locale) => {
    const products = await getFeaturedProducts(locale);

    expect(products).toEqual(exampleFeaturedProducts(locale));
    expect(products.length).toBeGreaterThan(4);
    for (const product of products) {
      expect(product.isExample, product.handle).toBe(true);
    }
  });

  test.each(locales)("%s: every product has what a card needs", async (locale) => {
    for (const product of await getFeaturedProducts(locale)) {
      expect(product.id, product.handle).not.toBe("");
      expect(product.handle).toMatch(/^[a-z0-9-]+$/);
      expect(product.title.trim(), product.handle).not.toBe("");
      expect(product.productType.trim(), product.handle).not.toBe("");
      expect(Number.isInteger(product.price.amountCents), product.handle).toBe(true);
      expect(product.price.amountCents, product.handle).toBeGreaterThan(0);
      expect(product.price.currencyCode, product.handle).toBe("EUR");
    }
  });

  test.each(locales)("%s: a compare-at price is greater than the price", async (locale) => {
    const reduced = (await getFeaturedProducts(locale)).filter((product) => product.compareAtPrice);

    expect(reduced.length).toBeGreaterThan(0);
    for (const product of reduced) {
      expect(product.compareAtPrice?.currencyCode).toBe(product.price.currencyCode);
      expect(product.compareAtPrice?.amountCents).toBeGreaterThan(product.price.amountCents);
    }
  });

  test("the examples cover the states a card can show", async () => {
    const products = await getFeaturedProducts("pt");

    expect(products.some((product) => !product.availableForSale)).toBe(true);
    expect(products.some((product) => product.priceVaries)).toBe(true);
    expect(products.some((product) => product.image === undefined)).toBe(true);
  });

  test("ids and handles are the same in both locales, titles are translated", async () => {
    const pt = await getFeaturedProducts("pt");
    const en = await getFeaturedProducts("en");

    expect(en.map((product) => product.id)).toEqual(pt.map((product) => product.id));
    expect(en.map((product) => product.handle)).toEqual(pt.map((product) => product.handle));
    expect(en.map((product) => product.price)).toEqual(pt.map((product) => product.price));
    expect(en.map((product) => product.title)).not.toEqual(pt.map((product) => product.title));
  });

  test("ids and handles are unique", async () => {
    const products = await getFeaturedProducts("pt");

    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(new Set(products.map((product) => product.handle)).size).toBe(products.length);
  });
});

describe("getProductTypes", () => {
  test("one entry per product type, in order", async () => {
    const types = await getProductTypes("pt");

    expect(types.map((type) => type.key)).toEqual([...productTypeKeys]);
  });

  test("pt: the modular system leads to its section of the landing page and tyres nowhere yet", async () => {
    expect(await getProductTypes("pt")).toEqual([
      { key: "modular-system", title: "Sistema modular", href: "/pt#system" },
      { key: "tyres", title: "Pneus" },
    ]);
  });

  test("en: same paths under its locale, translated titles", async () => {
    expect(await getProductTypes("en")).toEqual([
      { key: "modular-system", title: "Modular system", href: "/en#system" },
      { key: "tyres", title: "Tyres" },
    ]);
  });
});
