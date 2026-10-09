import { render, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, test } from "vitest";
import { Price, type PriceProps } from "@/components/ui/commerce/price";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

// `Intl` puts a no-break space, not a space, before the euro sign in pt-PT.
const NBSP = " ";

function price(): HTMLElement {
  return screen.getByTestId("price");
}

describe("Price", () => {
  // The expected text is what `Intl.NumberFormat` gives in Node 24 (ICU 78).
  // pt-PT groups thousands only from five digits, so 1234,50 has no separator.
  test.each([
    [34900, `349,00${NBSP}€`],
    [123450, `1234,50${NBSP}€`],
    [1234500, `12${NBSP}345,00${NBSP}€`],
    [0, `0,00${NBSP}€`],
    [1, `0,01${NBSP}€`],
  ])("formats %i cents in pt-PT", (amountCents, expected) => {
    render(<Price data-testid="price" amountCents={amountCents} locale="pt-PT" />);

    expect(price().textContent).toBe(expected);
  });

  test.each([
    [34900, "€349.00"],
    [123450, "€1,234.50"],
    [0, "€0.00"],
    [1, "€0.01"],
  ])("formats %i cents in en", (amountCents, expected) => {
    render(<Price data-testid="price" amountCents={amountCents} locale="en" />);

    expect(price().textContent).toBe(expected);
  });

  test("formats in another currency when given one", () => {
    render(<Price data-testid="price" amountCents={34900} locale="en" currency="GBP" />);

    expect(price().textContent).toBe("£349.00");
  });

  test.each([349.5, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "refuses %d as an amount in cents",
    (amountCents) => {
      expect(() => render(<Price amountCents={amountCents} locale="pt-PT" />)).toThrow(
        RangeError,
      );
    },
  );

  test("refuses a compare-at amount that is not whole cents", () => {
    expect(() =>
      render(
        <Price
          amountCents={34900}
          compareAtCents={399.9}
          compareAtLabel="Antes"
          currentLabel="Agora"
          locale="pt-PT"
        />,
      ),
    ).toThrow(RangeError);
  });

  test("shows the compare-at price struck through, and says which is which in text", () => {
    render(
      <Price
        data-testid="price"
        amountCents={34900}
        compareAtCents={39900}
        compareAtLabel="Antes"
        currentLabel="Agora"
        locale="pt-PT"
      />,
    );
    const struck = price().querySelector("s") as HTMLElement;

    expect(struck.textContent).toBe(`Antes 399,00${NBSP}€`);
    expect(price().textContent).toBe(`Agora 349,00${NBSP}€Antes 399,00${NBSP}€`);
    // The words are for assistive technology: sighted users see the line.
    expect(screen.getByText("Antes").className).toContain("sr-only");
    expect(screen.getByText("Agora").className).toContain("sr-only");
  });

  test("colours a reduced price, and only a reduced one, as a sale", () => {
    const { unmount } = render(<Price amountCents={34900} locale="pt-PT" />);
    expect(screen.getByText("349,00 €").className).toContain("text-text-strong");
    unmount();

    render(
      <Price
        amountCents={34900}
        compareAtCents={39900}
        compareAtLabel="Antes"
        currentLabel="Agora"
        locale="pt-PT"
      />,
    );
    expect(screen.getByText("349,00 €").className).toContain("text-status-danger");
  });

  test("shows a note under the price", () => {
    render(<Price data-testid="price" amountCents={34900} locale="pt-PT" note="IVA incluído" />);

    expect(screen.getByText("IVA incluído")).toBeDefined();
    expect(price().textContent).toBe(`349,00${NBSP}€IVA incluído`);
  });

  test.each([
    [undefined, "text-heading-md"],
    ["sm", "text-heading-sm"],
    ["md", "text-heading-md"],
    ["lg", "text-display-sm"],
    ["xl", "text-display-md"],
  ] as const)("with size %s the amount is %s", (size, expected) => {
    render(<Price amountCents={34900} locale="pt-PT" size={size} />);

    expect(screen.getByText("349,00 €").className.split(" ")).toContain(expected);
  });

  test("on a dark surface the amount is light, reduced or not", () => {
    render(
      <Price
        amountCents={34900}
        compareAtCents={39900}
        compareAtLabel="Antes"
        currentLabel="Agora"
        locale="pt-PT"
        tone="inverse"
        note="IVA incluído"
      />,
    );

    expect(screen.getByText("349,00 €").className).toContain("text-text-inverse");
    expect(screen.getByText("IVA incluído").className).toContain("text-text-inverse-muted");
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <Price
        amountCents={34900}
        compareAtCents={39900}
        compareAtLabel="Antes"
        currentLabel="Agora"
        locale="pt-PT"
        note="IVA incluído"
      />,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("requires the locale, and both labels with a compare-at price", () => {
    expectTypeOf<PriceProps>().toHaveProperty("locale").toEqualTypeOf<string>();
    expectTypeOf<PriceProps>().not.toHaveProperty("style");
    // @ts-expect-error a compare-at price needs its labels
    const withoutLabels: PriceProps = { amountCents: 1, locale: "en", compareAtCents: 2 };
    expect(withoutLabels).toBeDefined();
  });
});
