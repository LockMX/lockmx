import { describe, expect, test } from "vitest";
import { legalPageHref, legalPages } from "@/lib/site/legal-pages";
import { publicPaths } from "@/lib/site/public-paths";

describe("legalPages", () => {
  test("lists the company page first, then the policy texts", () => {
    expect(legalPages).toEqual(["company", "privacy", "cookies", "terms"]);
  });

  test("gives each page its address in a locale", () => {
    expect(legalPageHref("pt", "company")).toBe("/pt/company");
    expect(legalPageHref("en", "terms")).toBe("/en/terms");
  });

  // They join the sitemap with their real content (spec 004, T7).
  test("is not in the sitemap while the pages are placeholders", () => {
    for (const page of legalPages) {
      expect(publicPaths).not.toContain(`/${page}`);
    }
  });
});
