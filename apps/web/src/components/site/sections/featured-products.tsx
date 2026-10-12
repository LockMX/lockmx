import { Section } from "@/components/site/sections/section";
import {
  Badge,
  Carousel,
  ProductCard,
  type CarouselLabels,
  type PriceAmount,
  type ProductImage,
} from "@/components/ui";
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
  labels: {
    /** The name of the carousel, which is not the title of the section. */
    carousel: string;
    empty: string;
    /** The mark on a product that is working data, not an offer. */
    example: string;
    inStock: string;
    outOfStock: string;
    compareAt: string;
    current: string;
  };
  carouselLabels: CarouselLabels;
};

// The width of a card at each number of cards per view of the carousel.
const IMAGE_SIZES = "(min-width: 80rem) 25vw, (min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw";

function priceOf(
  product: ProductSummary,
  locale: string,
  labels: FeaturedProductsProps["labels"],
): PriceAmount {
  const price = {
    amountCents: product.price.amountCents,
    currency: product.price.currencyCode,
    locale,
  };
  if (!product.compareAtPrice) return price;

  return {
    ...price,
    compareAtCents: product.compareAtPrice.amountCents,
    compareAtLabel: labels.compareAt,
    currentLabel: labels.current,
  };
}

function imageOf(product: ProductSummary): ProductImage | undefined {
  if (!product.image) return undefined;
  return { src: product.image.url, alt: product.image.altText, sizes: IMAGE_SIZES };
}

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
          <div key={product.id} className="relative grid">
            <ProductCard
              title={product.title}
              href={productHref}
              category={product.productType}
              price={priceOf(product, priceLocale, labels)}
              image={imageOf(product)}
              stock={product.availableForSale ? "in" : "out"}
              stockLabel={product.availableForSale ? labels.inStock : labels.outOfStock}
            />
            {product.isExample && (
              // Over the card, and let through: the card is one link.
              <Badge
                tone="inverse"
                variant="solid"
                className="pointer-events-none absolute top-3 right-3"
              >
                {labels.example}
              </Badge>
            )}
          </div>
        ))}
      </Carousel>
    </Section>
  );
}
