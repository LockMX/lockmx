import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "@/components/ui/core/button";
import { ButtonLink } from "@/components/ui/core/button-link";

describe("ButtonLink", () => {
  test("is a link to its href, named by its content", () => {
    render(<ButtonLink href="/pt/loja">Ver a loja</ButtonLink>);

    const link = screen.getByRole("link", { name: "Ver a loja" });

    expect(link.getAttribute("href")).toBe("/pt/loja");
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("looks the same as a Button of the same variant, size and shape", () => {
    render(
      <>
        <Button variant="secondary" size="lg" slanted>
          Comprar
        </Button>
        <ButtonLink href="/pt/loja" variant="secondary" size="lg" slanted>
          Ver a loja
        </ButtonLink>
      </>,
    );

    expect(screen.getByRole("link").className).toBe(
      screen.getByRole("button").className,
    );
  });

  test("puts decorative icons around the label", () => {
    const { container } = render(
      <ButtonLink href="/pt/loja" iconRight="arrow-right">
        Ver a loja
      </ButtonLink>,
    );

    const icon = container.querySelector("svg");

    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.getAttribute("class")).toContain("lucide-arrow-right");
  });

  test("has no inline style", () => {
    render(<ButtonLink href="/pt/loja">Ver a loja</ButtonLink>);

    expect(screen.getByRole("link").getAttribute("style")).toBeNull();
  });
});
