import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Icon, iconNames } from "@/components/ui/core/icon";

function renderedSvg(element: React.ReactElement): SVGElement {
  const svg = render(element).container.querySelector("svg");
  if (!svg) throw new Error("No svg was rendered");
  return svg;
}

describe("Icon", () => {
  test("offers exactly the icons the design system uses", () => {
    expect([...iconNames].sort()).toEqual([
      "arrow-left",
      "arrow-right",
      "bell",
      "check",
      "chevron-down",
      "circle-alert",
      "circle-check",
      "image",
      "info",
      "key-round",
      "loader-circle",
      "lock",
      "mail",
      "minus",
      "package",
      "pencil",
      "plus",
      "receipt",
      "search",
      "shopping-cart",
      "trash-2",
      "truck",
      "user",
      "x",
    ]);
  });

  test.each(iconNames)("renders %s as a decorative svg", (name) => {
    const svg = renderedSvg(<Icon name={name} />);

    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("class")).toContain(`lucide-${name}`);
  });

  test.each([
    ["sm", "size-4"],
    ["md", "size-5"],
    ["lg", "size-6"],
  ] as const)("size %s uses %s", (size, sizeClass) => {
    const svg = renderedSvg(<Icon name="check" size={size} />);

    expect(svg.getAttribute("class")?.split(" ")).toContain(sizeClass);
  });

  test("defaults to the medium size and does not shrink in a flex row", () => {
    const classes = renderedSvg(<Icon name="check" />)
      .getAttribute("class")
      ?.split(" ");

    expect(classes).toContain("size-5");
    expect(classes).toContain("shrink-0");
  });

  test("adds a layout class from the caller", () => {
    const svg = renderedSvg(<Icon name="loader-circle" className="animate-spin" />);

    expect(svg.getAttribute("class")?.split(" ")).toContain("animate-spin");
  });

  // Checked by `pnpm typecheck`: the element is built, never rendered.
  test("rejects a name outside the set", () => {
    // @ts-expect-error not one of the design system icons.
    const unknown = <Icon name="rocket" />;

    expect(unknown).toBeTruthy();
  });
});
