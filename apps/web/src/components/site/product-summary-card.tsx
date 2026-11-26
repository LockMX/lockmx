import {
  ActivateOnTap,
  Badge,
  ProductCard,
  type PriceAmount,
  type ProductImage,
} from "@/components/ui";
import type { ProductSummary } from "@/lib/shop/product";

export type ProductSummaryCardLabels = {
  /** The mark on a product that is working data, not an offer. */
  example: string;
  inStock: string;
  outOfStock: string;
  compareAt: string;
  current: string;
};

type ProductSummaryCardProps = {
  product: ProductSummary;
  /** The locale amounts are written in, for example `pt-PT`. */
  priceLocale: string;
  href: string;
  /** The width of the card in its grid, for the image. */
  imageSizes: string;
  labels: ProductSummaryCardLabels;
};

function priceOf(
  product: ProductSummary,
  locale: string,
  labels: ProductSummaryCardLabels,
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

function imageOf(product: ProductSummary, sizes: string): ProductImage | undefined {
  if (!product.image) return undefined;
  return { src: product.image.url, alt: product.image.altText, sizes };
}

/**
 * A product of the shop as a card, in the carousel of the home page and in the
 * listings. An example product says so on the card.
 */
export function ProductSummaryCard({
  product,
  priceLocale,
  href,
  imageSizes,
  labels,
}: ProductSummaryCardProps) {
  return (
    // On a device without hover, the card plays its lock-in effect when tapped.
    <ActivateOnTap className="relative grid">
      <ProductCard
        title={product.title}
        href={href}
        category={product.productType}
        price={priceOf(product, priceLocale, labels)}
        image={imageOf(product, imageSizes)}
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
    </ActivateOnTap>
  );
}
