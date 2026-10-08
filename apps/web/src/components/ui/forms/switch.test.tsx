import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Switch, type SwitchProps } from "@/components/ui/forms/switch";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

describe("Switch", () => {
  test("is a native checkbox with the switch role, named by its label", () => {
    render(<Switch label="Receber avisos de stock" />);

    const control = screen.getByRole<HTMLInputElement>("switch", {
      name: "Receber avisos de stock",
    });

    expect(control.tagName).toBe("INPUT");
    expect(control.type).toBe("checkbox");
  });

  test("leaves the state to the native checked property, without aria-checked", () => {
    render(<Switch label="Avisos" defaultChecked />);

    const control = screen.getByRole<HTMLInputElement>("switch");

    expect(control.checked).toBe(true);
    expect(control.hasAttribute("aria-checked")).toBe(false);
  });

  test("toggles when the label text is clicked", async () => {
    render(<Switch label="Avisos" />);

    await userEvent.click(screen.getByText("Avisos"));

    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(true);
  });

  test("toggles with Space from the keyboard", async () => {
    render(<Switch label="Avisos" />);
    const control = screen.getByRole<HTMLInputElement>("switch");

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(document.activeElement).toBe(control);
    expect(control.checked).toBe(true);
  });

  test("works controlled", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [checked, setChecked] = useState(true);
      return (
        <Switch
          label="Avisos"
          checked={checked}
          onChange={(event) => {
            onChange(event.target.checked);
            setChecked(event.target.checked);
          }}
        />
      );
    }
    render(<Controlled />);

    await userEvent.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(false);
  });

  test("does not toggle or take focus when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch label="Avisos" disabled onChange={onChange} />);
    const control = screen.getByRole<HTMLInputElement>("switch");

    await userEvent.tab();
    await userEvent.click(screen.getByText("Avisos"));

    expect(document.activeElement).not.toBe(control);
    expect(control.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("shows the state by the position of the thumb, not by colour alone", () => {
    const { container } = render(<Switch label="Avisos" />);

    const thumb = container.querySelector("[data-switch-thumb]");

    expect(thumb?.getAttribute("aria-hidden")).toBe("true");
    expect(thumb?.className.split(" ")).toContain("peer-checked:translate-x-4.5");
  });

  test("submits with a form through its name", () => {
    render(<Switch label="Avisos" name="alerts" defaultChecked />);

    expect(screen.getByRole("switch").getAttribute("name")).toBe("alerts");
  });

  test("uses token classes only and no inline style", () => {
    const { container } = render(<Switch label="Avisos" />);

    expect(container.innerHTML).not.toMatch(RAW_VALUE);
    expect(container.querySelector("[style]")).toBeNull();
  });

  test("requires a label and accepts no style, type or role", () => {
    expectTypeOf<SwitchProps>().toHaveProperty("label").toEqualTypeOf<string>();
    expectTypeOf<SwitchProps>().not.toHaveProperty("style");
    expectTypeOf<SwitchProps>().not.toHaveProperty("type");
    expectTypeOf<SwitchProps>().not.toHaveProperty("role");
  });
});
