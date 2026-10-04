import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import { getMessages } from "@/server/i18n/messages";
import { en } from "@/server/i18n/messages/en";
import { pt } from "@/server/i18n/messages/pt";

// Flattens nested messages into "a.b.c" paths with their string values.
function flatten(value: object, prefix = ""): Array<[string, unknown]> {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === "object" && child !== null
      ? flatten(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, child] as [string, unknown]],
  );
}

describe("messages", () => {
  test("pt and en have exactly the same keys", () => {
    const keys = (messages: object) => flatten(messages).map(([key]) => key).sort();
    expect(keys(en)).toEqual(keys(pt));
  });

  test.each([
    ["pt", pt],
    ["en", en],
  ])("%s has only non-empty strings", (_locale, messages) => {
    for (const [key, value] of flatten(messages)) {
      expect(typeof value, key).toBe("string");
      expect((value as string).trim(), key).not.toBe("");
    }
  });

  test.each(locales)("getMessages loads the %s dictionary", async (locale) => {
    const expected = locale === "pt" ? pt : en;
    await expect(getMessages(locale)).resolves.toBe(expected);
  });
});
