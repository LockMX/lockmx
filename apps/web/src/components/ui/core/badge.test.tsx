import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Badge } from "@/components/ui/core/badge";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const tones = [
  "neutral",
  "accent",
  "success",
  "danger",
  "info",
  "warning",
  "inverse",
] as const;

describe("Badge", () => {
  test("renders its text", () => {
    render(<Badge tone="success">Em stock</Badge>);

    expect(screen.getByText("Em stock")).toBeTruthy();
  });

  test.each(tones)("soft %s renders with token classes only", (tone) => {
    render(<Badge tone={tone}>Estado</Badge>);

    const badge = screen.getByText("Estado");

    expect(badge.className).not.toMatch(RAW_VALUE);
    expect(badge.getAttribute("style")).toBeNull();
  });

  test.each(tones)("solid %s renders with token classes only", (tone) => {
    render(
      <Badge tone={tone} variant="solid">
        Estado
      </Badge>,
    );

    expect(screen.getByText("Estado").className).not.toMatch(RAW_VALUE);
  });

  test("soft and solid differ for every tone except inverse", () => {
    for (const tone of tones.filter((name) => name !== "inverse")) {
      const { unmount } = render(
        <>
          <Badge tone={tone}>soft</Badge>
          <Badge tone={tone} variant="solid">
            solid
          </Badge>
        </>,
      );

      expect(screen.getByText("soft").className).not.toBe(
        screen.getByText("solid").className,
      );
      unmount();
    }
  });

  test("warning text uses the text token on the tint and black on the fill", () => {
    render(
      <>
        <Badge tone="warning">soft</Badge>
        <Badge tone="warning" variant="solid">
          solid
        </Badge>
      </>,
    );

    expect(screen.getByText("soft").className.split(" ")).toContain(
      "text-status-warning-text",
    );
    expect(screen.getByText("solid").className.split(" ")).toContain("text-black");
  });

  test("is a pill by default and a slanted tag on request", () => {
    render(
      <>
        <Badge>pill</Badge>
        <Badge shape="slant">slant</Badge>
      </>,
    );

    expect(screen.getByText("pill").className.split(" ")).toContain("rounded-pill");
    expect(screen.getByText("slant").className.split(" ")).toContain("clip-slant-sm");
  });

  test("adds a decorative dot, keeping the text as the only content read", () => {
    const { container } = render(
      <Badge tone="success" dot>
        Em stock
      </Badge>,
    );

    const dot = container.querySelector("[aria-hidden='true']");

    expect(dot).not.toBeNull();
    expect(dot?.textContent).toBe("");
    expect(screen.getByText("Em stock").textContent).toBe("Em stock");
  });

  // Checked by `pnpm typecheck`: the element is built, never rendered.
  test("requires text, so state is never shown by colour alone", () => {
    // @ts-expect-error a badge without text would be colour only.
    const empty = <Badge tone="danger" />;

    expect(empty).toBeTruthy();
  });
});
