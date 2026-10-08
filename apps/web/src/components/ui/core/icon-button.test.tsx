import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { IconButton } from "@/components/ui/core/icon-button";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

describe("IconButton", () => {
  test("is a button named by its label, with the label as tooltip", () => {
    render(<IconButton icon="search" label="Procurar" />);

    const button = screen.getByRole("button", { name: "Procurar" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("title")).toBe("Procurar");
  });

  test("hides the icon from assistive technology", () => {
    const { container } = render(<IconButton icon="search" label="Procurar" />);

    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("shows a count and includes it in the accessible name", () => {
    render(<IconButton icon="shopping-cart" label="Carrinho" count={3} />);

    expect(screen.getByRole("button", { name: "Carrinho 3" })).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  test("shows no count when it is zero or absent", () => {
    render(
      <>
        <IconButton icon="shopping-cart" label="Carrinho" count={0} />
        <IconButton icon="user" label="Conta" />
      </>,
    );

    expect(screen.getByRole("button", { name: "Carrinho" })).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  test("fires onClick on click, Enter and Space", async () => {
    const onClick = vi.fn();
    render(<IconButton icon="x" label="Fechar" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<IconButton icon="x" label="Fechar" disabled onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  test.each(["ghost", "ghost-inverse", "outline", "primary", "secondary"] as const)(
    "variant %s renders with token classes only",
    (variant) => {
      render(<IconButton icon="x" label="Fechar" variant={variant} />);

      const button = screen.getByRole("button");

      expect(button.className).not.toMatch(RAW_VALUE);
      expect(button.getAttribute("style")).toBeNull();
    },
  );

  test.each([
    ["sm", "size-8"],
    ["md", "size-10"],
    ["lg", "size-12"],
  ] as const)("size %s is a %s square", (size, square) => {
    render(<IconButton icon="x" label="Fechar" size={size} />);

    expect(screen.getByRole("button").className.split(" ")).toContain(square);
  });

  // Checked by `pnpm typecheck`: the elements are built, never rendered.
  test("requires a label and takes no children", () => {
    // @ts-expect-error an icon-only button needs an accessible name.
    const unnamed = <IconButton icon="x" />;
    // @ts-expect-error the content is the icon.
    const withChildren = <IconButton icon="x" label="Fechar">Fechar</IconButton>;

    expect([unnamed, withChildren]).toHaveLength(2);
  });
});
