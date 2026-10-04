import { describe, expect, test } from "vitest";
import { resolveLocale } from "@/lib/i18n/negotiate";

describe("resolveLocale", () => {
  test.each([
    ["pt-PT", "pt"],
    ["pt-BR", "pt"],
    ["pt", "pt"],
    ["en-GB", "en"],
    ["en", "en"],
    ["en-US,en;q=0.9,pt;q=0.8", "en"],
    ["en;q=0.9,pt;q=0.5", "en"],
    ["pt;q=0.5,en;q=0.9", "en"],
    ["fr,en;q=0.5", "en"],
    ["!!!,en", "en"],
  ])("%s gives %s", (header, expected) => {
    expect(resolveLocale(header)).toBe(expected);
  });

  test.each([
    ["an unsupported language", "fr"],
    ["a wildcard", "*"],
    ["a malformed header", "!!!;;;,,,"],
    ["an empty header", ""],
    ["a null header", null],
  ])("falls back to the default locale for %s", (_name, header) => {
    expect(resolveLocale(header)).toBe("pt");
  });
});
