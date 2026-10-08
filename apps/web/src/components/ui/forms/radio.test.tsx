import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Radio, type RadioProps } from "@/components/ui/forms/radio";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const SHIPPING = [
  { value: "standard", label: "Normal", description: "3 a 5 dias úteis", aside: "4,90 €" },
  { value: "express", label: "Expresso", description: "1 dia útil", aside: "9,90 €" },
  { value: "pickup", label: "Levantar na loja" },
];

function radio(name: string): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>("radio", { name });
}

describe("Radio", () => {
  test("is a fieldset named by its legend", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    const group = screen.getByRole("group", { name: "Envio" });

    expect(group.tagName).toBe("FIELDSET");
    expect(group.querySelector("legend")?.textContent).toBe("Envio");
  });

  test("renders one native radio per option, sharing the name", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    const radios = screen.getAllByRole<HTMLInputElement>("radio");

    expect(radios.map((input) => input.value)).toEqual(["standard", "express", "pickup"]);
    expect(radios.every((input) => input.type === "radio" && input.name === "shipping")).toBe(true);
  });

  test("names each radio by its label and describes it with the description and the aside", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    const describedBy = radio("Normal").getAttribute("aria-describedby");

    expect(describedBy).toBe(
      `${screen.getByText("3 a 5 dias úteis").id} ${screen.getByText("4,90 €").id}`,
    );
    expect(radio("Levantar na loja").hasAttribute("aria-describedby")).toBe(false);
  });

  test("selects an option when its label is clicked", async () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    await userEvent.click(screen.getByText("Expresso"));

    expect(radio("Expresso").checked).toBe(true);
    expect(radio("Normal").checked).toBe(false);
  });

  test("starts from defaultValue when uncontrolled", async () => {
    render(
      <Radio legend="Envio" name="shipping" options={SHIPPING} defaultValue="express" />,
    );

    expect(radio("Expresso").checked).toBe(true);

    await userEvent.click(radio("Normal"));

    expect(radio("Normal").checked).toBe(true);
    expect(radio("Expresso").checked).toBe(false);
  });

  test("moves the selection with the arrow keys, as native radios do", async () => {
    render(
      <Radio legend="Envio" name="shipping" options={SHIPPING} defaultValue="standard" />,
    );

    await userEvent.tab();
    expect(document.activeElement).toBe(radio("Normal"));

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(radio("Expresso"));
    expect(radio("Expresso").checked).toBe(true);

    await userEvent.keyboard("{ArrowUp}");
    expect(radio("Normal").checked).toBe(true);
  });

  test("works controlled", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("standard");
      return (
        <Radio
          legend="Envio"
          name="shipping"
          options={SHIPPING}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);

    await userEvent.click(radio("Levantar na loja"));

    expect(onChange).toHaveBeenLastCalledWith("pickup");
    expect(radio("Levantar na loja").checked).toBe(true);
    expect(radio("Normal").checked).toBe(false);
  });

  test("cannot select a disabled option", async () => {
    const options = [SHIPPING[0], { ...SHIPPING[1], disabled: true }];
    render(<Radio legend="Envio" name="shipping" options={options} />);

    await userEvent.click(screen.getByText("Expresso"));

    expect(radio("Expresso").disabled).toBe(true);
    expect(radio("Expresso").checked).toBe(false);
  });

  test("disables every option through the fieldset", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} disabled />);

    expect(screen.getByRole<HTMLFieldSetElement>("group").disabled).toBe(true);
  });

  test("marks every radio required when the group is", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} required />);

    expect(screen.getAllByRole<HTMLInputElement>("radio").every((input) => input.required)).toBe(true);
  });

  test("shows the selected state with a dot, not by colour alone", () => {
    const { container } = render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    const dots = container.querySelectorAll("[data-radio-dot]");

    expect(dots).toHaveLength(3);
    expect(dots[0].className.split(" ")).toContain("peer-checked:block");
  });

  test("keeps the native inputs in the layout", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    const classes = radio("Normal").className.split(" ");

    expect(classes).toContain("size-5");
    expect(classes).not.toContain("sr-only");
  });

  test("the card variant boxes each option with the 3:1 border and marks the selected one", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} variant="card" />);

    const card = radio("Normal").closest("label");
    const classes = card?.className.split(" ") ?? [];

    expect(classes).toContain("border-border-control");
    expect(classes).toContain("has-checked:border-border-strong");
  });

  test("the plain variant has no box", () => {
    render(<Radio legend="Envio" name="shipping" options={SHIPPING} />);

    expect(radio("Normal").closest("label")?.className.split(" ")).not.toContain("border");
  });

  test.each([
    ["column", "flex-col"],
    ["row", "flex-row"],
  ] as const)("direction %s lays the options out with %s", (direction, expected) => {
    render(
      <Radio legend="Envio" name="shipping" options={SHIPPING} direction={direction} />,
    );

    const list = radio("Normal").closest("label")?.parentElement;

    expect(list?.className.split(" ")).toContain(expected);
  });

  test("uses token classes only and no inline style", () => {
    const { container } = render(
      <Radio legend="Envio" name="shipping" options={SHIPPING} variant="card" />,
    );

    expect(container.innerHTML).not.toMatch(RAW_VALUE);
    expect(container.querySelector("[style]")).toBeNull();
  });

  test("requires a legend and a name and accepts no style", () => {
    expectTypeOf<RadioProps>().toHaveProperty("legend").toEqualTypeOf<string>();
    expectTypeOf<RadioProps>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<RadioProps>().not.toHaveProperty("style");
  });
});
