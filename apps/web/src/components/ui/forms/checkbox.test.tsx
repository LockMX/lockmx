import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Checkbox, type CheckboxProps } from "@/components/ui/forms/checkbox";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

describe("Checkbox", () => {
  test("is a native checkbox named by its label", () => {
    render(<Checkbox label="Aceito os termos" />);

    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", {
      name: "Aceito os termos",
    });

    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox.type).toBe("checkbox");
  });

  test("keeps the description out of the name and links it as the description", () => {
    render(
      <Checkbox label="Newsletter" description="Um email por mês, no máximo." />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Newsletter" });
    const description = screen.getByText("Um email por mês, no máximo.");

    expect(checkbox.getAttribute("aria-describedby")).toBe(description.id);
  });

  test("has no describedby without a description", () => {
    render(<Checkbox label="Newsletter" />);

    expect(screen.getByRole("checkbox").hasAttribute("aria-describedby")).toBe(false);
  });

  test("toggles when the label text is clicked", async () => {
    render(<Checkbox label="Newsletter" />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox");

    await userEvent.click(screen.getByText("Newsletter"));

    expect(checkbox.checked).toBe(true);
  });

  test("toggles with Space from the keyboard", async () => {
    render(<Checkbox label="Newsletter" />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox");

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(document.activeElement).toBe(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test("works uncontrolled from defaultChecked", async () => {
    render(<Checkbox label="Newsletter" defaultChecked />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox");

    expect(checkbox.checked).toBe(true);
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  test("works controlled", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          label="Newsletter"
          checked={checked}
          onChange={(event) => {
            onChange(event.target.checked);
            setChecked(event.target.checked);
          }}
        />
      );
    }
    render(<Controlled />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole<HTMLInputElement>("checkbox").checked).toBe(true);
  });

  test("does not toggle or take focus when disabled", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Newsletter" disabled onChange={onChange} />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox");

    await userEvent.tab();
    await userEvent.click(screen.getByText("Newsletter"));

    expect(document.activeElement).not.toBe(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("shows the checked state with a check mark, not by colour alone", () => {
    const { container } = render(<Checkbox label="Newsletter" />);

    const mark = container.querySelector("svg.lucide-check");

    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect(mark?.getAttribute("class")?.split(" ")).toContain("peer-checked:block");
  });

  test("keeps the native input in the layout so it can be focused and seen", () => {
    render(<Checkbox label="Newsletter" />);

    const classes = screen.getByRole("checkbox").className.split(" ");

    expect(classes).toContain("size-5");
    expect(classes).not.toContain("sr-only");
  });

  test("passes native attributes through", () => {
    render(<Checkbox label="Newsletter" name="newsletter" value="yes" required />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox.getAttribute("name")).toBe("newsletter");
    expect(checkbox.getAttribute("value")).toBe("yes");
    expect(checkbox.hasAttribute("required")).toBe(true);
  });

  test("uses token classes only and no inline style", () => {
    const { container } = render(
      <Checkbox label="Newsletter" description="Um email por mês." />,
    );

    expect(container.innerHTML).not.toMatch(RAW_VALUE);
    expect(container.querySelector("[style]")).toBeNull();
  });

  test("requires a label and accepts no style or type", () => {
    expectTypeOf<CheckboxProps>().toHaveProperty("label").toEqualTypeOf<string>();
    expectTypeOf<CheckboxProps>().not.toHaveProperty("style");
    expectTypeOf<CheckboxProps>().not.toHaveProperty("type");
  });
});
