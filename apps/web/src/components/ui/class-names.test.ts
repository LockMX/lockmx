import { describe, expect, test } from "vitest";
import { classNames } from "@/components/ui/class-names";

describe("classNames", () => {
  test("joins the given classes with a space", () => {
    expect(classNames("inline-flex", "h-9")).toBe("inline-flex h-9");
  });

  test("skips false, null, undefined and empty entries", () => {
    expect(classNames("inline-flex", false, null, undefined, "", "h-9")).toBe(
      "inline-flex h-9",
    );
  });

  test("returns an empty string when nothing is given", () => {
    expect(classNames()).toBe("");
  });
});
