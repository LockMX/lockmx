import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { ProductSummary } from "@/lib/shop/product";
import type { FetchFunction } from "@/server/shopify/client";
import {
  CONTEXT,
  IN_CONTEXT,
  PAGE_SIZE,
  PRODUCT_FIELDS,
  readInContext,
  toProductSummaries,
  type ShopifyProduct,
} from "@/server/shopify/catalogue";
import type { ShopifyConfig } from "@/server/shopify/config";

// The search of the store (spec 005, T17). Sources, read 2026-11-24:
// - https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
//   (`limit` from 1 to 10, per type of result)
// - https://shopify.dev/docs/api/storefront/latest/queries/search
//   (products match partial words; `unavailableProducts: LAST` is the default)
// Checked against the store on 2026-11-24: both answer in the language of
// `@inContext`, tolerate a typing error ("supotre") and ignore case.

// As many as the search bar shows.
export const SUGGESTION_LIMIT = 6;

export type StoreSuggestions = {
  collections: { handle: string; title: string }[];
  products: { handle: string; title: string }[];
};

const SUGGESTIONS_QUERY = `query SearchSuggestions($query: String!, $limit: Int!, ${CONTEXT}) ${IN_CONTEXT} {
  predictiveSearch(query: $query, limit: $limit, types: [COLLECTION, PRODUCT], unavailableProducts: LAST) {
    collections { handle title }
    products { handle title }
  }
}`;

const SEARCH_QUERY = `query SearchProducts($query: String!, $first: Int!, ${CONTEXT}) ${IN_CONTEXT} {
  search(query: $query, first: $first, types: [PRODUCT], unavailableProducts: LAST) {
    nodes { ... on Product { ${PRODUCT_FIELDS} } }
  }
}`;

// The store ignores case, so one spelling is sent: answers are cached by what
// is sent (client.ts), and "Pneu" and "pneu" share an entry.
function sent(query: string): string {
  return query.toLowerCase();
}

export async function readSuggestions(
  config: ShopifyConfig,
  locale: Locale,
  query: string,
  fetchFn?: FetchFunction,
): Promise<StoreSuggestions | null> {
  const data = await readInContext<{ predictiveSearch: StoreSuggestions | null }>(
    "suggestions",
    config,
    locale,
    { query: SUGGESTIONS_QUERY, variables: { query: sent(query), limit: SUGGESTION_LIMIT } },
    fetchFn,
  );
  if (!data) return null;
  return data.predictiveSearch ?? { collections: [], products: [] };
}

export async function readSearchProducts(
  config: ShopifyConfig,
  locale: Locale,
  query: string,
  fetchFn?: FetchFunction,
): Promise<ProductSummary[] | null> {
  const data = await readInContext<{ search: { nodes: Partial<ShopifyProduct>[] } }>(
    "search",
    config,
    locale,
    { query: SEARCH_QUERY, variables: { query: sent(query), first: PAGE_SIZE } },
    fetchFn,
  );
  if (!data) return null;
  // Only products are asked for; a node without their fields is left out.
  const products = data.search.nodes.filter((node): node is ShopifyProduct => Boolean(node.id));
  return toProductSummaries(products);
}
