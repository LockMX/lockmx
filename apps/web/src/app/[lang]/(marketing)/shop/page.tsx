import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/site/sections/featured-products";
import { ProductTypes } from "@/components/site/sections/product-types";
import { Section } from "@/components/site/sections/section";
import { ShopSearch } from "@/components/site/shop-search";
import { htmlLang } from "@/lib/i18n/config";
import { shopPath } from "@/lib/site/public-paths";
import { sectionHref, sectionIds } from "@/lib/site/sections";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { getFeaturedProducts, getProductTypes } from "@/server/shop/home-catalogue";
import { buildPageMetadata } from "@/server/site/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata, shop } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: shopPath,
    title: shop.home.title,
    description: metadata.description,
  });
}

// The home of the shop: search, featured products and product types. It shows
// example data until the store is connected (spec 005).
export default async function ShopHome() {
  const locale = await getCurrentLocale();
  const { shop } = await getMessages(locale);
  const featuredProducts = await getFeaturedProducts(locale);
  const productTypes = await getProductTypes(locale);

  return (
    <>
      <Section id="shop" level={1} eyebrow={shop.home.eyebrow} title={shop.home.title}>
        <div className="md:w-2/3 lg:w-1/2">
          <ShopSearch labels={shop.search} />
        </div>
      </Section>
      <FeaturedProducts
        id={sectionIds.featured}
        eyebrow={shop.featured.eyebrow}
        title={shop.featured.title}
        products={featuredProducts}
        priceLocale={htmlLang[locale]}
        // Until the product pages exist, a card leads to contact.
        productHref={sectionHref(locale, sectionIds.contact)}
        labels={{
          carousel: shop.featured.carousel,
          empty: shop.featured.empty,
          example: shop.featured.example,
          ...shop.product,
        }}
        carouselLabels={shop.carousel}
      />
      <ProductTypes
        id={sectionIds.categories}
        eyebrow={shop.categories.eyebrow}
        title={shop.categories.title}
        soonLabel={shop.categories.soon}
        types={productTypes}
      />
    </>
  );
}
