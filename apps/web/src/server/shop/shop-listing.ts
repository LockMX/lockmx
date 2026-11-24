import "server-only";
import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { matchesAvailability } from "@/lib/shop/listing-filters";
import type {
  Availability,
  ProductSummary,
  ShopSection,
  ShopSectionEntry,
} from "@/lib/shop/product";
import { localizedPath, shopSectionPath } from "@/lib/site/public-paths";
import { getMessages } from "@/server/i18n/messages";
import { exampleProducts, exampleSections } from "@/server/shop/example-catalogue";
import { readAllProducts, readCollectionProducts, readSections } from "@/server/shopify/catalogue";
import { getShopifyConfig } from "@/server/shopify/config";

// What a listing of the shop shows. The pages ask here and do not know where
// the answer comes from: the store once it is connected, the example data
// until then (spec 005, amendment 3, decision 25). A connected store that
// fails gives nothing, never examples.

export type ShopListingFilters = {
  /** Left out for the whole shop. */
  section?: ShopSection;
  availability: readonly Availability[];
};

// Once per request: the layout, the metadata and the page all ask for the
// sections (bundled Next.js docs, 01-getting-started/06-fetching-data.md,
// `React.cache`).
export const getShopSections = cache(async (locale: Locale): Promise<ShopSectionEntry[]> => {
  const config = getShopifyConfig();
  const href = (key: string) => localizedPath(locale, shopSectionPath(key));

  if (!config) {
    const { shop } = await getMessages(locale);
    return exampleSections.map((key) => ({ key, title: shop.sections[key], href: href(key) }));
  }

  const sections = (await readSections(config, locale)) ?? [];
  return sections.map(({ handle, title, image }) => ({
    key: handle,
    title,
    href: href(handle),
    ...(image && { image }),
  }));
});

export async function findShopSection(
  locale: Locale,
  key: string,
): Promise<ShopSectionEntry | undefined> {
  return (await getShopSections(locale)).find((section) => section.key === key);
}

const getProducts = cache(async (locale: Locale, section?: ShopSection): Promise<ProductSummary[]> => {
  const config = getShopifyConfig();
  if (!config) return exampleProducts(locale, section);

  const products = section
    ? await readCollectionProducts(config, locale, section)
    : await readAllProducts(config, locale);
  return products ?? [];
});

// The availability filter is applied here, on one page of products (T16
// notes): the same for both sources.
export async function getShopProducts(
  locale: Locale,
  { section, availability }: ShopListingFilters,
): Promise<ProductSummary[]> {
  return (await getProducts(locale, section)).filter((product) =>
    matchesAvailability(product, availability),
  );
}
