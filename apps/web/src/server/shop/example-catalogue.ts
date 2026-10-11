import type { Locale } from "@/lib/i18n/config";
import type { Money, ProductSummary } from "@/lib/shop/product";

// Example products, so the shop sections can be judged before the catalogue
// exists (spec 005, decision 2). Names and prices are invented working data,
// not the client's catalogue: every item is flagged and its card says so.
// Reading from Shopify replaces this module.

type Translated = Record<Locale, string>;

type ExampleProduct = Omit<ProductSummary, "title" | "productType" | "price" | "compareAtPrice" | "isExample"> & {
  title: Translated;
  productType: Translated;
  priceCents: number;
  compareAtCents?: number;
};

const MODULAR_SYSTEM: Translated = { pt: "Sistema modular", en: "Modular system" };
const TYRES: Translated = { pt: "Pneus", en: "Tyres" };

const EXAMPLES: readonly ExampleProduct[] = [
  {
    id: "example-1",
    handle: "example-helmet-support",
    title: { pt: "Suporte de exemplo para capacetes", en: "Example helmet support" },
    productType: MODULAR_SYSTEM,
    priceCents: 8900,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-2",
    handle: "example-rear-tyre",
    title: { pt: "Pneu traseiro de exemplo", en: "Example rear tyre" },
    productType: TYRES,
    priceCents: 8990,
    compareAtCents: 10990,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-3",
    handle: "example-boot-support",
    title: { pt: "Suporte de exemplo para botas", en: "Example boot support" },
    productType: MODULAR_SYSTEM,
    priceCents: 7900,
    priceVaries: false,
    availableForSale: true,
  },
  {
    id: "example-4",
    handle: "example-front-tyre",
    title: { pt: "Pneu dianteiro de exemplo", en: "Example front tyre" },
    productType: TYRES,
    priceCents: 7450,
    priceVaries: true,
    availableForSale: true,
  },
  {
    id: "example-5",
    handle: "example-modular-shelf",
    title: { pt: "Prateleira modular de exemplo", en: "Example modular shelf" },
    productType: MODULAR_SYSTEM,
    priceCents: 12900,
    priceVaries: false,
    availableForSale: false,
  },
  {
    id: "example-6",
    handle: "example-hanger",
    title: { pt: "Cabide de exemplo", en: "Example hanger" },
    productType: MODULAR_SYSTEM,
    priceCents: 4900,
    priceVaries: false,
    availableForSale: true,
  },
];

function euros(amountCents: number): Money {
  return { amountCents, currencyCode: "EUR" };
}

export function exampleFeaturedProducts(locale: Locale): ProductSummary[] {
  return EXAMPLES.map(({ title, productType, priceCents, compareAtCents, ...product }) => ({
    ...product,
    title: title[locale],
    productType: productType[locale],
    price: euros(priceCents),
    ...(compareAtCents !== undefined && { compareAtPrice: euros(compareAtCents) }),
    isExample: true,
  }));
}
