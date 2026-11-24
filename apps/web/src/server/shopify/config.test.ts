import { describe, expect, test } from "vitest";
import { parseShopifyConfig, SHOPIFY_API_VERSION } from "@/server/shopify/config";

const token = "shpat_secret_value_123";

describe("parseShopifyConfig", () => {
  test("gives the store, the token and the pinned version when both variables are set", () => {
    expect(
      parseShopifyConfig({
        SHOPIFY_STORE_DOMAIN: "lockmx.myshopify.com",
        SHOPIFY_PRIVATE_ACCESS_TOKEN: token,
      }),
    ).toEqual({ storeDomain: "lockmx.myshopify.com", privateToken: token, apiVersion: "2026-10" });
  });

  test("pins a stable API version", () => {
    expect(SHOPIFY_API_VERSION).toMatch(/^\d{4}-(01|04|07|10)$/);
  });

  test("ignores surrounding spaces", () => {
    expect(
      parseShopifyConfig({
        SHOPIFY_STORE_DOMAIN: " lockmx.myshopify.com ",
        SHOPIFY_PRIVATE_ACCESS_TOKEN: ` ${token} `,
      }),
    ).toMatchObject({ storeDomain: "lockmx.myshopify.com", privateToken: token });
  });

  test.each([{}, { SHOPIFY_STORE_DOMAIN: "", SHOPIFY_PRIVATE_ACCESS_TOKEN: "  " }])(
    "says the store is not connected when neither variable is set (%j)",
    (env) => {
      expect(parseShopifyConfig(env)).toBeNull();
    },
  );

  test("fails, naming the variable, when only the domain is set", () => {
    expect(() => parseShopifyConfig({ SHOPIFY_STORE_DOMAIN: "lockmx.myshopify.com" })).toThrow(
      /SHOPIFY_PRIVATE_ACCESS_TOKEN is not set/,
    );
  });

  test("fails, naming the variable, when only the token is set", () => {
    expect(() => parseShopifyConfig({ SHOPIFY_PRIVATE_ACCESS_TOKEN: token })).toThrow(
      /SHOPIFY_STORE_DOMAIN is not set/,
    );
  });

  test.each([
    "https://lockmx.myshopify.com",
    "lockmx.myshopify.com/",
    "lockmx.com",
    "shop.lockmx.myshopify.com.evil.com",
    "-lockmx.myshopify.com",
  ])("fails when the domain %j is not a myshopify.com store domain", (domain) => {
    expect(() =>
      parseShopifyConfig({ SHOPIFY_STORE_DOMAIN: domain, SHOPIFY_PRIVATE_ACCESS_TOKEN: token }),
    ).toThrow(/SHOPIFY_STORE_DOMAIN must be/);
  });

  test("fails when the token has spaces inside, without showing it", () => {
    const broken = "shpat_secret value";
    let message = "";
    try {
      parseShopifyConfig({ SHOPIFY_STORE_DOMAIN: "lockmx.myshopify.com", SHOPIFY_PRIVATE_ACCESS_TOKEN: broken });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/SHOPIFY_PRIVATE_ACCESS_TOKEN/);
    expect(message).not.toContain("secret");
  });
});
