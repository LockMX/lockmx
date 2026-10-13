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

// The sections of the shop, in order. Keys of ours and part of the address
// (`/shop/tyres`); each maps to a Shopify collection once the store is
// connected (spec 005, amendment 2).
export const shopSections = ["racks", "tyres", "merchandise"] as const;

export type ShopSection = (typeof shopSections)[number];

export function isShopSection(value: string): value is ShopSection {
  return (shopSections as readonly string[]).includes(value);
}

export type ShopSectionEntry = {
  key: ShopSection;
  title: string;
  href: string;
};

// What the availability filter of a listing can ask for.
export const availabilities = ["in", "out"] as const;

export type Availability = (typeof availabilities)[number];
