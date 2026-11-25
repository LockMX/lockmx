import "server-only";

// The connection to the Shopify store (spec 005, T8). SHOPIFY_STORE_DOMAIN and
// SHOPIFY_PRIVATE_ACCESS_TOKEN are read here and nowhere else. Neither set
// means the store is not connected and the site shows its example data
// (decision 5); one without the other is a mistake and fails.

// Pinned in code, not in the environment: the queries are written and tested
// against it, so a new version is a reviewed change. Stable versions and their
// support: https://shopify.dev/docs/api/usage/versioning (read 2026-11-24:
// 2026-10 is the latest stable, accessible until 2027-10-16).
export const SHOPIFY_API_VERSION = "2026-10";

export type ShopifyConfig = {
  storeDomain: string;
  privateToken: string;
  apiVersion: string;
};

type ShopifyEnv = Readonly<Record<string, string | undefined>>;

const storeDomain = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

function fail(message: string): never {
  throw new Error(`Shopify: ${message}.`);
}

export function parseShopifyConfig(env: ShopifyEnv): ShopifyConfig | null {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  const token = env.SHOPIFY_PRIVATE_ACCESS_TOKEN?.trim() ?? "";

  if (domain === "" && token === "") return null;
  if (domain === "") fail("SHOPIFY_STORE_DOMAIN is not set, but SHOPIFY_PRIVATE_ACCESS_TOKEN is");
  if (token === "") fail("SHOPIFY_PRIVATE_ACCESS_TOKEN is not set, but SHOPIFY_STORE_DOMAIN is");
  if (!storeDomain.test(domain)) {
    fail("SHOPIFY_STORE_DOMAIN must be the store's <name>.myshopify.com domain, without https:// or a path");
  }
  if (/\s/.test(token)) fail("SHOPIFY_PRIVATE_ACCESS_TOKEN must not contain spaces");

  return { storeDomain: domain, privateToken: token, apiVersion: SHOPIFY_API_VERSION };
}

// Read when called, at request time, not at build time: a build without the
// variables (CI, the "coming soon" deployment) works and uses example data.
export function getShopifyConfig(): ShopifyConfig | null {
  return parseShopifyConfig(process.env);
}
