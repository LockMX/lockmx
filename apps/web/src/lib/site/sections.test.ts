import { describe, expect, test } from "vitest";
import { sectionHref, sectionIds } from "@/lib/site/sections";

describe("sectionHref", () => {
  test("is the home of the locale followed by the id of the section", () => {
    expect(sectionHref("pt", sectionIds.why)).toBe("/pt#why");
    expect(sectionHref("en", sectionIds.contact)).toBe("/en#contact");
  });
});
