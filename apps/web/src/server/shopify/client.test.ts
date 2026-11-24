import { afterEach, describe, expect, test, vi } from "vitest";
import { REVALIDATE_SECONDS, storefrontQuery, type FetchFunction } from "@/server/shopify/client";
import type { ShopifyConfig } from "@/server/shopify/config";

const config: ShopifyConfig = {
  storeDomain: "lockmx.myshopify.com",
  privateToken: "shpat_secret_value_123",
  apiVersion: "2026-10",
};

const document = "query Shop { shop { name } }";

function respond(body: unknown, init: ResponseInit = {}): FetchFunction {
  return vi.fn(async () =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status: 200,
      ...init,
      headers: { "X-Shopify-API-Version": "2026-10", ...init.headers },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storefrontQuery", () => {
  test("posts the document and its variables to the versioned endpoint with the private token", async () => {
    const fetchDouble = respond({ data: { shop: { name: "LockMX" } } });

    await storefrontQuery(config, { query: document, variables: { handle: "racks" } }, fetchDouble);

    expect(fetchDouble).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetchDouble).mock.calls[0]!;
    expect(url).toBe("https://lockmx.myshopify.com/api/2026-10/graphql.json");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Shopify-Storefront-Private-Token")).toBe(config.privateToken);
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual({ query: document, variables: { handle: "racks" } });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  test("asks Next.js to cache the answer for a while, since every read is for a page", async () => {
    const fetchDouble = respond({ data: { shop: null } });

    await storefrontQuery(config, { query: document }, fetchDouble);

    const [, init] = vi.mocked(fetchDouble).mock.calls[0]!;
    expect(init?.cache).toBe("force-cache");
    expect(init?.next).toEqual({ revalidate: REVALIDATE_SECONDS });
    expect(REVALIDATE_SECONDS).toBeGreaterThan(0);
  });

  test("returns the data of a successful answer", async () => {
    const result = await storefrontQuery<{ shop: { name: string } }>(
      config,
      { query: document },
      respond({ data: { shop: { name: "LockMX" } } }),
    );

    expect(result).toEqual({ ok: true, data: { shop: { name: "LockMX" } } });
  });

  test("returns a network error when the request fails", async () => {
    const failing: FetchFunction = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });

    expect(await storefrontQuery(config, { query: document }, failing)).toEqual({
      ok: false,
      error: { kind: "network" },
    });
  });

  test("returns an http error with the status of a failed answer", async () => {
    const result = await storefrontQuery(
      config,
      { query: document },
      respond("Unauthorized", { status: 401 }),
    );

    expect(result).toEqual({ ok: false, error: { kind: "http", status: 401 } });
  });

  test("returns the GraphQL errors of an answer, even with partial data", async () => {
    const result = await storefrontQuery(
      config,
      { query: document },
      respond({ data: { shop: null }, errors: [{ message: "Throttled" }, { message: "Field missing" }] }),
    );

    expect(result).toEqual({
      ok: false,
      error: { kind: "graphql", messages: ["Throttled", "Field missing"] },
    });
  });

  test.each(["not json", JSON.stringify({ nothing: true }), JSON.stringify({ data: null })])(
    "returns an invalid answer error for %j",
    async (body) => {
      expect(await storefrontQuery(config, { query: document }, respond(body))).toEqual({
        ok: false,
        error: { kind: "invalid-response" },
      });
    },
  );

  test("warns, with the versions only, when Shopify answers with another API version", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchDouble = respond(
      { data: { shop: { name: "LockMX" } } },
      { headers: { "X-Shopify-API-Version": "2027-01" } },
    );

    const result = await storefrontQuery(config, { query: document }, fetchDouble);

    expect(result.ok).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0])).toMatch(/2026-10.*2027-01/);
  });

  test("does not warn when the version matches", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await storefrontQuery(config, { query: document }, respond({ data: { shop: null } }));

    expect(warn).not.toHaveBeenCalled();
  });

  test("never puts the token in a result or a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const answers: FetchFunction[] = [
      respond("Forbidden", { status: 403 }),
      respond({ errors: [{ message: "Access denied" }] }),
      respond("<html>", { headers: { "X-Shopify-API-Version": "2025-01" } }),
      vi.fn(async () => {
        throw new Error(`request with ${config.privateToken} failed`);
      }),
    ];

    for (const answer of answers) {
      const result = await storefrontQuery(config, { query: document }, answer);
      expect(JSON.stringify(result)).not.toContain(config.privateToken);
    }
    expect(JSON.stringify(warn.mock.calls)).not.toContain(config.privateToken);
  });
});
