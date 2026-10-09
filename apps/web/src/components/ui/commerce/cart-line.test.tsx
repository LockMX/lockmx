import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { CartLine, type CartLineProps } from "@/components/ui/commerce/cart-line";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;
const NBSP = " ";

const LINE = {
  title: "Pneu Enduro 120/90",
  quantity: 2,
  lineTotalCents: 69800,
  locale: "pt-PT",
  quantityLabel: "Quantidade",
  decreaseLabel: "Diminuir",
  increaseLabel: "Aumentar",
  onQuantityChange: () => {},
} satisfies CartLineProps;

const COMPACT = {
  title: "Pneu Enduro 120/90",
  quantity: 2,
  lineTotalCents: 69800,
  locale: "pt-PT",
  compact: true,
  quantitySummary: "Qtd. {count}",
} satisfies CartLineProps;

function line(): HTMLElement {
  return screen.getByTestId("line");
}

describe("CartLine", () => {
  test("shows the title, the details and the line total", () => {
    render(<CartLine data-testid="line" {...LINE} meta="Traseiro, 18 polegadas" />);

    expect(screen.getByText("Pneu Enduro 120/90")).toBeDefined();
    expect(screen.getByText("Traseiro, 18 polegadas")).toBeDefined();
    expect(screen.getByText("698,00 €")).toBeDefined();
  });

  test("shows the total it is given and computes none from the quantity", () => {
    // Not 2 x anything: a discount on the server made it so.
    render(<CartLine {...LINE} quantity={2} lineTotalCents={12345} />);

    expect(screen.getByText("123,45 €")).toBeDefined();
  });

  test("has a quantity stepper named from props, with the quantity and the maximum", () => {
    render(<CartLine {...LINE} max={5} />);
    const field = screen.getByRole("spinbutton", { name: "Quantidade" }) as HTMLInputElement;

    expect(field.value).toBe("2");
    expect(field.getAttribute("aria-valuemax")).toBe("5");
    expect(screen.getByRole("button", { name: "Diminuir" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Aumentar" })).toBeDefined();
  });

  test("reports a new quantity and keeps showing the one it was given", async () => {
    const onQuantityChange = vi.fn();
    render(<CartLine {...LINE} onQuantityChange={onQuantityChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }));

    expect(onQuantityChange).toHaveBeenCalledExactlyOnceWith(3);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("2");
  });

  test("has no remove button without a handler", () => {
    render(<CartLine {...LINE} />);

    expect(screen.queryByRole("button", { name: /Remover/ })).toBeNull();
  });

  test("the remove button is named by its label and then the product", async () => {
    const onRemove = vi.fn();
    render(<CartLine {...LINE} removeLabel="Remover" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: "Remover Pneu Enduro 120/90" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test("the compact line has no controls, only the quantity as text", () => {
    render(<CartLine data-testid="line" {...COMPACT} />);

    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Qtd. 2")).toBeDefined();
    expect(line().textContent).toBe(`Pneu Enduro 120/90Qtd. 2698,00${NBSP}€`);
  });

  test("the compact line is smaller: image, padding and total", () => {
    const { unmount } = render(<CartLine data-testid="line" {...LINE} />);
    expect(line().className.split(" ")).toContain("py-4.5");
    expect(line().querySelector("[data-cart-image]")?.className.split(" ")).toContain("size-22");
    expect(screen.getByText("698,00 €").className).toContain("text-heading-md");
    unmount();

    render(<CartLine data-testid="line" {...COMPACT} />);
    expect(line().className.split(" ")).toContain("py-3");
    expect(line().querySelector("[data-cart-image]")?.className.split(" ")).toContain("size-14");
    expect(screen.getByText("698,00 €").className).toContain("text-heading-sm");
  });

  test("shows the image, decorative unless it has an alt", () => {
    const { unmount } = render(
      <CartLine data-testid="line" {...LINE} image={{ src: "/brand/pneu.jpg" }} />,
    );
    const image = line().querySelector("img") as HTMLImageElement;
    expect(image.getAttribute("alt")).toBe("");
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain("/brand/pneu.jpg");
    unmount();

    render(<CartLine {...LINE} image={{ src: "/brand/pneu.jpg", alt: "Pneu visto de lado" }} />);
    expect(screen.getByRole("img", { name: "Pneu visto de lado" })).toBeDefined();
  });

  test("shows a placeholder icon when there is no image", () => {
    render(<CartLine data-testid="line" {...LINE} />);

    expect(line().querySelector("img")).toBeNull();
    expect(line().querySelector("[data-cart-image] svg")).not.toBeNull();
  });

  test("takes its text from props only", () => {
    render(
      <CartLine
        data-testid="line"
        title="Enduro tyre"
        meta="Rear"
        quantity={1}
        lineTotalCents={34900}
        locale="en"
        quantityLabel="Quantity"
        decreaseLabel="Decrease"
        increaseLabel="Increase"
        onQuantityChange={() => {}}
        removeLabel="Remove"
        onRemove={() => {}}
      />,
    );

    expect(line().textContent).toBe("Enduro tyreRearRemove Enduro tyre€349.00");
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <CartLine {...LINE} meta="Traseiro" removeLabel="Remover" onRemove={() => {}} />,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("a full line requires the stepper labels and a compact one the summary", () => {
    expectTypeOf<CartLineProps>().toHaveProperty("lineTotalCents").toEqualTypeOf<number>();
    expectTypeOf<CartLineProps>().not.toHaveProperty("style");
    // @ts-expect-error a full line needs the labels of its stepper
    const withoutLabels: CartLineProps = { title: "a", quantity: 1, lineTotalCents: 1, locale: "en" };
    // @ts-expect-error a compact line needs its quantity text
    const withoutSummary: CartLineProps = { title: "a", quantity: 1, lineTotalCents: 1, locale: "en", compact: true };
    const { onQuantityChange, ...unanswered } = LINE;
    // @ts-expect-error a full line has a stepper, so someone must answer it
    const withoutHandler: CartLineProps = unanswered;
    expect([withoutLabels, withoutSummary, withoutHandler, onQuantityChange]).toHaveLength(4);
  });
});
