import { describe, expect, test } from "vitest";
import {
  MAX_SEARCH_LENGTH,
  matchesSearch,
  parseSearchQuery,
  shopSearchPath,
} from "@/lib/shop/search";

describe("parseSearchQuery", () => {
  test("keeps the text, trimmed and with single spaces", () => {
    expect(parseSearchQuery("  suporte   de\tbotas ")).toBe("suporte de botas");
  });

  test("keeps the case and the accents the visitor typed", () => {
    expect(parseSearchQuery("Capacete Ação")).toBe("Capacete Ação");
  });

  test.each([undefined, null, "", " ", "a", " b ", 3, {}, ["a"]])(
    "gives null for %j: too short or not text",
    (value) => {
      expect(parseSearchQuery(value)).toBeNull();
    },
  );

  test("takes the first value when the address repeats the parameter", () => {
    expect(parseSearchQuery(["pneu", "boné"])).toBe("pneu");
  });

  test("removes control characters", () => {
    expect(parseSearchQuery("pn\u0000eu\u001b")).toBe("pneu");
  });

  test("gives null for a text longer than the limit, counted in characters", () => {
    expect(parseSearchQuery("é".repeat(MAX_SEARCH_LENGTH))).toBe("é".repeat(MAX_SEARCH_LENGTH));
    expect(parseSearchQuery("é".repeat(MAX_SEARCH_LENGTH + 1))).toBeNull();
  });
});

describe("matchesSearch", () => {
  test("matches when every word of the search is in the text", () => {
    expect(matchesSearch("Suporte de exemplo para botas", "botas suporte")).toBe(true);
    expect(matchesSearch("Suporte de exemplo para botas", "botas pneu")).toBe(false);
  });

  test("matches part of a word, without regard to case or accents", () => {
    expect(matchesSearch("Boné de exemplo", "BONE")).toBe(true);
    expect(matchesSearch("Pneu traseiro", "tras")).toBe(true);
  });
});

describe("shopSearchPath", () => {
  test("is the listing of the whole shop with the text in the address", () => {
    expect(shopSearchPath("pneu & boné")).toBe("/shop?q=pneu+%26+bon%C3%A9");
  });
});
