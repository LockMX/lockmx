import type { Locale } from "@/lib/i18n/config";
import type { ProductSummary, ProductTypeEntry } from "@/lib/shop/product";
import { localizedPath, modularSystemPath } from "@/lib/site/public-paths";
import { getMessages } from "@/server/i18n/messages";
import { exampleFeaturedProducts } from "@/server/shop/example-catalogue";

// What the shop sections of the home page show. The page asks here and does
// not know where the answer comes from: example data today, Shopify once the
// store is connected (spec 005, T6).

export async function getFeaturedProducts(locale: Locale): Promise<ProductSummary[]> {
  return exampleFeaturedProducts(locale);
}

// Tyres has no address until the shop has category pages.
export async function getProductTypes(locale: Locale): Promise<ProductTypeEntry[]> {
  const { shop } = await getMessages(locale);

  return [
    {
      key: "modular-system",
      title: shop.productTypes.modularSystem,
      href: localizedPath(locale, modularSystemPath),
    },
    { key: "tyres", title: shop.productTypes.tyres },
  ];
}
