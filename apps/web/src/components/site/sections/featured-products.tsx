import {
  ProductSummaryCard,
  type ProductSummaryCardLabels,
} from "@/components/site/product-summary-card";
import { Section } from "@/components/site/sections/section";
import { Carousel, type CarouselLabels } from "@/components/ui";
import type { ProductSummary } from "@/lib/shop/product";

export type FeaturedProductsProps = {
  id: string;
  eyebrow: string;
  title: string;
  products: ProductSummary[];
  /** The locale amounts are written in, for example `pt-PT`. */
  priceLocale: string;
  /** Where every card leads, until each product has its own page. */
  productHref: string;
  labels: ProductSummaryCardLabels & {
    /** The name of the carousel, which is not the title of the section. */
    carousel: string;
    empty: string;
  };
  carouselLabels: CarouselLabels;
};

// The width of a card at each number of cards per view of the carousel.
const IMAGE_SIZES = "(min-width: 80rem) 25vw, (min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw";

/**
 * The featured products of the shop, in a carousel, right after the hero
 * (spec 005, T3). It shows what it is given: the page decides where the
 * products come from. Without products the section is not there.
 */
export function FeaturedProducts({
  id,
  eyebrow,
  title,
  products,
  priceLocale,
  productHref,
  labels,
  carouselLabels,
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <Section id={id} surface="subtle" eyebrow={eyebrow} title={title}>
      <Carousel label={labels.carousel} labels={carouselLabels} emptyMessage={labels.empty}>
        {products.map((product) => (
          <ProductSummaryCard
            key={product.id}
            product={product}
            priceLocale={priceLocale}
            href={productHref}
            imageSizes={IMAGE_SIZES}
            labels={labels}
          />
        ))}
      </Carousel>
    </Section>
  );
}
