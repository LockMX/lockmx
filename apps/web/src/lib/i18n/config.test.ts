import { describe, expect, test } from "vitest";
import { defaultLocale, htmlLang, isLocale, locales } from "@/lib/i18n/config";

describe("i18n config", () => {
  test("supports exactly pt and en, with pt as default", () => {
    expect(locales).toEqual(["pt", "en"]);
    expect(defaultLocale).toBe("pt");
  });

  test("isLocale accepts supported locales only", () => {
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("pt-PT")).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  test("html lang is pt-PT for pt and en for en", () => {
    expect(htmlLang.pt).toBe("pt-PT");
    expect(htmlLang.en).toBe("en");
  });
});
