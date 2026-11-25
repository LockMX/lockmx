import type { Metadata } from "next";
import {
  ShopListingPage,
  shopListingMetadata,
  type ListingSearchParams,
} from "@/server/shop/listing-page";

export async function generateMetadata(): Promise<Metadata> {
  return shopListingMetadata();
}

// The whole shop: every product, with the filters beside them (spec 005, T6).
export default async function Shop({ searchParams }: { searchParams: ListingSearchParams }) {
  return <ShopListingPage searchParams={searchParams} />;
}
