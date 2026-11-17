import { describe, expect, test } from "vitest";
import { legalPageHref, legalPagePaths, legalPages } from "@/lib/site/legal-pages";
import { publicPaths } from "@/lib/site/public-paths";

describe("legalPages", () => {
  test("lists the company page first, then the policy texts", () => {
    expect(legalPages).toEqual(["company", "privacy", "cookies", "terms", "returns"]);
  });

  test("gives each page its address in a locale", () => {
    expect(legalPageHref("pt", "company")).toBe("/pt/company");
    expect(legalPageHref("en", "privacy")).toBe("/en/privacy-policy");
    expect(legalPageHref("en", "terms")).toBe("/en/terms");
    expect(legalPageHref("pt", "returns")).toBe("/pt/returns");
  });

  // A page joins the sitemap with its real content (spec 004, T7).
  test("puts the policies with their text in the sitemap", () => {
    for (const page of ["privacy", "terms", "returns"] as const) {
      expect(publicPaths).toContain(legalPagePaths[page]);
    }
  });

  test("keeps the placeholders out of the sitemap", () => {
    for (const page of ["company", "cookies"] as const) {
      expect(publicPaths).not.toContain(legalPagePaths[page]);
    }
  });
});
