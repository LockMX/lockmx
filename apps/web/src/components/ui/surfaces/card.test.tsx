import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Card, type CardProps } from "@/components/ui/surfaces/card";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

describe("Card", () => {
  test("is a plain container by default, outlined with medium padding", () => {
    render(<Card data-testid="card">Conteúdo</Card>);
    const card = screen.getByTestId("card");

    expect(card.tagName).toBe("DIV");
    expect(card.textContent).toBe("Conteúdo");
    expect(card.className).toContain("border-border-subtle");
    expect(card.className.split(" ")).toContain("p-6");
    expect(card.hasAttribute("tabindex")).toBe(false);
  });

  test.each(["section", "article", "li"] as const)("can be a %s", (as) => {
    render(
      <Card as={as} data-testid="card">
        Conteúdo
      </Card>,
    );

    expect(screen.getByTestId("card").tagName).toBe(as.toUpperCase());
  });

  test.each([
    ["outlined", "bg-surface-card"],
    ["raised", "shadow-md"],
    ["subtle", "bg-surface-subtle"],
    ["inverse", "bg-surface-inverse"],
    ["accent", "bg-surface-accent"],
  ] as const)("has the %s variant", (variant, expected) => {
    render(
      <Card variant={variant} data-testid="card">
        Conteúdo
      </Card>,
    );

    expect(screen.getByTestId("card").className).toContain(expected);
  });

  test.each([
    ["none", "p-0"],
    ["sm", "p-4"],
    ["md", "p-6"],
    ["lg", "p-8"],
  ] as const)("has %s padding", (padding, expected) => {
    render(
      <Card padding={padding} data-testid="card">
        Conteúdo
      </Card>,
    );

    expect(screen.getByTestId("card").className.split(" ")).toContain(expected);
  });

  test("an inverse card declares its surface, for the focus ring of what it holds", () => {
    render(
      <Card variant="inverse" data-testid="card">
        Conteúdo
      </Card>,
    );

    expect(screen.getByTestId("card").getAttribute("data-surface")).toBe("inverse");
  });

  test("with `href` it is one link", () => {
    render(<Card href="/pt/loja">Ver a loja</Card>);
    const link = screen.getByRole("link", { name: "Ver a loja" });

    expect(link.getAttribute("href")).toBe("/pt/loja");
    expect(link.className).toContain("hover:border-border-strong");
  });

  test("with `onClick` it is one button, activated by click and keyboard", async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Escolher</Card>);
    const button = screen.getByRole("button", { name: "Escolher" });

    expect(button.getAttribute("type")).toBe("button");
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test("an interactive inverse card keeps the dark focus ring around itself", () => {
    render(
      <Card variant="inverse" href="/pt">
        Início
      </Card>,
    );

    // Its own outline is drawn on the page outside it, not on the black surface.
    expect(screen.getByRole("link").hasAttribute("data-surface")).toBe(false);
  });

  test("the lift on hover is skipped under reduced motion", () => {
    render(<Card href="/pt">Início</Card>);

    expect(screen.getByRole("link").className).toContain(
      "motion-safe:hover:-translate-y-0.5",
    );
  });

  test("a static card does not react to hover", () => {
    render(<Card data-testid="card">Conteúdo</Card>);

    expect(screen.getByTestId("card").className).not.toContain("hover:");
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <>
        <Card variant="raised">A</Card>
        <Card href="/pt">B</Card>
      </>,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("does not accept `style`, nor an element outside the safe set", () => {
    expectTypeOf<CardProps>().not.toHaveProperty("style");
    // @ts-expect-error a card is never an anchor or a button through `as`
    void (<Card as="a">x</Card>);
  });
});
