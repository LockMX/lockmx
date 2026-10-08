import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode, useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Dialog, type DialogProps } from "@/components/ui/surfaces/dialog";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const TEXT = { title: "Remover do carrinho", closeLabel: "Fechar" };

function dialog(): HTMLDialogElement {
  return document.querySelector("dialog") as HTMLDialogElement;
}

function renderDialog(props: Partial<DialogProps> = {}) {
  return render(
    <Dialog {...TEXT} open onClose={() => {}} {...props}>
      <p>Tem a certeza?</p>
    </Dialog>,
  );
}

/** A page with a button that opens the dialog, as a real caller has. */
function Page({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Dialog
        {...TEXT}
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
      >
        <button type="button">Confirmar</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  test("is a native dialog, closed until `open`", () => {
    renderDialog({ open: false });

    expect(dialog().tagName).toBe("DIALOG");
    expect(dialog().open).toBe(false);
    expect(dialog().textContent).toBe("");
  });

  test("opens as a modal with its content", () => {
    renderDialog();

    expect(dialog().open).toBe(true);
    expect(screen.getByText("Tem a certeza?")).toBeDefined();
  });

  test("opens and closes with the prop", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog {...TEXT} open={false} onClose={onClose}>
        <p>Texto</p>
      </Dialog>,
    );

    rerender(
      <Dialog {...TEXT} open onClose={onClose}>
        <p>Texto</p>
      </Dialog>,
    );
    expect(dialog().open).toBe(true);

    rerender(
      <Dialog {...TEXT} open={false} onClose={onClose}>
        <p>Texto</p>
      </Dialog>,
    );
    expect(dialog().open).toBe(false);
  });

  test("is named by its title, a level 2 heading", () => {
    renderDialog();
    const heading = screen.getByRole("heading", { level: 2, name: "Remover do carrinho" });

    expect(dialog().getAttribute("aria-labelledby")).toBe(heading.id);
  });

  test("is described by its description, when it has one", () => {
    const { unmount } = renderDialog();
    expect(dialog().hasAttribute("aria-describedby")).toBe(false);
    unmount();

    renderDialog({ description: "O artigo sai do carrinho." });
    const description = screen.getByText("O artigo sai do carrinho.");
    expect(dialog().getAttribute("aria-describedby")).toBe(description.id);
  });

  test("sets no role, tabindex or aria-modal of its own: the element has them", () => {
    renderDialog();

    expect(dialog().hasAttribute("role")).toBe(false);
    expect(dialog().hasAttribute("tabindex")).toBe(false);
    expect(dialog().hasAttribute("aria-modal")).toBe(false);
  });

  test("the close button, named from props, asks to close", async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Escape asks to close, and the element waits for the answer", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    // What the browser fires on Escape, before it would close the dialog.
    const cancel = new Event("cancel", { cancelable: true });

    fireEvent(dialog(), cancel);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog().open).toBe(true);
  });

  test("a cancel that comes from inside, as a file field fires, does not close", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    fireEvent(
      screen.getByText("Tem a certeza?"),
      new Event("cancel", { bubbles: true, cancelable: true }),
    );

    expect(onClose).not.toHaveBeenCalled();
  });

  test("asks to close when the browser closes it by itself, as a dialog form does", async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    dialog().close();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test("does not ask to close when the parent closed it", async () => {
    const onClose = vi.fn();
    render(<Page onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(dialog().open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("a press and click on the backdrop asks to close", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    // A click on the backdrop reaches the dialog element itself.
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("a click inside does not close", async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    await userEvent.click(screen.getByText("Tem a certeza?"));

    expect(onClose).not.toHaveBeenCalled();
  });

  test("a selection dragged from inside to the backdrop does not close", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    fireEvent.pointerDown(screen.getByText("Tem a certeza?"));
    fireEvent.click(dialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  test("gives the focus back to what opened it", async () => {
    render(<Page />);
    const opener = screen.getByRole("button", { name: "Abrir" });
    await userEvent.click(opener);
    screen.getByRole("button", { name: "Confirmar" }).focus();

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  test("stays open through the double effects of Strict Mode", async () => {
    const onClose = vi.fn();
    render(
      <StrictMode>
        <Dialog {...TEXT} open onClose={onClose}>
          <p>Texto</p>
        </Dialog>
      </StrictMode>,
    );
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(dialog().open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("shows a footer when given one", () => {
    renderDialog({ footer: <button type="button">Remover</button> });

    expect(screen.getByRole("button", { name: "Remover" })).toBeDefined();
  });

  test.each([
    [undefined, "w-120"],
    ["sm", "w-100"],
    ["md", "w-120"],
    ["lg", "w-160"],
  ] as const)("with size %s is %s wide", (size, expected) => {
    renderDialog({ size });

    expect(dialog().className.split(" ")).toContain(expected);
  });

  test("draws its backdrop from the token", () => {
    renderDialog();

    expect(dialog().className).toContain("backdrop:bg-surface-backdrop");
  });

  test("takes its text from props only", () => {
    render(
      <Dialog title="Remove" closeLabel="Close" description="Gone for good." open onClose={() => {}}>
        <p>Sure?</p>
      </Dialog>,
    );

    expect(dialog().textContent).toBe("RemoveGone for good.Sure?");
    expect(screen.getByRole("button", { name: "Close" })).toBeDefined();
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = renderDialog({ description: "Texto", footer: <span>Rodapé</span> });

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("requires its text and its close handler, and does not accept `style`", () => {
    expectTypeOf<DialogProps>().toHaveProperty("title").toEqualTypeOf<string>();
    expectTypeOf<DialogProps>().toHaveProperty("closeLabel").toEqualTypeOf<string>();
    expectTypeOf<DialogProps>().toHaveProperty("onClose").toEqualTypeOf<() => void>();
    expectTypeOf<DialogProps>().not.toHaveProperty("style");
  });
});
