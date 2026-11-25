import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/site/sections/featured-products";
import { Hero, type HeroImage } from "@/components/site/sections/hero";
import { ShopSections } from "@/components/site/sections/shop-sections";
import { htmlLang } from "@/lib/i18n/config";
import { contactPath, localizedPath, modularSystemPath, shopPath } from "@/lib/site/public-paths";
import { sectionIds } from "@/lib/site/sections";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { getFeaturedProducts } from "@/server/shop/home-catalogue";
import { getShopSections } from "@/server/shop/shop-listing";
import { buildPageMetadata } from "@/server/site/page-metadata";

// A mockup of the client's identity pack (M5), exported at this size.
const HERO_IMAGE: Omit<HeroImage, "alt"> = {
  src: "/brand/mockups/sign-black.jpg",
  width: 1600,
  height: 1600,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata } = await getMessages(locale);
  return buildPageMetadata({ locale, path: "/", description: metadata.description });
}

// The landing page is the home of the shop (spec 005, decision 1): the hero,
// the featured products and one large card per section of the shop, every
// section of the store's menu (owner, 2026-11-24). It shows example data until
// the store is connected.
export default async function Home() {
  const locale = await getCurrentLocale();
  const { home, shop } = await getMessages(locale);
  const featuredProducts = await getFeaturedProducts(locale);
  const shopSections = await getShopSections(locale);

  return (
    <>
      <Hero
        eyebrow={home.hero.eyebrow}
        titleLead={home.hero.titleLead}
        titleAccent={home.hero.titleAccent}
        text={home.hero.text}
        primaryAction={{ href: localizedPath(locale, shopPath), label: home.hero.primaryAction }}
        secondaryAction={{
          href: localizedPath(locale, modularSystemPath),
          label: home.hero.secondaryAction,
        }}
        image={{ ...HERO_IMAGE, alt: home.hero.imageAlt }}
      />
      <FeaturedProducts
        id={sectionIds.featured}
        eyebrow={shop.featured.eyebrow}
        title={shop.featured.title}
        products={featuredProducts}
        priceLocale={htmlLang[locale]}
        // Until the product pages exist, a card leads to the contact page.
        productHref={localizedPath(locale, contactPath)}
        labels={{
          carousel: shop.featured.carousel,
          empty: shop.featured.empty,
          example: shop.featured.example,
          ...shop.product,
        }}
        carouselLabels={shop.carousel}
      />
      <ShopSections
        id={sectionIds.shopSections}
        title={shop.home.title}
        sections={shopSections}
      />
    </>
  );
}
