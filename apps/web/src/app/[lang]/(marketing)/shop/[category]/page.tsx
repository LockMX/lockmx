// Source: 01-app/03-api-reference/03-file-conventions/dynamic-routes.md
// (bundled Next.js docs): `params` is a promise.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import {
  ShopListingPage,
  shopListingMetadata,
  type ListingSearchParams,
} from "@/server/shop/listing-page";
import { findShopSection } from "@/server/shop/shop-listing";

type ShopSectionPageProps = {
  params: Promise<{ category: string }>;
  searchParams: ListingSearchParams;
};

export async function generateMetadata({ params }: ShopSectionPageProps): Promise<Metadata> {
  const { category } = await params;
  const section = await findShopSection(await getCurrentLocale(), category);
  return section ? shopListingMetadata(section) : {};
}

// One section of the shop: its products, with the filters beside them. The
// sections are the store's (spec 005, amendment 3, decision 24); a section
// the shop does not have is not found.
export default async function ShopSectionPage({ params, searchParams }: ShopSectionPageProps) {
  const { category } = await params;
  const section = await findShopSection(await getCurrentLocale(), category);
  if (!section) notFound();

  return <ShopListingPage section={section} searchParams={searchParams} />;
}
