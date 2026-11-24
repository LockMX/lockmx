import type { Locale } from "@/lib/i18n/config";
import type { Money, ProductSummary } from "@/lib/shop/product";

// Example products, so the shop sections can be judged before the catalogue
// exists (spec 005, decision 2). Names and prices are invented working data,
// not the client's catalogue: every item is flagged and its card says so.
// Shown only while the store is not connected (spec 005, amendment 3,
// decision 25).

type Translated = Record<Locale, string>;

// The sections of the example shop, in order; their titles are in the
// dictionaries (`shop.sections`).
export const exampleSections = ["racks", "tyres", "merchandise"] as const;

type ExampleSection = (typeof exampleSections)[number];

type ExampleProduct = Omit<ProductSummary, "title" | "productType" | "price" | "compareAtPrice" | "isExample"> & {
  title: Translated;
  productType: Translated;
  /** The section of the shop it is listed in. */
  section: ExampleSection;
  /** Shown in the carousel of the home page. */
  featured: boolean;
  priceCents: number;
  compareAtCents?: number;
};

const MODULAR_SYSTEM: Translated = { pt: "Sistema modular", en: "Modular system" };
const TYRES: Translated = { pt: "Pneus", en: "Tyres" };
const MERCHANDISE: Translated = { pt: "Merchandise", en: "Merchandise" };

const RACK = { productType: MODULAR_SYSTEM, section: "racks", featured: true } as const;
const TYRE = { productType: TYRES, section: "tyres", featured: true } as const;
const MERCH = { productType: MERCHANDISE, section: "merchandise", featured: false } as const;

const EXAMPLES: readonly ExampleProduct[] = [
  {
    id: "example-1",
    handle: "example-helmet-support",
    title: { pt: "Suporte de exemplo para capacetes", en: "Example helmet support" },
    ...RACK,
    priceCents: 8900,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-2",
    handle: "example-rear-tyre",
    title: { pt: "Pneu traseiro de exemplo", en: "Example rear tyre" },
    ...TYRE,
    priceCents: 8990,
    compareAtCents: 10990,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-3",
    handle: "example-boot-support",
    title: { pt: "Suporte de exemplo para botas", en: "Example boot support" },
    ...RACK,
    priceCents: 7900,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-4",
    handle: "example-front-tyre",
    title: { pt: "Pneu dianteiro de exemplo", en: "Example front tyre" },
    ...TYRE,
    priceCents: 7450,
    priceVaries: true,
    availableForSale: true,
  },
  {
    id: "example-5",
    handle: "example-modular-shelf",
    title: { pt: "Prateleira modular de exemplo", en: "Example modular shelf" },
    ...RACK,
    priceCents: 12900,
    priceVaries: false,
    availableForSale: false,
  },
  {
    id: "example-6",
    handle: "example-hanger",
    title: { pt: "Cabide de exemplo", en: "Example hanger" },
    ...RACK,
    priceCents: 4900,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-7",
    handle: "example-t-shirt",
    title: { pt: "T-shirt de exemplo", en: "Example T-shirt" },
    ...MERCH,
    priceCents: 2500,
    priceVaries: true,
    availableForSale: true,
  },
  {
    id: "example-8",
    handle: "example-cap",
    title: { pt: "Boné de exemplo", en: "Example cap" },
    ...MERCH,
    priceCents: 1990,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-9",
    handle: "example-stickers",
    title: { pt: "Autocolantes de exemplo", en: "Example stickers" },
    ...MERCH,
    priceCents: 500,
    priceVaries: false,
    availableForSale: false,
  },
];

function euros(amountCents: number): Money {
  return { amountCents, currencyCode: "EUR" };
}

function summaryOf(example: ExampleProduct, locale: Locale): ProductSummary {
  return {
    id: example.id,
    handle: example.handle,
    title: example.title[locale],
    productType: example.productType[locale],
    ...(example.image && { image: example.image }),
    price: euros(example.priceCents),
    priceVaries: example.priceVaries,
    ...(example.compareAtCents !== undefined && {
      compareAtPrice: euros(example.compareAtCents),
    }),
    availableForSale: example.availableForSale,
    isExample: true,
  };
}

export function exampleFeaturedProducts(locale: Locale): ProductSummary[] {
  return EXAMPLES.filter((example) => example.featured).map((example) =>
    summaryOf(example, locale),
  );
}

// Every example, or the ones of one section of the shop.
export function exampleProducts(locale: Locale, section?: string): ProductSummary[] {
  return EXAMPLES.filter((example) => section === undefined || example.section === section).map(
    (example) => summaryOf(example, locale),
  );
}
