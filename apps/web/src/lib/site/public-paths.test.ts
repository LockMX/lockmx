import { describe, expect, test } from "vitest";
import { buildSitemap, localizedPath, publicPaths } from "@/lib/site/public-paths";

describe("localizedPath", () => {
  test.each([
    ["pt", "/", "/pt"],
    ["en", "/", "/en"],
    ["pt", "/company", "/pt/company"],
    ["en", "company/", "/en/company"],
  ] as const)("%s and %s give %s", (locale, path, expected) => {
    expect(localizedPath(locale, path)).toBe(expected);
  });
});

describe("publicPaths", () => {
  test("has the home page and no placeholder", () => {
    expect(publicPaths).toContain("/");
    expect(publicPaths.some((path) => path.includes("coming-soon"))).toBe(false);
  });
});

describe("buildSitemap", () => {
  const sitemap = buildSitemap(new URL("https://lockmx.com"), ["/", "/company"]);

  test("lists every path once per locale, with absolute addresses", () => {
    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://lockmx.com/pt",
      "https://lockmx.com/en",
      "https://lockmx.com/pt/company",
      "https://lockmx.com/en/company",
    ]);
  });

  test("gives each entry the address of the page in every language", () => {
    for (const entry of sitemap.filter((each) => each.url.endsWith("/company"))) {
      expect(entry.alternates?.languages).toEqual({
        "pt-PT": "https://lockmx.com/pt/company",
        en: "https://lockmx.com/en/company",
        "x-default": "https://lockmx.com/pt/company",
      });
    }
  });

  test("uses the public paths by default", () => {
    expect(buildSitemap(new URL("https://lockmx.com")).map((entry) => entry.url)).toEqual(
      publicPaths.flatMap((path) => [
        `https://lockmx.com${localizedPath("pt", path)}`,
        `https://lockmx.com${localizedPath("en", path)}`,
      ]),
    );
  });
});
