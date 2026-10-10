import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Section } from "@/components/site/sections/section";

describe("Section", () => {
  test("is a region named by its heading, with the id a link leads to", () => {
    render(<Section id="system" eyebrow="O sistema" title="Um quartel-general" />);

    const region = screen.getByRole("region", { name: "Um quartel-general" });
    expect(region.id).toBe("system");
    expect(within(region).getByRole("heading", { level: 2 }).textContent).toBe(
      "Um quartel-general",
    );
    expect(within(region).getByText("O sistema")).toBeTruthy();
  });

  test("can take the focus without being a tab stop", () => {
    render(<Section id="system" eyebrow="O sistema" title="Um quartel-general" />);

    expect(screen.getByRole("region").getAttribute("tabindex")).toBe("-1");
  });

  test("renders its content after the heading", () => {
    render(
      <Section id="system" eyebrow="O sistema" title="Um quartel-general">
        <p>Texto</p>
      </Section>,
    );

    expect(within(screen.getByRole("region")).getByText("Texto")).toBeTruthy();
  });

  test("marks the inverse surface, so controls inside get the ring made for it", () => {
    const { rerender } = render(<Section id="buy" surface="inverse" eyebrow="a" title="b" />);
    expect(screen.getByRole("region").getAttribute("data-surface")).toBe("inverse");

    rerender(<Section id="buy" surface="accent" eyebrow="a" title="b" />);
    expect(screen.getByRole("region").getAttribute("data-surface")).toBeNull();
  });
});
