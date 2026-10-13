// Source: 01-app/03-api-reference/03-file-conventions/dynamic-routes.md
// (bundled Next.js docs): `params` is a promise.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopSection } from "@/lib/shop/product";
import {
  ShopListingPage,
  shopListingMetadata,
  type ListingSearchParams,
} from "@/server/shop/listing-page";

type ShopSectionPageProps = {
  params: Promise<{ category: string }>;
  searchParams: ListingSearchParams;
};

export async function generateMetadata({ params }: ShopSectionPageProps): Promise<Metadata> {
  const { category } = await params;
  return isShopSection(category) ? shopListingMetadata(category) : {};
}

// One section of the shop: its products, with the filters beside them. A
// section the shop does not have is not found.
export default async function ShopSectionPage({ params, searchParams }: ShopSectionPageProps) {
  const { category } = await params;
  if (!isShopSection(category)) notFound();

  return <ShopListingPage section={category} searchParams={searchParams} />;
}
