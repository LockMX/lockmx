import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test } from "vitest";
import { Tooltip, type TooltipProps } from "@/components/ui/surfaces/tooltip";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

function renderTooltip(props: Partial<TooltipProps> = {}) {
  return render(
    <>
      <Tooltip content="Portes grátis acima de 50 €" {...props}>
        <button type="button">Portes</button>
      </Tooltip>
      <button type="button">Outro</button>
    </>,
  );
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: "Portes" });
}

function bubble(): HTMLElement {
  return screen.getByRole("tooltip", { hidden: true });
}

describe("Tooltip", () => {
  test("describes its trigger, shown or not", () => {
    renderTooltip();

    expect(bubble().textContent).toBe("Portes grátis acima de 50 €");
    expect(trigger().getAttribute("aria-describedby")).toBe(bubble().id);
    expect(bubble().hidden).toBe(true);
  });

  test("keeps a description the trigger already has", () => {
    render(
      <Tooltip content="Dica">
        <button type="button" aria-describedby="other">
          Portes
        </button>
      </Tooltip>,
    );

    expect(trigger().getAttribute("aria-describedby")).toBe(`other ${bubble().id}`);
  });

  test("shows on focus and hides on blur", async () => {
    renderTooltip();

    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());
    expect(bubble().hidden).toBe(false);

    await userEvent.tab();
    expect(bubble().hidden).toBe(true);
  });

  test("shows on hover and hides when the pointer leaves", async () => {
    renderTooltip();

    await userEvent.hover(trigger());
    expect(bubble().hidden).toBe(false);

    await userEvent.unhover(trigger());
    expect(bubble().hidden).toBe(true);
  });

  test("stays while the pointer is over the tooltip itself", async () => {
    renderTooltip();
    await userEvent.hover(trigger());

    await userEvent.hover(bubble());

    expect(bubble().hidden).toBe(false);
    expect(bubble().className).not.toContain("pointer-events-none");
  });

  test("stays for a focused trigger when the pointer comes and goes", async () => {
    renderTooltip();
    await userEvent.tab();

    await userEvent.hover(trigger());
    await userEvent.unhover(trigger());

    expect(bubble().hidden).toBe(false);
  });

  test("stays for a hovered trigger when the focus comes and goes", async () => {
    renderTooltip();
    await userEvent.hover(trigger());

    fireEvent.focus(trigger());
    fireEvent.blur(trigger());

    expect(bubble().hidden).toBe(false);
  });

  test("Escape dismisses it while the trigger keeps the focus", async () => {
    renderTooltip();
    await userEvent.tab();

    await userEvent.keyboard("{Escape}");

    expect(bubble().hidden).toBe(true);
    expect(document.activeElement).toBe(trigger());
  });

  test("Escape dismisses it when it was opened by hover, with the focus elsewhere", async () => {
    renderTooltip();
    screen.getByRole("button", { name: "Outro" }).focus();
    await userEvent.hover(trigger());

    fireEvent.keyDown(screen.getByRole("button", { name: "Outro" }), { key: "Escape" });

    expect(bubble().hidden).toBe(true);
  });

  test("shows again on the next focus after being dismissed", async () => {
    renderTooltip();
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");

    await userEvent.tab();
    await userEvent.tab({ shift: true });

    expect(bubble().hidden).toBe(false);
  });

  test("sits above the trigger by default, or below", () => {
    const { unmount } = renderTooltip();
    expect(bubble().className).toContain("bottom-full");
    unmount();

    renderTooltip({ placement: "bottom" });
    expect(bubble().className).toContain("top-full");
  });

  test("never takes the focus", () => {
    renderTooltip();

    expect(bubble().hasAttribute("tabindex")).toBe(false);
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = renderTooltip();

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("takes its text from a prop and does not accept `style`", () => {
    expectTypeOf<TooltipProps>().toHaveProperty("content").toEqualTypeOf<string>();
    expectTypeOf<TooltipProps>().not.toHaveProperty("style");
  });
});
