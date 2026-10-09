// Source: 01-app/03-api-reference/03-file-conventions/01-metadata/robots.md
// (bundled Next.js docs). This file is cached at build time, so it cannot
// follow the coming soon switch: `proxy.ts` sends `X-Robots-Tag` for that.
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/server/site/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).href,
  };
}
