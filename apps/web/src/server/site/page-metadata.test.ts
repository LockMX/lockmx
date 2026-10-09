import { describe, expect, test } from "vitest";
import { buildPageMetadata } from "@/server/site/page-metadata";

describe("buildPageMetadata", () => {
  test("home page in pt: canonical and alternates for every locale", () => {
    const metadata = buildPageMetadata({ locale: "pt", path: "/", description: "Descrição" });

    expect(metadata.alternates).toEqual({
      canonical: "/pt",
      languages: { "pt-PT": "/pt", en: "/en", "x-default": "/pt" },
    });
  });

  test("home page in en points the canonical at itself", () => {
    const metadata = buildPageMetadata({ locale: "en", path: "/", description: "Description" });

    expect(metadata.alternates?.canonical).toBe("/en");
    expect(metadata.alternates?.languages).toEqual({
      "pt-PT": "/pt",
      en: "/en",
      "x-default": "/pt",
    });
  });

  test("inner page keeps its path in every address", () => {
    const metadata = buildPageMetadata({
      locale: "en",
      path: "/company",
      title: "Company",
      description: "Description",
    });

    expect(metadata.alternates).toEqual({
      canonical: "/en/company",
      languages: { "pt-PT": "/pt/company", en: "/en/company", "x-default": "/pt/company" },
    });
  });

  test.each(["company", "/company/", "company/"])("normalizes the path %j", (path) => {
    const metadata = buildPageMetadata({ locale: "pt", path, description: "Descrição" });

    expect(metadata.alternates?.canonical).toBe("/pt/company");
  });

  test("passes the title and the description through", () => {
    const metadata = buildPageMetadata({
      locale: "pt",
      path: "/company",
      title: "Empresa",
      description: "Descrição",
    });

    expect(metadata.title).toBe("Empresa");
    expect(metadata.description).toBe("Descrição");
  });

  test("leaves the title out when the page has none, so the site default applies", () => {
    const metadata = buildPageMetadata({ locale: "pt", path: "/", description: "Descrição" });

    expect(metadata).not.toHaveProperty("title");
  });
});
