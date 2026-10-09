import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/site/public-paths";
import { getSiteUrl } from "@/server/site/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getSiteUrl());
}
