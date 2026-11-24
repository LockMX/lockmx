import { describe, expect, test } from "vitest";
import { parseMoney } from "@/server/shopify/money";

describe("parseMoney", () => {
  test.each([
    ["65.99", 6599],
    ["124.99", 12499],
    ["0.0", 0],
    ["100.0", 10000],
    ["100", 10000],
    ["7.5", 750],
    ["19.900", 1990],
    ["0.10", 10],
  ])("turns %j EUR into %i cents without floating point", (amount, cents) => {
    expect(parseMoney({ amount, currencyCode: "EUR" })).toEqual({
      amountCents: cents,
      currencyCode: "EUR",
    });
  });

  test("follows the digits of the currency", () => {
    expect(parseMoney({ amount: "1500", currencyCode: "JPY" })).toEqual({
      amountCents: 1500,
      currencyCode: "JPY",
    });
  });

  test.each(["65.999", "1.001", "-5.00", "abc", "", "1e3", " 5.00"])(
    "rejects %j",
    (amount) => {
      expect(parseMoney({ amount, currencyCode: "EUR" })).toBeNull();
    },
  );

  test("rejects a currency code it does not know", () => {
    expect(parseMoney({ amount: "5.00", currencyCode: "EURO" })).toBeNull();
  });

  test("rejects an amount too large to count exactly", () => {
    expect(parseMoney({ amount: "99999999999999999.00", currencyCode: "EUR" })).toBeNull();
  });
});
