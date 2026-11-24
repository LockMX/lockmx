import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ProductSummary } from "@/lib/shop/product";
import { readAllProducts, readCollectionProducts, readSections } from "@/server/shopify/catalogue";
import { getShopifyConfig, type ShopifyConfig } from "@/server/shopify/config";
import { FEATURED_COLLECTION, getFeaturedProducts } from "@/server/shop/home-catalogue";
import { findShopSection, getShopProducts, getShopSections } from "@/server/shop/shop-listing";

// With the store connected, the shop reads it and never shows examples
// (spec 005, amendment 3, decision 25).

vi.mock("@/server/shopify/config", () => ({ getShopifyConfig: vi.fn() }));
vi.mock("@/server/shopify/catalogue", () => ({
  readSections: vi.fn(),
  readCollectionProducts: vi.fn(),
  readAllProducts: vi.fn(),
}));

const config: ShopifyConfig = {
  storeDomain: "lockmx.myshopify.com",
  privateToken: "shpat_secret_value_123",
  apiVersion: "2026-10",
};

function product(id: string, availableForSale = true): ProductSummary {
  return {
    id,
    handle: id,
    title: id,
    productType: "Suporte",
    price: { amountCents: 6599, currencyCode: "EUR" },
    priceVaries: false,
    availableForSale,
    isExample: false,
  };
}

beforeEach(() => {
  vi.mocked(getShopifyConfig).mockReturnValue(config);
  vi.mocked(readSections).mockReset();
  vi.mocked(readCollectionProducts).mockReset();
  vi.mocked(readAllProducts).mockReset();
});

describe("with the store connected", () => {
  test("the sections are the store's, with their addresses and images", async () => {
    vi.mocked(readSections).mockResolvedValue([
      { handle: "suportes-modulares", title: "Modular Supports", image: { url: "https://cdn.shopify.com/c.jpg" } },
      { handle: "merchandise", title: "Merchandise" },
    ]);

    expect(await getShopSections("en")).toEqual([
      {
        key: "suportes-modulares",
        title: "Modular Supports",
        href: "/en/shop/suportes-modulares",
        image: { url: "https://cdn.shopify.com/c.jpg" },
      },
      { key: "merchandise", title: "Merchandise", href: "/en/shop/merchandise" },
    ]);
    expect(readSections).toHaveBeenCalledWith(config, "en");
  });

  test("a section is found by its handle, an unknown one is not", async () => {
    vi.mocked(readSections).mockResolvedValue([{ handle: "suportes-modulares", title: "Suportes" }]);

    expect((await findShopSection("pt", "suportes-modulares"))?.title).toBe("Suportes");
    expect(await findShopSection("pt", "racks")).toBeUndefined();
  });

  test("the whole shop is every product of the channel, filtered by availability", async () => {
    vi.mocked(readAllProducts).mockResolvedValue([product("a"), product("b", false)]);

    const inStock = await getShopProducts("pt", { availability: ["in"] });

    expect(inStock.map((each) => each.id)).toEqual(["a"]);
    expect(readAllProducts).toHaveBeenCalledWith(config, "pt");
  });

  test("a section is the products of its collection", async () => {
    vi.mocked(readCollectionProducts).mockResolvedValue([product("a")]);

    const products = await getShopProducts("pt", { section: "suportes-modulares", availability: [] });

    expect(products.map((each) => each.id)).toEqual(["a"]);
    expect(readCollectionProducts).toHaveBeenCalledWith(config, "pt", "suportes-modulares");
  });

  test("the featured products are the featured collection", async () => {
    vi.mocked(readCollectionProducts).mockResolvedValue([product("a")]);

    expect((await getFeaturedProducts("en")).map((each) => each.id)).toEqual(["a"]);
    expect(readCollectionProducts).toHaveBeenCalledWith(config, "en", FEATURED_COLLECTION);
    expect(FEATURED_COLLECTION).toBe("featured");
  });

  test("a store that fails gives empty listings, never example data", async () => {
    vi.mocked(readSections).mockResolvedValue(null);
    vi.mocked(readAllProducts).mockResolvedValue(null);
    vi.mocked(readCollectionProducts).mockResolvedValue(null);

    expect(await getShopSections("pt")).toEqual([]);
    expect(await getShopProducts("pt", { availability: [] })).toEqual([]);
    expect(await getShopProducts("pt", { section: "x", availability: [] })).toEqual([]);
    expect(await getFeaturedProducts("pt")).toEqual([]);
  });
});
