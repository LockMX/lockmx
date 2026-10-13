import {
  ProductSummaryCard,
  type ProductSummaryCardLabels,
} from "@/components/site/product-summary-card";
import type { ProductSummary } from "@/lib/shop/product";

type ProductGridProps = {
  /** Names the grid; read by assistive technology only. */
  title: string;
  products: ProductSummary[];
  /** The locale amounts are written in, for example `pt-PT`. */
  priceLocale: string;
  /** Where every card leads, until each product has its own page. */
  productHref: string;
  labels: ProductSummaryCardLabels & { empty: string };
};

// The width of a card at each number of columns, beside the filters from `lg`.
const IMAGE_SIZES = "(min-width: 80rem) 25vw, (min-width: 40rem) 50vw, 100vw";

const HEADING_ID = "shop-products-heading";

/** The products of a shop listing (spec 005, T13). It shows what it is given. */
export function ProductGrid({ title, products, priceLocale, productHref, labels }: ProductGridProps) {
  return (
    <section aria-labelledby={HEADING_ID} className="flex flex-col gap-4">
      <h2 id={HEADING_ID} className="sr-only">
        {title}
      </h2>
      {/* Always in the page, so a result that becomes empty is announced. */}
      <p role="status" className="text-md leading-snug text-text-muted">
        {products.length === 0 ? labels.empty : null}
      </p>
      {products.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="grid">
              <ProductSummaryCard
                product={product}
                priceLocale={priceLocale}
                href={productHref}
                imageSizes={IMAGE_SIZES}
                labels={labels}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
