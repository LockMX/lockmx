import type { Locale } from "@/lib/i18n/config";
import { matchesAvailability } from "@/lib/shop/listing-filters";
import {
  shopSections,
  type Availability,
  type ProductSummary,
  type ShopSection,
  type ShopSectionEntry,
} from "@/lib/shop/product";
import { localizedPath, shopSectionPath } from "@/lib/site/public-paths";
import { getMessages } from "@/server/i18n/messages";
import { exampleProducts } from "@/server/shop/example-catalogue";

// What a listing of the shop shows. The page asks here and does not know
// where the answer comes from: example data today, Shopify collections once
// the store is connected (spec 005, T13).

export type ShopListingFilters = {
  /** Left out for the whole shop. */
  section?: ShopSection;
  availability: readonly Availability[];
};

export async function getShopSections(locale: Locale): Promise<ShopSectionEntry[]> {
  const { shop } = await getMessages(locale);

  return shopSections.map((key) => ({
    key,
    title: shop.sections[key],
    href: localizedPath(locale, shopSectionPath(key)),
  }));
}

export async function getShopProducts(
  locale: Locale,
  { section, availability }: ShopListingFilters,
): Promise<ProductSummary[]> {
  return exampleProducts(locale, section).filter((product) =>
    matchesAvailability(product, availability),
  );
}
