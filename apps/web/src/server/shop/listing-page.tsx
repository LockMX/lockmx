import "server-only";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/site/product-grid";
import { Section } from "@/components/site/sections/section";
import { ShopFilters } from "@/components/site/shop-filters";
import { ShopSearch } from "@/components/site/shop-search";
import { htmlLang } from "@/lib/i18n/config";
import { AVAILABILITY_PARAM, parseAvailability } from "@/lib/shop/listing-filters";
import type { ShopSectionEntry } from "@/lib/shop/product";
import { SEARCH_PARAM, parseSearchQuery } from "@/lib/shop/search";
import { contactPath, localizedPath, shopPath, shopSectionPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { getShopProducts, getShopSections } from "@/server/shop/shop-listing";
import { buildPageMetadata } from "@/server/site/page-metadata";

// One listing for the whole shop and for each of its sections (spec 005, T13):
// the routes differ only in the section they pass.

// Source: 01-app/03-api-reference/03-file-conventions/page.md (bundled Next.js
// docs): `searchParams` is a promise, and reading it renders at request time.
export type ListingSearchParams = Promise<Record<string, string | string[] | undefined>>;

function listingPath(section?: ShopSectionEntry): string {
  return section ? shopSectionPath(section.key) : shopPath;
}

export async function shopListingMetadata(section?: ShopSectionEntry): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata, shop } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: listingPath(section),
    title: section ? section.title : shop.home.title,
    description: metadata.description,
  });
}

type ShopListingPageProps = {
  /** Left out for the whole shop. */
  section?: ShopSectionEntry;
  searchParams: ListingSearchParams;
};

export async function ShopListingPage({ section, searchParams }: ShopListingPageProps) {
  const locale = await getCurrentLocale();
  const { shop } = await getMessages(locale);
  // The address is untrusted input: only the values the filter knows are kept.
  const params = await searchParams;
  const availability = parseAvailability(params[AVAILABILITY_PARAM]);
  // A search is of the whole shop (T17): a section listing ignores it.
  const query = section ? undefined : (parseSearchQuery(params[SEARCH_PARAM]) ?? undefined);
  const sections = await getShopSections(locale);
  const products = await getShopProducts(locale, { section: section?.key, query, availability });

  return (
    <Section
      id="shop"
      level={1}
      eyebrow={section ? shop.listing.eyebrow : shop.home.eyebrow}
      title={section ? section.title : shop.home.title}
    >
      <div className="md:w-2/3 lg:w-1/2">
        <ShopSearch
          // A new search starts from what the address says.
          key={query}
          locale={locale}
          action={localizedPath(locale, shopPath)}
          defaultValue={query}
          labels={shop.search}
        />
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_3fr]">
        <ShopFilters
          action={localizedPath(locale, listingPath(section))}
          allHref={localizedPath(locale, shopPath)}
          sections={sections}
          current={section?.key}
          query={query}
          availability={availability}
          labels={{
            filters: shop.listing.filters,
            sections: shop.listing.sections,
            all: shop.listing.all,
            availability: shop.listing.availability,
            inStock: shop.product.inStock,
            outOfStock: shop.product.outOfStock,
            apply: shop.listing.apply,
            clear: shop.listing.clear,
          }}
        />
        <ProductGrid
          title={shop.listing.products}
          products={products}
          priceLocale={htmlLang[locale]}
          // Until the product pages exist, a card leads to the contact page.
          productHref={localizedPath(locale, contactPath)}
          labels={{
            empty: query ? shop.listing.noMatch : shop.listing.empty,
            example: shop.featured.example,
            ...shop.product,
          }}
        />
      </div>
    </Section>
  );
}
