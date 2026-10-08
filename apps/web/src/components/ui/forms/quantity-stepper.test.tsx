import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import {
  QuantityStepper,
  type QuantityStepperProps,
} from "@/components/ui/forms/quantity-stepper";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const TEXT = {
  label: "Quantidade",
  decreaseLabel: "Diminuir",
  increaseLabel: "Aumentar",
};

function field(): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>("spinbutton", { name: "Quantidade" });
}

function decrease(): HTMLElement {
  return screen.getByRole("button", { name: "Diminuir" });
}

function increase(): HTMLElement {
  return screen.getByRole("button", { name: "Aumentar" });
}

describe("QuantityStepper", () => {
  test("is a numeric text field and two buttons, all named from props", () => {
    render(<QuantityStepper {...TEXT} />);

    expect(field().type).toBe("text");
    expect(field().getAttribute("inputmode")).toBe("numeric");
    expect(decrease().getAttribute("type")).toBe("button");
    expect(increase().getAttribute("type")).toBe("button");
  });

  test("starts at 1 between 1 and 99 by default and exposes the range", () => {
    render(<QuantityStepper {...TEXT} />);

    expect(field().value).toBe("1");
    expect(field().getAttribute("aria-valuenow")).toBe("1");
    expect(field().getAttribute("aria-valuemin")).toBe("1");
    expect(field().getAttribute("aria-valuemax")).toBe("99");
  });

  test("increases and decreases with the buttons", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={3} onChange={onChange} />);

    await userEvent.click(increase());
    expect(field().value).toBe("4");
    expect(onChange).toHaveBeenLastCalledWith(4);

    await userEvent.click(decrease());
    await userEvent.click(decrease());
    expect(field().value).toBe("2");
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  test("activates the buttons with Enter and Space", async () => {
    render(<QuantityStepper {...TEXT} defaultValue={3} />);

    increase().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(field().value).toBe("5");
  });

  test("changes with the up and down arrow keys in the field", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={3} onChange={onChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}");

    expect(field().value).toBe("4");
    expect(onChange.mock.calls).toEqual([[4], [5], [4]]);
  });

  test("does not go below the minimum and says the button is unavailable without removing focus", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={2} min={2} onChange={onChange} />);

    decrease().focus();
    await userEvent.keyboard("{Enter}");

    expect(field().value).toBe("2");
    expect(onChange).not.toHaveBeenCalled();
    expect(decrease().getAttribute("aria-disabled")).toBe("true");
    expect(decrease().hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(decrease());
  });

  test("does not go above the maximum", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={4} max={5} onChange={onChange} />);

    await userEvent.click(increase());
    await userEvent.click(increase());

    expect(field().value).toBe("5");
    expect(onChange.mock.calls).toEqual([[5]]);
    expect(increase().getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(increase());
  });

  test("clamps a default value outside the range", () => {
    render(<QuantityStepper {...TEXT} defaultValue={500} max={10} />);

    expect(field().value).toBe("10");
  });

  test("accepts a typed number in range", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} onChange={onChange} />);

    await userEvent.clear(field());
    await userEvent.type(field(), "12");

    expect(field().value).toBe("12");
    expect(onChange).toHaveBeenLastCalledWith(12);
  });

  test("rejects anything that is not a digit", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={3} onChange={onChange} />);

    await userEvent.type(field(), "a-.e ");

    expect(field().value).toBe("3");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("never emits a typed value outside the range, and clamps it when the field is left", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={5} max={20} onChange={onChange} />);

    await userEvent.clear(field());
    await userEvent.type(field(), "150");
    await userEvent.tab();

    expect(field().value).toBe("20");
    for (const [value] of onChange.mock.calls) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(20);
    }
    expect(onChange).toHaveBeenLastCalledWith(20);
  });

  test("raises a typed value below the minimum when the field is left", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={6} min={4} onChange={onChange} />);

    await userEvent.clear(field());
    await userEvent.type(field(), "2");
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.tab();

    expect(field().value).toBe("4");
    expect(onChange.mock.calls).toEqual([[4]]);
  });

  test("restores the last value when the field is left empty", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={7} onChange={onChange} />);

    await userEvent.clear(field());
    expect(field().value).toBe("");

    await userEvent.tab();

    expect(field().value).toBe("7");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("works controlled: it shows the value it is given", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState(2);
      return (
        <QuantityStepper
          {...TEXT}
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);

    await userEvent.click(increase());

    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(field().value).toBe("3");
  });

  test("controlled without an update keeps the given value", async () => {
    render(<QuantityStepper {...TEXT} value={2} onChange={() => {}} />);

    await userEvent.click(increase());

    expect(field().value).toBe("2");
  });

  test("announces the new value politely when a button changes it", async () => {
    const { container } = render(<QuantityStepper {...TEXT} defaultValue={3} />);
    const live = container.querySelector("[aria-live='polite']");

    expect(live?.textContent).toBe("");

    await userEvent.click(increase());

    expect(live?.textContent).toBe("4");
  });

  test("does not announce every keystroke typed in the field", async () => {
    const { container } = render(<QuantityStepper {...TEXT} defaultValue={3} />);

    await userEvent.clear(field());
    await userEvent.type(field(), "12");

    expect(container.querySelector("[aria-live='polite']")?.textContent).toBe("");
  });

  test("is inert when disabled", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper {...TEXT} defaultValue={3} disabled onChange={onChange} />);

    await userEvent.click(increase());
    await userEvent.type(field(), "9");

    expect(field().disabled).toBe(true);
    expect(increase().hasAttribute("disabled")).toBe(true);
    expect(decrease().hasAttribute("disabled")).toBe(true);
    expect(field().value).toBe("3");
    expect(onChange).not.toHaveBeenCalled();
  });

  function renderInForm(props: Partial<QuantityStepperProps>) {
    const submitted = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted(new FormData(event.currentTarget).get("quantity"));
        }}
      >
        <QuantityStepper {...TEXT} name="quantity" {...props} />
        <button type="submit">Atualizar</button>
      </form>,
    );
    return submitted;
  }

  test("submits the value with its form, under its name", async () => {
    const submitted = renderInForm({ defaultValue: 3 });

    field().focus();
    await userEvent.keyboard("{Enter}");

    expect(submitted).toHaveBeenLastCalledWith("3");
  });

  test("submits the clamped value when Enter is pressed on a typed value out of range", async () => {
    const submitted = renderInForm({ defaultValue: 5, max: 20 });

    await userEvent.clear(field());
    await userEvent.type(field(), "150{Enter}");

    expect(submitted).toHaveBeenLastCalledWith("20");
    expect(field().value).toBe("20");
  });

  test("submits the last value when Enter is pressed on an empty field", async () => {
    const submitted = renderInForm({ defaultValue: 7 });

    await userEvent.clear(field());
    await userEvent.keyboard("{Enter}");

    expect(submitted).toHaveBeenLastCalledWith("7");
  });

  test("submits nothing when disabled", async () => {
    const { container } = render(
      <form>
        <QuantityStepper {...TEXT} name="quantity" disabled />
      </form>,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("No form");

    expect(new FormData(form).has("quantity")).toBe(false);
  });

  test("marks the field invalid while the typed value is out of range", async () => {
    render(<QuantityStepper {...TEXT} defaultValue={5} max={20} />);

    expect(field().hasAttribute("aria-invalid")).toBe(false);

    await userEvent.clear(field());
    await userEvent.type(field(), "150");
    expect(field().getAttribute("aria-invalid")).toBe("true");

    await userEvent.tab();
    expect(field().hasAttribute("aria-invalid")).toBe(false);
  });

  test.each([
    ["sm", "h-8"],
    ["md", "h-11"],
  ] as const)("size %s has height %s", (size, height) => {
    render(<QuantityStepper {...TEXT} size={size} />);

    expect(field().parentElement?.className.split(" ")).toContain(height);
  });

  test("uses the 3:1 control border, token classes only and no inline style", () => {
    const { container } = render(<QuantityStepper {...TEXT} />);

    expect(field().parentElement?.className.split(" ")).toContain("border-border-control");
    expect(container.innerHTML).not.toMatch(RAW_VALUE);
    expect(container.querySelector("[style]")).toBeNull();
  });

  test("requires the three names and accepts no style", () => {
    expectTypeOf<QuantityStepperProps>().toHaveProperty("label").toEqualTypeOf<string>();
    expectTypeOf<QuantityStepperProps>().toHaveProperty("decreaseLabel").toEqualTypeOf<string>();
    expectTypeOf<QuantityStepperProps>().toHaveProperty("increaseLabel").toEqualTypeOf<string>();
    expectTypeOf<QuantityStepperProps>().not.toHaveProperty("style");
  });
});
