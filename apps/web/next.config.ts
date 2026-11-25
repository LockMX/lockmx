import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Product and collection images of the Shopify store (spec 005, T9). Not
    // pinned to this store's folder: where the images of products imported
    // from a supplier through Collective are kept is not verified (T11). The
    // `search` is left open because Shopify's addresses carry a `?v=` version.
    // Source: 03-api-reference/02-components/image.md, `remotePatterns`.
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" }],
  },
};

export default nextConfig;
