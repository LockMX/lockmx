import { describe, expect, test } from "vitest";
import { parseSiteUrl } from "@/server/site/site-url";

describe("parseSiteUrl", () => {
  test("accepts an https origin in production", () => {
    expect(parseSiteUrl("https://lockmx.com", "production").href).toBe("https://lockmx.com/");
  });

  test("accepts a trailing slash", () => {
    expect(parseSiteUrl("https://lockmx.com/", "production").href).toBe("https://lockmx.com/");
  });

  test.each([undefined, "", "   "])("fails in production when the value is %j", (value) => {
    expect(() => parseSiteUrl(value, "production")).toThrow(/SITE_URL/);
  });

  test.each(["lockmx.com", "/pt", "not a url"])(
    "fails in production when %j is not an absolute address",
    (value) => {
      expect(() => parseSiteUrl(value, "production")).toThrow(/SITE_URL/);
    },
  );

  test("fails in production when the address is not https", () => {
    expect(() => parseSiteUrl("http://lockmx.com", "production")).toThrow(/SITE_URL.*https/);
  });

  test.each(["https://lockmx.com/shop", "https://lockmx.com/?a=1", "https://lockmx.com/#top"])(
    "fails when %j is more than an origin",
    (value) => {
      expect(() => parseSiteUrl(value, "production")).toThrow(/SITE_URL/);
    },
  );

  test("falls back to the local address in development when unset", () => {
    expect(parseSiteUrl(undefined, "development").href).toBe("http://localhost:3000/");
  });

  test("accepts http in development", () => {
    expect(parseSiteUrl("http://localhost:4000", "development").href).toBe(
      "http://localhost:4000/",
    );
  });

  test("still rejects a malformed value in development", () => {
    expect(() => parseSiteUrl("lockmx.com", "development")).toThrow(/SITE_URL/);
  });
});
