import { describe, expect, test } from "vitest";
import * as ui from "@/components/ui";

describe("components/ui entry point", () => {
  test("exports every design system component built so far", () => {
    expect(Object.keys(ui).sort()).toEqual([
      "Badge",
      "Button",
      "ButtonLink",
      "Checkbox",
      "Field",
      "Icon",
      "IconButton",
      "Input",
      "Logo",
      "QuantityStepper",
      "Radio",
      "Select",
      "Switch",
      "Textarea",
    ]);
  });
});
