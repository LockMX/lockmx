import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Textarea } from "@/components/ui/forms/textarea";

describe("Textarea", () => {
  test("is a textarea found by its label, five rows tall by default", () => {
    render(<Textarea label="Mensagem" />);

    const textarea = screen.getByLabelText("Mensagem");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("rows")).toBe("5");
  });

  test("focuses the textarea when the label is clicked", async () => {
    render(<Textarea label="Mensagem" />);

    await userEvent.click(screen.getByText("Mensagem"));

    expect(document.activeElement).toBe(screen.getByLabelText("Mensagem"));
  });

  test("works uncontrolled", async () => {
    render(<Textarea label="Mensagem" defaultValue="Olá" />);
    const textarea = screen.getByLabelText<HTMLTextAreaElement>("Mensagem");

    await userEvent.type(textarea, " mundo");

    expect(textarea.value).toBe("Olá mundo");
  });

  test("wires hint and error to the textarea", () => {
    render(<Textarea label="Mensagem" hint="Até 500 caracteres" error="Escreve uma mensagem" />);

    const textarea = screen.getByLabelText("Mensagem");

    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      `${screen.getByText("Escreve uma mensagem").id} ${screen.getByText("Até 500 caracteres").id}`,
    );
  });

  test("is not editable when disabled", async () => {
    render(<Textarea label="Mensagem" disabled />);
    const textarea = screen.getByLabelText<HTMLTextAreaElement>("Mensagem");

    await userEvent.type(textarea, "Olá");

    expect(textarea.value).toBe("");
  });

  test("passes rows and native attributes through, with no inline style", () => {
    render(<Textarea label="Mensagem" rows={3} name="message" maxLength={500} />);

    const textarea = screen.getByLabelText("Mensagem");

    expect(textarea.getAttribute("rows")).toBe("3");
    expect(textarea.getAttribute("name")).toBe("message");
    expect(textarea.getAttribute("maxlength")).toBe("500");
    expect(textarea.getAttribute("style")).toBeNull();
  });
});
