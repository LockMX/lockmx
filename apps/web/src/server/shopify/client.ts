import "server-only";
import type { ShopifyConfig } from "@/server/shopify/config";

// The only module that knows the Storefront API endpoint and its headers
// (spec 005, T15). Sources, read 2026-11-24:
// - endpoint and private token header:
//   https://shopify.dev/docs/api/usage/authentication
// - versioned endpoint and the X-Shopify-API-Version answer header:
//   https://shopify.dev/docs/api/usage/versioning
// The token never leaves this module: results and warnings carry no header,
// no request and no message of a thrown error.

export type FetchFunction = (input: string, init?: RequestInit) => Promise<Response>;

export type StorefrontRequest = {
  query: string;
  variables?: Record<string, unknown>;
};

export type StorefrontError =
  | { kind: "network" }
  | { kind: "http"; status: number }
  | { kind: "graphql"; messages: string[] }
  | { kind: "invalid-response" };

export type StorefrontResult<T> = { ok: true; data: T } | { ok: false; error: StorefrontError };

// A page waits for Shopify while it renders; a store that does not answer
// must not hold it for ever.
const TIMEOUT_MS = 10_000;

// Every read is for a page, and the pages refresh on a time basis (spec 005,
// T16; no webhooks yet). A POST is only cached when asked to, and only a 200
// answer is stored (bundled Next.js docs, 03-api-reference/04-functions/fetch.md,
// `options.cache` and `options.next.revalidate`).
export const REVALIDATE_SECONDS = 300;

type GraphqlAnswer<T> = {
  data?: T | null;
  errors?: { message?: unknown }[];
};

function endpoint(config: ShopifyConfig): string {
  return `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`;
}

function warnOnVersion(config: ShopifyConfig, response: Response): void {
  const served = response.headers.get("X-Shopify-API-Version");
  if (served && served !== config.apiVersion) {
    console.warn(
      `Shopify: asked for API version ${config.apiVersion}, answered with ${served}. Update SHOPIFY_API_VERSION.`,
    );
  }
}

export async function storefrontQuery<T>(
  config: ShopifyConfig,
  request: StorefrontRequest,
  fetchFn: FetchFunction = fetch,
): Promise<StorefrontResult<T>> {
  let response: Response;
  try {
    response = await fetchFn(endpoint(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": config.privateToken,
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  warnOnVersion(config, response);
  if (!response.ok) return { ok: false, error: { kind: "http", status: response.status } };

  let answer: GraphqlAnswer<T>;
  try {
    answer = (await response.json()) as GraphqlAnswer<T>;
  } catch {
    return { ok: false, error: { kind: "invalid-response" } };
  }

  if (Array.isArray(answer?.errors) && answer.errors.length > 0) {
    const messages = answer.errors.map((error) => String(error.message ?? "unknown error"));
    return { ok: false, error: { kind: "graphql", messages } };
  }
  if (answer?.data == null || typeof answer.data !== "object") {
    return { ok: false, error: { kind: "invalid-response" } };
  }
  return { ok: true, data: answer.data };
}
