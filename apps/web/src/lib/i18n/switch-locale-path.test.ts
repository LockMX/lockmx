import { describe, expect, test } from "vitest";
import { switchLocalePath } from "@/lib/i18n/switch-locale-path";

describe("switchLocalePath", () => {
  test.each([
    ["/pt", "en", "/en"],
    ["/en", "pt", "/pt"],
    ["/pt/a/b", "en", "/en/a/b"],
    ["/en/a", "pt", "/pt/a"],
    ["/pt/", "en", "/en"],
    ["/pt", "pt", "/pt"],
  ] as const)("%s to %s gives %s", (pathname, target, expected) => {
    expect(switchLocalePath(pathname, target)).toBe(expected);
  });
});
