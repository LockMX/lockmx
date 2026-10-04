import { expect, test } from "vitest";
import { fixture } from "@/test/fixture";

test("resolves the @/ alias and runs in jsdom", () => {
  expect(fixture).toBe("ok");
  expect(document.createElement("div")).toBeInstanceOf(HTMLElement);
});
