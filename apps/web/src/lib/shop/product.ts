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

// A section of the shop is named by the handle of its Shopify collection,
// which is also part of its address (`/shop/suportes-modulares`). The store
// decides which sections exist and in what order (spec 005, amendment 3,
// decision 24); the example catalogue has its own.
export type ShopSection = string;

export type ShopSectionEntry = {
  key: ShopSection;
  title: string;
  href: string;
  /** The collection's image, shown by the large card of the home page. */
  image?: ProductImage;
};

// What the availability filter of a listing can ask for.
export const availabilities = ["in", "out"] as const;

export type Availability = (typeof availabilities)[number];
