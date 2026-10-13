import type { Locale } from "@/lib/i18n/config";
import type { ProductSummary } from "@/lib/shop/product";
import { exampleFeaturedProducts } from "@/server/shop/example-catalogue";

// What the carousel of the home page shows. The page asks here and does not
// know where the answer comes from: example data today, Shopify once the
// store is connected (spec 005, T6).

export async function getFeaturedProducts(locale: Locale): Promise<ProductSummary[]> {
  return exampleFeaturedProducts(locale);
}
