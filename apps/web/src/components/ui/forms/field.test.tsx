import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Field } from "@/components/ui/forms/field";

describe("Field", () => {
  test("labels the control it wraps", () => {
    render(
      <Field id="email" label="Email">
        {(control) => <input {...control} />}
      </Field>,
    );

    expect(screen.getByLabelText("Email").getAttribute("id")).toBe("email");
  });

  test("describes the control with the hint", () => {
    render(
      <Field id="email" label="Email" hint="Usamos só para a encomenda.">
        {(control) => <input {...control} />}
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    const hint = screen.getByText("Usamos só para a encomenda.");

    expect(input.getAttribute("aria-describedby")).toBe(hint.getAttribute("id"));
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  test("marks the control invalid and describes it with the error, then the hint", () => {
    render(
      <Field id="email" label="Email" hint="Formato nome@dominio" error="Email inválido">
        {(control) => <input {...control} />}
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    const errorId = screen.getByText("Email inválido").getAttribute("id");
    const hintId = screen.getByText("Formato nome@dominio").getAttribute("id");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(`${errorId} ${hintId}`);
  });

  test("announces the error politely and shows it with an icon, not by colour alone", () => {
    render(
      <Field id="email" label="Email" error="Email inválido">
        {(control) => <input {...control} />}
      </Field>,
    );

    const error = screen.getByText("Email inválido");

    expect(error.closest("[aria-live]")?.getAttribute("aria-live")).toBe("polite");
    expect(error.querySelector("svg.lucide-circle-alert")).not.toBeNull();
  });

  test("keeps the live region in place when there is no error, so a later error is announced", () => {
    const { container } = render(
      <Field id="email" label="Email">
        {(control) => <input {...control} />}
      </Field>,
    );

    expect(container.querySelector("[aria-live='polite']")).not.toBeNull();
  });

  test("has no describedby when there is neither hint nor error", () => {
    render(
      <Field id="email" label="Email">
        {(control) => <input {...control} />}
      </Field>,
    );

    expect(screen.getByLabelText("Email").hasAttribute("aria-describedby")).toBe(false);
  });

  test("marks a required field with a mark explained by the text from props", () => {
    render(
      <Field id="email" label="Email" required requiredLabel="obrigatório">
        {(control) => <input {...control} />}
      </Field>,
    );

    const mark = screen.getByTitle("obrigatório");

    expect(mark.getAttribute("aria-hidden")).toBe("true");
    // The mark is not part of the name: the native attribute tells assistive technology.
    expect(screen.getByRole("textbox", { name: "Email" }).hasAttribute("required")).toBe(true);
  });

  test("shows no mark when the field is optional", () => {
    render(
      <Field id="email" label="Email" requiredLabel="obrigatório">
        {(control) => <input {...control} />}
      </Field>,
    );

    expect(screen.queryByTitle("obrigatório")).toBeNull();
    expect(screen.getByLabelText("Email").hasAttribute("required")).toBe(false);
  });
});
