import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import { globalErrorMessages, pickGlobalErrorMessages } from "@/lib/i18n/global-error-messages";

describe("global error messages", () => {
  test("every locale has every text, non-empty", () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(globalErrorMessages[locale])) {
        expect(value.trim(), `${locale}.${key}`).not.toBe("");
      }
    }
  });

  test.each([
    ["/en", "en"],
    ["/en/shop/item", "en"],
    ["/pt", "pt-PT"],
  ])("picks the locale of the address %s", (pathname, lang) => {
    expect(pickGlobalErrorMessages(pathname).lang).toBe(lang);
  });

  test.each([null, "", "/", "/fr/page"])("falls back to the default locale for %j", (pathname) => {
    const picked = pickGlobalErrorMessages(pathname);

    expect(picked.lang).toBe("pt-PT");
    expect(picked.homeHref).toBe("/pt");
  });

  test("links home in the locale of the address", () => {
    expect(pickGlobalErrorMessages("/en/x").homeHref).toBe("/en");
  });
});
