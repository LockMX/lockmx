import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { FetchFunction } from "@/server/shopify/client";
import type { ShopifyConfig } from "@/server/shopify/config";
import {
  PAGE_SIZE,
  readAllProducts,
  readCollectionProducts,
  readSections,
  toProductSummary,
  type ShopifyProduct,
} from "@/server/shopify/catalogue";

const config: ShopifyConfig = {
  storeDomain: "lockmx.myshopify.com",
  privateToken: "shpat_secret_value_123",
  apiVersion: "2026-10",
};

const eur = (amount: string) => ({ amount, currencyCode: "EUR" });

// The shape the store answered with on 2026-11-24 (T15 notes).
function product(overrides: Partial<ShopifyProduct> = {}): ShopifyProduct {
  return {
    id: "gid://shopify/Product/11501821985110",
    handle: "cabide-modular-lockmx-3-ganchos",
    title: "Cabide Modular LockMX – 3 Ganchos",
    productType: "Suporte",
    availableForSale: true,
    featuredImage: {
      url: "https://cdn.shopify.com/s/files/1/1083/4670/4214/files/hanger.jpg?v=1795533837",
      altText: null,
      width: 2560,
      height: 1707,
    },
    priceRange: { minVariantPrice: eur("65.99"), maxVariantPrice: eur("65.99") },
    compareAtPriceRange: { minVariantPrice: eur("0.0"), maxVariantPrice: eur("0.0") },
    ...overrides,
  };
}

function answering(data: unknown): FetchFunction {
  return vi.fn(async () =>
    Response.json({ data }, { headers: { "X-Shopify-API-Version": "2026-10" } }),
  );
}

function sentBody(fetchDouble: FetchFunction) {
  const [, init] = vi.mocked(fetchDouble).mock.calls[0]!;
  return JSON.parse(String(init?.body)) as { query: string; variables: Record<string, unknown> };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toProductSummary", () => {
  test("maps a product as the store returns it", () => {
    expect(toProductSummary(product())).toEqual({
      id: "gid://shopify/Product/11501821985110",
      handle: "cabide-modular-lockmx-3-ganchos",
      title: "Cabide Modular LockMX – 3 Ganchos",
      productType: "Suporte",
      image: {
        url: "https://cdn.shopify.com/s/files/1/1083/4670/4214/files/hanger.jpg?v=1795533837",
        width: 2560,
        height: 1707,
      },
      price: { amountCents: 6599, currencyCode: "EUR" },
      priceVaries: false,
      availableForSale: true,
      isExample: false,
    });
  });

  test("keeps the alternative text of the image when there is one", () => {
    const summary = toProductSummary(
      product({ featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: "Cabide" } }),
    );
    expect(summary?.image).toEqual({ url: "https://cdn.shopify.com/a.jpg", altText: "Cabide" });
  });

  test("leaves the image out when the product has none", () => {
    expect(toProductSummary(product({ featuredImage: null }))).not.toHaveProperty("image");
  });

  test("says the price varies when the variants do not cost the same", () => {
    const summary = toProductSummary(
      product({ priceRange: { minVariantPrice: eur("65.99"), maxVariantPrice: eur("79.99") } }),
    );
    expect(summary?.priceVaries).toBe(true);
    expect(summary?.price.amountCents).toBe(6599);
  });

  test("keeps a compare-at price greater than the price", () => {
    const summary = toProductSummary(
      product({ compareAtPriceRange: { minVariantPrice: eur("79.99"), maxVariantPrice: eur("79.99") } }),
    );
    expect(summary?.compareAtPrice).toEqual({ amountCents: 7999, currencyCode: "EUR" });
  });

  test.each(["0.0", "65.99", "50.00"])("leaves out a compare-at price of %j", (amount) => {
    const summary = toProductSummary(
      product({ compareAtPriceRange: { minVariantPrice: eur(amount), maxVariantPrice: eur(amount) } }),
    );
    expect(summary).not.toHaveProperty("compareAtPrice");
  });

  // The lowest price and the lowest compare-at price may belong to different
  // variants, so a card would show a reduction that does not exist.
  test("leaves out the compare-at price when the price varies", () => {
    const summary = toProductSummary(
      product({
        priceRange: { minVariantPrice: eur("65.99"), maxVariantPrice: eur("79.99") },
        compareAtPriceRange: { minVariantPrice: eur("89.99"), maxVariantPrice: eur("89.99") },
      }),
    );
    expect(summary).not.toHaveProperty("compareAtPrice");
  });

  test("leaves the product out when its price cannot be read exactly", () => {
    expect(
      toProductSummary(
        product({ priceRange: { minVariantPrice: eur("65.999"), maxVariantPrice: eur("65.999") } }),
      ),
    ).toBeNull();
  });
});

describe("readSections", () => {
  const menu = {
    menu: {
      items: [
        {
          resource: {
            __typename: "Collection",
            handle: "suportes-modulares",
            title: "Modular Supports",
            image: { url: "https://cdn.shopify.com/c.jpg", altText: null, width: 2363, height: 2363 },
          },
        },
        { resource: { __typename: "Page" } },
        { resource: null },
        { resource: { __typename: "Collection", handle: "merchandise", title: "Merchandise", image: null } },
      ],
    },
  };

  test("asks for the shop menu in the language of the page", async () => {
    const fetchDouble = answering(menu);

    await readSections(config, "en", fetchDouble);

    const body = sentBody(fetchDouble);
    expect(body.query).toContain("@inContext(language: $language, country: $country)");
    expect(body.variables).toEqual({ handle: "shop", language: "EN", country: "PT" });
  });

  test("asks in European Portuguese for the Portuguese site", async () => {
    const fetchDouble = answering(menu);

    await readSections(config, "pt", fetchDouble);

    expect(sentBody(fetchDouble).variables.language).toBe("PT_PT");
  });

  test("gives the collections of the menu, in its order, and skips other items", async () => {
    expect(await readSections(config, "en", answering(menu))).toEqual([
      {
        handle: "suportes-modulares",
        title: "Modular Supports",
        image: { url: "https://cdn.shopify.com/c.jpg", width: 2363, height: 2363 },
      },
      { handle: "merchandise", title: "Merchandise" },
    ]);
  });

  test("gives no sections when the store has no shop menu", async () => {
    expect(await readSections(config, "pt", answering({ menu: null }))).toEqual([]);
  });

  test("gives null, and logs the kind of error only, when the store fails", async () => {
    const failing: FetchFunction = vi.fn(async () => new Response("down", { status: 503 }));

    expect(await readSections(config, "pt", failing)).toBeNull();
    expect(String(vi.mocked(console.error).mock.calls[0])).toMatch(/sections.*http/);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(config.privateToken);
  });
});

describe("readCollectionProducts", () => {
  test("asks for the collection by handle, up to one page", async () => {
    const fetchDouble = answering({ collection: { products: { nodes: [] } } });

    await readCollectionProducts(config, "pt", "featured", fetchDouble);

    expect(sentBody(fetchDouble).variables).toEqual({
      handle: "featured",
      first: PAGE_SIZE,
      language: "PT_PT",
      country: "PT",
    });
  });

  test("maps the products and leaves out the ones that cannot be read", async () => {
    const broken = product({
      id: "gid://shopify/Product/2",
      priceRange: { minVariantPrice: eur("1.001"), maxVariantPrice: eur("1.001") },
    });
    const result = await readCollectionProducts(
      config,
      "pt",
      "featured",
      answering({ collection: { products: { nodes: [product(), broken] } } }),
    );

    expect(result?.map((each) => each.id)).toEqual(["gid://shopify/Product/11501821985110"]);
  });

  test("gives no products for a collection the store does not have", async () => {
    expect(
      await readCollectionProducts(config, "pt", "featured", answering({ collection: null })),
    ).toEqual([]);
  });

  test("gives null when the store fails", async () => {
    const failing: FetchFunction = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await readCollectionProducts(config, "pt", "featured", failing)).toBeNull();
  });
});

describe("readAllProducts", () => {
  test("asks for every product of the channel, up to one page", async () => {
    const fetchDouble = answering({ products: { nodes: [product()] } });

    const result = await readAllProducts(config, "en", fetchDouble);

    expect(sentBody(fetchDouble).variables).toEqual({ first: PAGE_SIZE, language: "EN", country: "PT" });
    expect(result).toHaveLength(1);
  });

  test("gives null when the answer has GraphQL errors", async () => {
    expect(
      await readAllProducts(
        config,
        "en",
        vi.fn(async () => Response.json({ errors: [{ message: "Throttled" }] })),
      ),
    ).toBeNull();
  });
});
