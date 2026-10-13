import { describe, expect, test } from "vitest";
import { matchesAvailability, parseAvailability } from "@/lib/shop/listing-filters";

describe("parseAvailability", () => {
  test.each([
    [undefined, []],
    ["in", ["in"]],
    ["out", ["out"]],
    [["out", "in"], ["in", "out"]],
    [["in", "in"], ["in"]],
    ["sold", []],
    [["in", "<script>"], ["in"]],
    ["", []],
  ])("%j gives %j", (value, expected) => {
    expect(parseAvailability(value)).toEqual(expected);
  });
});

describe("matchesAvailability", () => {
  const inStock = { availableForSale: true };
  const soldOut = { availableForSale: false };

  test("no choice shows every product", () => {
    expect(matchesAvailability(inStock, [])).toBe(true);
    expect(matchesAvailability(soldOut, [])).toBe(true);
  });

  test("one choice shows only the products in that state", () => {
    expect(matchesAvailability(inStock, ["in"])).toBe(true);
    expect(matchesAvailability(soldOut, ["in"])).toBe(false);
    expect(matchesAvailability(inStock, ["out"])).toBe(false);
    expect(matchesAvailability(soldOut, ["out"])).toBe(true);
  });

  test("both choices show every product", () => {
    expect(matchesAvailability(inStock, ["in", "out"])).toBe(true);
    expect(matchesAvailability(soldOut, ["in", "out"])).toBe(true);
  });
});
