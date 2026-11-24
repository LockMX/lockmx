import { beforeEach, describe, expect, test, vi } from "vitest";
import { readSections } from "@/server/shopify/catalogue";
import { getShopifyConfig, type ShopifyConfig } from "@/server/shopify/config";
import { readSuggestions } from "@/server/shopify/search";
import { getSearchSuggestions } from "@/server/shop/search-suggestions";

vi.mock("@/server/shopify/config", () => ({ getShopifyConfig: vi.fn() }));
vi.mock("@/server/shopify/catalogue", () => ({
  readSections: vi.fn(),
  readCollectionProducts: vi.fn(),
  readAllProducts: vi.fn(),
}));
vi.mock("@/server/shopify/search", () => ({ readSuggestions: vi.fn(), SUGGESTION_LIMIT: 6 }));

const config: ShopifyConfig = {
  storeDomain: "lockmx.myshopify.com",
  privateToken: "shpat_secret_value_123",
  apiVersion: "2026-10",
};

beforeEach(() => {
  vi.mocked(getShopifyConfig).mockReset();
  vi.mocked(readSections).mockReset();
  vi.mocked(readSuggestions).mockReset();
});

describe("with the example data", () => {
  beforeEach(() => {
    vi.mocked(getShopifyConfig).mockReturnValue(null);
  });

  test("suggests the sections, then the products, whose names contain the text", async () => {
    expect(await getSearchSuggestions("pt", "pneu")).toEqual([
      { kind: "section", label: "Pneus", href: "/pt/shop/tyres" },
      { kind: "product", label: "Pneu traseiro de exemplo", href: "/pt/shop?q=Pneu+traseiro+de+exemplo" },
      { kind: "product", label: "Pneu dianteiro de exemplo", href: "/pt/shop?q=Pneu+dianteiro+de+exemplo" },
    ]);
  });

  test("suggests in the language of the page", async () => {
    expect((await getSearchSuggestions("en", "tyre")).map((each) => each.label)).toEqual([
      "Tyres",
      "Example rear tyre",
      "Example front tyre",
    ]);
  });

  test("suggests six at most", async () => {
    expect(await getSearchSuggestions("pt", "de")).toHaveLength(6);
  });
});

describe("with the store connected", () => {
  beforeEach(() => {
    vi.mocked(getShopifyConfig).mockReturnValue(config);
    vi.mocked(readSections).mockResolvedValue([{ handle: "modular-supports", title: "Modular Supports" }]);
  });

  test("suggests the store's sections and products, in the language of the page", async () => {
    vi.mocked(readSuggestions).mockResolvedValue({
      collections: [{ handle: "modular-supports", title: "Modular Supports" }],
      products: [{ handle: "boot-rack", title: "Suporte Modular de Botas" }],
    });

    expect(await getSearchSuggestions("en", "  modular ")).toEqual([
      { kind: "section", label: "Modular Supports", href: "/en/shop/modular-supports" },
      { kind: "product", label: "Suporte Modular de Botas", href: "/en/shop?q=Suporte+Modular+de+Botas" },
    ]);
    expect(readSuggestions).toHaveBeenCalledWith(config, "en", "modular");
  });

  test("leaves out a collection that is not a section of the shop", async () => {
    vi.mocked(readSuggestions).mockResolvedValue({
      collections: [{ handle: "featured", title: "Destaques" }],
      products: [],
    });

    expect(await getSearchSuggestions("pt", "dest")).toEqual([]);
  });

  test("suggests nothing, and never examples, when the store fails", async () => {
    vi.mocked(readSuggestions).mockResolvedValue(null);

    expect(await getSearchSuggestions("pt", "pneu")).toEqual([]);
  });

  test("a product whose title is too long to be a search leads to the text typed", async () => {
    vi.mocked(readSuggestions).mockResolvedValue({
      collections: [],
      products: [{ handle: "long", title: "Suporte ".repeat(20).trim() }],
    });

    const [suggestion] = await getSearchSuggestions("pt", "suporte");

    expect(suggestion?.href).toBe("/pt/shop?q=suporte");
  });

  test.each([null, "", " ", "a", "x".repeat(101), 3])(
    "asks nothing of the store for %j",
    async (text) => {
      expect(await getSearchSuggestions("pt", text)).toEqual([]);
      expect(readSuggestions).not.toHaveBeenCalled();
      expect(readSections).not.toHaveBeenCalled();
    },
  );
});
