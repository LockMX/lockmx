import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { findSectionTarget } from "@/lib/site/section-target";

const current = {
  href: "https://lockmx.com/pt",
  origin: "https://lockmx.com",
  pathname: "/pt",
} as Location;

describe("findSectionTarget", () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="system"></section>';
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("finds the section of a link to the open page", () => {
    const section = document.getElementById("system");

    expect(findSectionTarget("/pt#system", current)).toBe(section);
    expect(findSectionTarget("https://lockmx.com/pt#system", current)).toBe(section);
  });

  test("is null for another page, another site, no fragment or an unknown id", () => {
    expect(findSectionTarget("/en#system", current)).toBeNull();
    expect(findSectionTarget("https://example.com/pt#system", current)).toBeNull();
    expect(findSectionTarget("/pt", current)).toBeNull();
    expect(findSectionTarget("/pt#", current)).toBeNull();
    expect(findSectionTarget("/pt#nowhere", current)).toBeNull();
  });
});
