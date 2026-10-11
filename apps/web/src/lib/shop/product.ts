// What the shop sections render. The shapes follow what the Shopify Storefront
// API returns for a product (spec 005, "Product data rules"), so reading from
// Shopify is a mapping to these types and no component changes.

// An amount as Shopify gives it (`MoneyV2`), in whole minor units instead of a
// decimal string: 34900 with "EUR" is 349,00 €.
export type Money = {
  amountCents: number;
  currencyCode: string;
};

// Shopify's `Image`: only the address is always there.
export type ProductImage = {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

// A product as a card shows it.
export type ProductSummary = {
  /** Shopify's global id: an opaque string. */
  id: string;
  /** What the address of the product page is built from. */
  handle: string;
  title: string;
  /** Free text written by the merchant: shown, never used as a key. */
  productType: string;
  image?: ProductImage;
  /** The lowest price among the variants. */
  price: Money;
  /** True when the variants do not all cost the same. */
  priceVaries: boolean;
  /** Only when it is greater than the price. */
  compareAtPrice?: Money;
  availableForSale: boolean;
  /** Working data that stands in for the catalogue: never a real offer. */
  isExample: boolean;
};

// The product types the home page shows, in order. Keys of ours, not Shopify's.
export const productTypeKeys = ["modular-system", "tyres"] as const;

export type ProductTypeKey = (typeof productTypeKeys)[number];

export type ProductTypeEntry = {
  key: ProductTypeKey;
  title: string;
  /** Left out while the type has no page to lead to. */
  href?: string;
};
