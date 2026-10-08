import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Button } from "@/components/ui/core/button";

// A raw colour or pixel size in a class would bypass the tokens (ADR 0009).
const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

describe("Button", () => {
  test("is a button named by its content, with type button by default", () => {
    render(<Button>Guardar</Button>);

    const button = screen.getByRole("button", { name: "Guardar" });

    expect(button.getAttribute("type")).toBe("button");
  });

  test("can be a submit button", () => {
    render(<Button type="submit">Guardar</Button>);

    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  test("fires onClick on a click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("fires onClick on %s when focused", async (_key, keys) => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.tab();
    await userEvent.keyboard(keys);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });

  test("while loading it is busy, cannot be activated and shows a spinner", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Guardar" });

    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(container.querySelector("svg.lucide-loader-circle")).not.toBeNull();
  });

  test("is not marked busy when it is not loading", () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole("button").hasAttribute("aria-busy")).toBe(false);
  });

  test("dims a disabled button but not a loading one", () => {
    render(
      <>
        <Button disabled>Desativado</Button>
        <Button loading>A carregar</Button>
      </>,
    );

    const disabled = screen.getByRole("button", { name: "Desativado" });
    const loading = screen.getByRole("button", { name: "A carregar" });

    expect(disabled.className.split(" ")).toContain("opacity-40");
    expect(loading.className.split(" ")).not.toContain("opacity-40");
  });

  test("puts decorative icons before and after the label", () => {
    const { container } = render(
      <Button iconLeft="plus" iconRight="arrow-right">
        Adicionar
      </Button>,
    );

    const icons = [...container.querySelectorAll("svg")];

    expect(icons.map((icon) => icon.getAttribute("aria-hidden"))).toEqual([
      "true",
      "true",
    ]);
    expect(icons[0].getAttribute("class")).toContain("lucide-plus");
    expect(icons[1].getAttribute("class")).toContain("lucide-arrow-right");
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeTruthy();
  });

  test("replaces the left icon and drops the right one while loading", () => {
    const { container } = render(
      <Button loading iconLeft="plus" iconRight="arrow-right">
        Adicionar
      </Button>,
    );

    const icons = [...container.querySelectorAll("svg")];

    expect(icons).toHaveLength(1);
    expect(icons[0].getAttribute("class")).toContain("lucide-loader-circle");
  });

  test.each([
    "primary",
    "secondary",
    "outline",
    "outline-inverse",
    "ghost",
    "danger",
  ] as const)("variant %s renders with token classes only", (variant) => {
    render(<Button variant={variant}>Guardar</Button>);

    const button = screen.getByRole("button");

    expect(button.className).not.toMatch(RAW_VALUE);
    expect(button.getAttribute("style")).toBeNull();
  });

  test("each variant has its own classes", () => {
    const variants = [
      "primary",
      "secondary",
      "outline",
      "outline-inverse",
      "ghost",
      "danger",
    ] as const;
    render(
      <>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </>,
    );

    const classLists = variants.map(
      (variant) => screen.getByRole("button", { name: variant }).className,
    );

    expect(new Set(classLists).size).toBe(variants.length);
  });

  test.each([
    ["sm", "h-9"],
    ["md", "h-11"],
    ["lg", "h-13.5"],
  ] as const)("size %s has height %s", (size, height) => {
    render(<Button size={size}>Guardar</Button>);

    expect(screen.getByRole("button").className.split(" ")).toContain(height);
  });

  test("a slanted button clips its background, not itself, so the focus ring stays whole", () => {
    render(<Button slanted>Comprar</Button>);

    const classes = screen.getByRole("button").className.split(" ");

    expect(classes).toContain("before:clip-slant");
    expect(classes).not.toContain("clip-slant");
  });

  test("fullWidth stretches the button", () => {
    render(<Button fullWidth>Guardar</Button>);

    expect(screen.getByRole("button").className.split(" ")).toContain("w-full");
  });

  test("passes native attributes and a layout class through", () => {
    render(
      <Button name="intent" value="save" aria-describedby="hint" className="mt-4">
        Guardar
      </Button>,
    );

    const button = screen.getByRole("button");

    expect(button.getAttribute("name")).toBe("intent");
    expect(button.getAttribute("value")).toBe("save");
    expect(button.getAttribute("aria-describedby")).toBe("hint");
    expect(button.className.split(" ")).toContain("mt-4");
  });

  // Checked by `pnpm typecheck`: the element is built, never rendered.
  test("takes no style prop", () => {
    // @ts-expect-error style is not a prop: visual rules come from classes.
    const styled = <Button style={{ opacity: 0.5 }}>Guardar</Button>;

    expect(styled).toBeTruthy();
  });
});
