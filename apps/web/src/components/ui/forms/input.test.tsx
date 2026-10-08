import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Input } from "@/components/ui/forms/input";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

function boxOf(control: HTMLElement): HTMLElement {
  const box = control.parentElement;
  if (!box) throw new Error("The control has no box");
  return box;
}

describe("Input", () => {
  test("is a text input found by its label", () => {
    render(<Input label="Nome" />);

    const input = screen.getByLabelText("Nome");

    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("type")).toBe("text");
  });

  test("focuses the input when the label is clicked", async () => {
    render(<Input label="Nome" />);

    await userEvent.click(screen.getByText("Nome"));

    expect(document.activeElement).toBe(screen.getByLabelText("Nome"));
  });

  test("generates an id when none is given and uses the given one otherwise", () => {
    render(
      <>
        <Input label="Nome" />
        <Input label="Email" id="email" />
      </>,
    );

    expect(screen.getByLabelText("Nome").getAttribute("id")).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("id")).toBe("email");
  });

  test("takes a native type", () => {
    render(<Input label="Email" type="email" />);

    expect(screen.getByLabelText("Email").getAttribute("type")).toBe("email");
  });

  test("works uncontrolled", async () => {
    render(<Input label="Nome" defaultValue="Ana" />);
    const input = screen.getByLabelText<HTMLInputElement>("Nome");

    await userEvent.type(input, " Silva");

    expect(input.value).toBe("Ana Silva");
  });

  test("works controlled", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Input
          label="Nome"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");

    expect(onChange).toHaveBeenLastCalledWith("Ana");
    expect(screen.getByLabelText<HTMLInputElement>("Nome").value).toBe("Ana");
  });

  test("wires hint and error to the input", () => {
    render(<Input label="Email" hint="Formato nome@dominio" error="Email inválido" />);

    const input = screen.getByLabelText("Email");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(
      `${screen.getByText("Email inválido").id} ${screen.getByText("Formato nome@dominio").id}`,
    );
  });

  test("is not focusable or editable when disabled", async () => {
    render(<Input label="Nome" disabled />);
    const input = screen.getByLabelText<HTMLInputElement>("Nome");

    await userEvent.tab();
    await userEvent.type(input, "Ana");

    expect(document.activeElement).not.toBe(input);
    expect(input.value).toBe("");
  });

  test("shows a decorative icon and a suffix", () => {
    const { container } = render(<Input label="Peso" iconLeft="package" suffix="kg" />);

    expect(container.querySelector("svg.lucide-package")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("kg")).toBeTruthy();
  });

  test.each([
    ["sm", "h-9"],
    ["md", "h-11"],
    ["lg", "h-13"],
  ] as const)("size %s has height %s", (size, height) => {
    render(<Input label="Nome" size={size} />);

    expect(boxOf(screen.getByLabelText("Nome")).className.split(" ")).toContain(height);
  });

  test("uses the 3:1 control border and token classes only", () => {
    render(<Input label="Nome" />);
    const input = screen.getByLabelText("Nome");
    const box = boxOf(input);

    expect(box.className.split(" ")).toContain("border-border-control");
    expect(box.className).not.toMatch(RAW_VALUE);
    expect(input.className).not.toMatch(RAW_VALUE);
    expect(box.getAttribute("style")).toBeNull();
    expect(input.getAttribute("style")).toBeNull();
  });

  test("passes native attributes through", () => {
    render(<Input label="Email" name="email" autoComplete="email" placeholder="nome@dominio.pt" />);

    const input = screen.getByLabelText("Email");

    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("autocomplete")).toBe("email");
    expect(input.getAttribute("placeholder")).toBe("nome@dominio.pt");
  });

  test("marks a required input and shows the mark", () => {
    render(<Input label="Email" required requiredLabel="obrigatório" />);

    expect(screen.getByRole("textbox", { name: "Email" }).hasAttribute("required")).toBe(true);
    expect(screen.getByTitle("obrigatório")).toBeTruthy();
  });
});
