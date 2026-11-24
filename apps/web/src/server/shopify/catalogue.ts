import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { ProductImage, ProductSummary } from "@/lib/shop/product";
import { storefrontQuery, type FetchFunction, type StorefrontRequest } from "@/server/shopify/client";
import type { ShopifyConfig } from "@/server/shopify/config";
import { parseMoney, type ShopifyMoney } from "@/server/shopify/money";

// What the shop reads from the store (spec 005, T16), mapped to the shapes the
// components take. Every read is in the language of the page; a failed read
// gives null, so the caller shows an empty state and never example data
// (amendment 3, decision 25). Sources, read 2026-11-24:
// - menu: https://shopify.dev/docs/api/storefront/latest/queries/menu
//   (the `shop` menu lists the sections, decision 24)
// - languages: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages
//   (`@inContext` goes on the operation; collection titles are translated,
//   menu item titles are not)

// The menu whose top-level collections are the sections of the shop.
export const SECTIONS_MENU = "shop";

// One page of products. Pagination waits for a catalogue that needs it
// (amendment 3, open point 3); 250 is the most a connection gives at once.
export const PAGE_SIZE = 250;

// The store sells in Portugal (its market); the language follows the page.
const COUNTRY = "PT";
const LANGUAGE: Record<Locale, string> = { pt: "PT_PT", en: "EN" };

type ShopifyImage = { url: string; altText?: string | null; width?: number | null; height?: number | null };

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
};

export type ShopifySection = {
  handle: string;
  title: string;
  image?: ProductImage;
};

const IMAGE = "url altText width height";

// The fields of a product card, shared with the search (T17).
export const PRODUCT_FIELDS = `
  id handle title productType availableForSale
  featuredImage { ${IMAGE} }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
`;

export const CONTEXT = "$language: LanguageCode, $country: CountryCode";
export const IN_CONTEXT = "@inContext(language: $language, country: $country)";

const SECTIONS_QUERY = `query ShopSections($handle: String!, ${CONTEXT}) ${IN_CONTEXT} {
  menu(handle: $handle) {
    items { resource { __typename ... on Collection { handle title image { ${IMAGE} } } } }
  }
}`;

const COLLECTION_PRODUCTS_QUERY = `query CollectionProducts($handle: String!, $first: Int!, ${CONTEXT}) ${IN_CONTEXT} {
  collection(handle: $handle) { products(first: $first) { nodes { ${PRODUCT_FIELDS} } } }
}`;

const ALL_PRODUCTS_QUERY = `query AllProducts($first: Int!, ${CONTEXT}) ${IN_CONTEXT} {
  products(first: $first) { nodes { ${PRODUCT_FIELDS} } }
}`;

type MenuItem = {
  resource: { __typename: string; handle?: string; title?: string; image?: ShopifyImage | null } | null;
};

function toImage(image: ShopifyImage | null | undefined): ProductImage | undefined {
  if (!image) return undefined;
  return {
    url: image.url,
    ...(image.altText && { altText: image.altText }),
    ...(image.width && { width: image.width }),
    ...(image.height && { height: image.height }),
  };
}

// Null when a price cannot be read exactly: the product is left out (product
// data rule 1). The compare-at price is kept only when it is greater than the
// price and every variant costs the same, since the lowest price and the
// lowest compare-at price may belong to different variants.
export function toProductSummary(product: ShopifyProduct): ProductSummary | null {
  const price = parseMoney(product.priceRange.minVariantPrice);
  const highest = parseMoney(product.priceRange.maxVariantPrice);
  if (!price || !highest) return null;

  const priceVaries = highest.amountCents !== price.amountCents;
  const compareAt = parseMoney(product.compareAtPriceRange.minVariantPrice);
  const reduced =
    !priceVaries &&
    compareAt !== null &&
    compareAt.currencyCode === price.currencyCode &&
    compareAt.amountCents > price.amountCents;
  const image = toImage(product.featuredImage);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    productType: product.productType,
    ...(image && { image }),
    price,
    priceVaries,
    ...(reduced && { compareAtPrice: compareAt }),
    availableForSale: product.availableForSale,
    isExample: false,
  };
}

export function toProductSummaries(products: ShopifyProduct[]): ProductSummary[] {
  return products.flatMap((product) => toProductSummary(product) ?? []);
}

// One read in the language of the page; null, logged with the kind of error
// only, when it fails.
export async function readInContext<T>(
  what: string,
  config: ShopifyConfig,
  locale: Locale,
  request: StorefrontRequest,
  fetchFn?: FetchFunction,
): Promise<T | null> {
  const result = await storefrontQuery<T>(
    config,
    { ...request, variables: { ...request.variables, language: LANGUAGE[locale], country: COUNTRY } },
    fetchFn,
  );
  if (result.ok) return result.data;
  console.error(`Shopify: reading the ${what} failed (${result.error.kind}).`);
  return null;
}

export async function readSections(
  config: ShopifyConfig,
  locale: Locale,
  fetchFn?: FetchFunction,
): Promise<ShopifySection[] | null> {
  const data = await readInContext<{ menu: { items: MenuItem[] } | null }>(
    "sections",
    config,
    locale,
    { query: SECTIONS_QUERY, variables: { handle: SECTIONS_MENU } },
    fetchFn,
  );
  if (!data) return null;

  return (data.menu?.items ?? []).flatMap(({ resource }) => {
    if (resource?.__typename !== "Collection" || !resource.handle || !resource.title) return [];
    const image = toImage(resource.image);
    return [{ handle: resource.handle, title: resource.title, ...(image && { image }) }];
  });
}

export async function readCollectionProducts(
  config: ShopifyConfig,
  locale: Locale,
  handle: string,
  fetchFn?: FetchFunction,
): Promise<ProductSummary[] | null> {
  const data = await readInContext<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
    `collection ${handle}`,
    config,
    locale,
    { query: COLLECTION_PRODUCTS_QUERY, variables: { handle, first: PAGE_SIZE } },
    fetchFn,
  );
  if (!data) return null;
  return toProductSummaries(data.collection?.products.nodes ?? []);
}

export async function readAllProducts(
  config: ShopifyConfig,
  locale: Locale,
  fetchFn?: FetchFunction,
): Promise<ProductSummary[] | null> {
  const data = await readInContext<{ products: { nodes: ShopifyProduct[] } }>(
    "products",
    config,
    locale,
    { query: ALL_PRODUCTS_QUERY, variables: { first: PAGE_SIZE } },
    fetchFn,
  );
  if (!data) return null;
  return toProductSummaries(data.products.nodes);
}
