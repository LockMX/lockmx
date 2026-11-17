import { describe, expect, test } from "vitest";
import { legalPageHref, legalPagePaths, legalPages } from "@/lib/site/legal-pages";
import { publicPaths } from "@/lib/site/public-paths";

describe("legalPages", () => {
  test("lists the company page first, then the policy texts", () => {
    expect(legalPages).toEqual(["company", "privacy", "cookies", "terms"]);
  });

  test("gives each page its address in a locale", () => {
    expect(legalPageHref("pt", "company")).toBe("/pt/company");
    expect(legalPageHref("en", "privacy")).toBe("/en/privacy-policy");
    expect(legalPageHref("en", "terms")).toBe("/en/terms");
  });

  // A page joins the sitemap with its real content (spec 004, T7).
  test("puts the privacy policy in the sitemap", () => {
    expect(publicPaths).toContain(legalPagePaths.privacy);
  });

  test("keeps the placeholders out of the sitemap", () => {
    for (const page of ["company", "cookies", "terms"] as const) {
      expect(publicPaths).not.toContain(legalPagePaths[page]);
    }
  });
});
