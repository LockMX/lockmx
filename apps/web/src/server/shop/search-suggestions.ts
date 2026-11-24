import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { ShopSectionEntry } from "@/lib/shop/product";
import { matchesSearch, parseSearchQuery, shopSearchPath, type ShopSuggestion } from "@/lib/shop/search";
import { localizedPath } from "@/lib/site/public-paths";
import { exampleProducts } from "@/server/shop/example-catalogue";
import { getShopSections } from "@/server/shop/shop-listing";
import { readSuggestions, SUGGESTION_LIMIT } from "@/server/shopify/search";
import { getShopifyConfig } from "@/server/shopify/config";

// What the search bar of the shop suggests while the visitor types (spec 005,
// T17). The text is untrusted: a text that is not a search asks nothing of
// the store. Like the listings, the suggestions come from the store once it
// is connected and from the example data until then; a store that fails
// suggests nothing.
//
// A section leads to its listing. A product leads to the listing narrowed to
// its title, until the product pages exist; a title too long to be a search
// gives the text typed instead, so the listing is never left unnarrowed.

function sectionSuggestion(section: ShopSectionEntry): ShopSuggestion {
  return { kind: "section", label: section.title, href: section.href };
}

function productSuggestion(locale: Locale, title: string, query: string): ShopSuggestion {
  const search = parseSearchQuery(title) ?? query;
  return { kind: "product", label: title, href: localizedPath(locale, shopSearchPath(search)) };
}

export async function getSearchSuggestions(locale: Locale, text: unknown): Promise<ShopSuggestion[]> {
  const query = parseSearchQuery(text);
  if (!query) return [];

  const sections = await getShopSections(locale);
  const config = getShopifyConfig();
  let suggestions: ShopSuggestion[];

  if (!config) {
    suggestions = [
      ...sections.filter((section) => matchesSearch(section.title, query)).map(sectionSuggestion),
      ...exampleProducts(locale)
        .filter((product) => matchesSearch(product.title, query))
        .map((product) => productSuggestion(locale, product.title, query)),
    ];
  } else {
    const found = await readSuggestions(config, locale, query);
    if (!found) return [];
    // A collection outside the `shop` menu (`featured`) has no listing.
    const listed = found.collections.flatMap(({ handle }) => {
      const section = sections.find((each) => each.key === handle);
      return section ? [sectionSuggestion(section)] : [];
    });
    suggestions = [...listed, ...found.products.map(({ title }) => productSuggestion(locale, title, query))];
  }

  return suggestions.slice(0, SUGGESTION_LIMIT);
}
