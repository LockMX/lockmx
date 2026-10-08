import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";
import { Select } from "@/components/ui/forms/select";

const districts = [
  { value: "lisboa", label: "Lisboa" },
  { value: "porto", label: "Porto" },
];

describe("Select", () => {
  test("is a native select found by its label, with one option per entry", () => {
    render(<Select label="Distrito" options={districts} />);

    const select = screen.getByLabelText("Distrito");

    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Lisboa",
      "Porto",
    ]);
    expect(screen.getByRole<HTMLOptionElement>("option", { name: "Porto" }).value).toBe("porto");
  });

  test("puts the placeholder first, as an empty choice", () => {
    render(<Select label="Distrito" options={districts} placeholder="Escolhe um distrito" />);

    const [first] = screen.getAllByRole<HTMLOptionElement>("option");

    expect(first.textContent).toBe("Escolhe um distrito");
    expect(first.value).toBe("");
  });

  test("works uncontrolled", async () => {
    render(<Select label="Distrito" options={districts} defaultValue="lisboa" />);
    const select = screen.getByLabelText<HTMLSelectElement>("Distrito");

    await userEvent.selectOptions(select, "porto");

    expect(select.value).toBe("porto");
  });

  test("works controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState("lisboa");
      return (
        <Select
          label="Distrito"
          options={districts}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }
    render(<Controlled />);
    const select = screen.getByLabelText<HTMLSelectElement>("Distrito");

    await userEvent.selectOptions(select, "porto");

    expect(select.value).toBe("porto");
  });

  test("wires hint and error to the select", () => {
    render(<Select label="Distrito" options={districts} hint="Para o envio" error="Escolhe um distrito" />);

    const select = screen.getByLabelText("Distrito");

    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.getAttribute("aria-describedby")).toBe(
      `${screen.getByText("Escolhe um distrito").id} ${screen.getByText("Para o envio").id}`,
    );
  });

  test("cannot be changed when disabled", async () => {
    render(<Select label="Distrito" options={districts} defaultValue="lisboa" disabled />);
    const select = screen.getByLabelText<HTMLSelectElement>("Distrito");

    await userEvent.selectOptions(select, "porto").catch(() => undefined);

    expect(select.value).toBe("lisboa");
  });

  test("draws its own decorative chevron and has no inline style", () => {
    const { container } = render(<Select label="Distrito" options={districts} />);

    expect(container.querySelector("svg.lucide-chevron-down")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByLabelText("Distrito").getAttribute("style")).toBeNull();
  });

  test.each([
    ["sm", "h-9"],
    ["md", "h-11"],
    ["lg", "h-13"],
  ] as const)("size %s has height %s", (size, height) => {
    render(<Select label="Distrito" options={districts} size={size} />);

    expect(screen.getByLabelText("Distrito").parentElement?.className.split(" ")).toContain(height);
  });
});
