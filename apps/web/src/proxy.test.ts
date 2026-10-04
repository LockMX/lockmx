// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { config, proxy } from "@/proxy";

function request(path: string, acceptLanguage?: string) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: acceptLanguage ? { "accept-language": acceptLanguage } : {},
  });
}

function redirectTarget(path: string, acceptLanguage?: string) {
  const response = proxy(request(path, acceptLanguage));
  const location = response.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

describe("proxy", () => {
  test.each([
    ["/", "en", "/en"],
    ["/", "pt-PT", "/pt"],
    ["/", undefined, "/pt"],
    ["/", "fr", "/pt"],
    ["/produtos", "en-GB", "/en/produtos"],
    ["/a/b", undefined, "/pt/a/b"],
    ["/a?x=1", undefined, "/pt/a?x=1"],
  ])("%s with %s redirects to %s", (path, acceptLanguage, expected) => {
    expect(redirectTarget(path, acceptLanguage)).toBe(expected);
  });

  test.each([
    ["/fr", undefined, "/pt"],
    ["/fr/a", undefined, "/pt/a"],
    ["/fr", "en", "/en"],
    ["/en-US/a", undefined, "/pt/a"],
  ])("unsupported locale %s with %s redirects to %s", (path, acceptLanguage, expected) => {
    expect(redirectTarget(path, acceptLanguage)).toBe(expected);
  });

  test.each(["/pt", "/en", "/pt/a/b", "/en/a"])(
    "%s already has a supported locale and is not redirected",
    (path) => {
      const response = proxy(request(path, "en"));
      expect(response.headers.get("location")).toBeNull();
      expect(response.status).toBe(200);
    },
  );

  test("a redirect varies on Accept-Language and is temporary", () => {
    const response = proxy(request("/", "en"));
    expect(response.status).toBe(307);
    expect(response.headers.get("vary")).toContain("Accept-Language");
  });
});

describe("proxy matcher", () => {
  // Next.js turns an escaped dot (\.) in a matcher into any character, which silently
  // excluded every path. The pattern must use a character class instead.
  const [source] = config.matcher;
  const matches = (path: string) => new RegExp(`^${source}$`).test(path);

  test.each(["/", "/fr", "/produtos", "/pt/a/b"])("%s is handled by the proxy", (path) => {
    expect(matches(path)).toBe(true);
  });

  test.each(["/favicon.ico", "/logo/a.svg", "/api/x", "/_next/static/a.js"])(
    "%s is skipped by the proxy",
    (path) => {
      expect(matches(path)).toBe(false);
    },
  );
});
