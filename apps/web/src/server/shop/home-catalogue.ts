import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { ProductSummary } from "@/lib/shop/product";
import { exampleFeaturedProducts } from "@/server/shop/example-catalogue";
import { readCollectionProducts } from "@/server/shopify/catalogue";
import { getShopifyConfig } from "@/server/shopify/config";

// What the carousel of the home page shows. The page asks here and does not
// know where the answer comes from: the store's `featured` collection once it
// is connected, the example data until then (spec 005, decisions
// 3 and 5). A connected store that fails gives nothing, never examples.

// The one collection the site names: "Destaques".
export const FEATURED_COLLECTION = "featured";

export async function getFeaturedProducts(locale: Locale): Promise<ProductSummary[]> {
  const config = getShopifyConfig();
  if (!config) return exampleFeaturedProducts(locale);

  return (await readCollectionProducts(config, locale, FEATURED_COLLECTION)) ?? [];
}
