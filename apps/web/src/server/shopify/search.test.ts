import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { FetchFunction } from "@/server/shopify/client";
import type { ShopifyConfig } from "@/server/shopify/config";
import { PAGE_SIZE, type ShopifyProduct } from "@/server/shopify/catalogue";
import { SUGGESTION_LIMIT, readSearchProducts, readSuggestions } from "@/server/shopify/search";

const config: ShopifyConfig = {
  storeDomain: "lockmx.myshopify.com",
  privateToken: "shpat_secret_value_123",
  apiVersion: "2026-10",
};

const eur = (amount: string) => ({ amount, currencyCode: "EUR" });

const product: ShopifyProduct = {
  id: "gid://shopify/Product/1",
  handle: "cabide-modular-lockmx-3-ganchos",
  title: "Cabide Modular LockMX – 3 Ganchos",
  productType: "Suporte",
  availableForSale: true,
  featuredImage: null,
  priceRange: { minVariantPrice: eur("65.99"), maxVariantPrice: eur("65.99") },
  compareAtPriceRange: { minVariantPrice: eur("0.0"), maxVariantPrice: eur("0.0") },
};

function answering(data: unknown): FetchFunction {
  return vi.fn(async () => Response.json({ data }, { headers: { "X-Shopify-API-Version": "2026-10" } }));
}

function sentBody(fetchDouble: FetchFunction) {
  const [, init] = vi.mocked(fetchDouble).mock.calls[0]!;
  return JSON.parse(String(init?.body)) as { query: string; variables: Record<string, unknown> };
}

const failing: FetchFunction = vi.fn(async () => new Response("down", { status: 503 }));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readSuggestions", () => {
  const answer = {
    predictiveSearch: {
      collections: [{ handle: "modular-supports", title: "Modular Supports" }],
      products: [{ handle: "cabide-modular-lockmx-3-ganchos", title: "Cabide Modular LockMX – 3 Ganchos" }],
    },
  };

  test("asks for collections and products in the language of the page, in lower case", async () => {
    const fetchDouble = answering(answer);

    await readSuggestions(config, "en", "Modular", fetchDouble);

    const body = sentBody(fetchDouble);
    expect(body.query).toContain("predictiveSearch");
    expect(body.query).toContain("types: [COLLECTION, PRODUCT]");
    expect(body.variables).toEqual({
      query: "modular",
      limit: SUGGESTION_LIMIT,
      language: "EN",
      country: "PT",
    });
  });

  test("gives the collections and products of the answer", async () => {
    expect(await readSuggestions(config, "en", "modular", answering(answer))).toEqual(
      answer.predictiveSearch,
    );
  });

  test("gives no suggestions when the answer has none", async () => {
    expect(await readSuggestions(config, "pt", "xyz", answering({ predictiveSearch: null }))).toEqual({
      collections: [],
      products: [],
    });
  });

  test("gives null when the store fails", async () => {
    expect(await readSuggestions(config, "pt", "pneu", failing)).toBeNull();
    expect(String(vi.mocked(console.error).mock.calls[0])).toMatch(/suggestions.*http/);
  });
});

describe("readSearchProducts", () => {
  test("asks for one page of products in the language of the page, in lower case", async () => {
    const fetchDouble = answering({ search: { nodes: [] } });

    await readSearchProducts(config, "pt", "Cabide", fetchDouble);

    const body = sentBody(fetchDouble);
    expect(body.query).toContain("types: [PRODUCT]");
    expect(body.variables).toEqual({ query: "cabide", first: PAGE_SIZE, language: "PT_PT", country: "PT" });
  });

  test("maps the products and leaves out nodes that are not products", async () => {
    const result = await readSearchProducts(
      config,
      "pt",
      "cabide",
      answering({ search: { nodes: [product, {}] } }),
    );

    expect(result?.map((each) => each.handle)).toEqual(["cabide-modular-lockmx-3-ganchos"]);
  });

  test("gives null when the store fails", async () => {
    expect(await readSearchProducts(config, "pt", "cabide", failing)).toBeNull();
  });
});
