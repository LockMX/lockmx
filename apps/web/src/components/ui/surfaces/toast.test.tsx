import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { Toast, Toaster, type ToastProps } from "@/components/ui/surfaces/toast";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(Element.prototype, "animate");
});

// jsdom has no Web Animations API: the tests that look at the time bar
// install this double and read what the toast asked of it.
function installAnimate() {
  const cancel = vi.fn();
  const animate = vi.fn<(keyframes: unknown, options: unknown) => { cancel: () => void }>(
    () => ({ cancel }),
  );
  Element.prototype.animate = animate as unknown as Element["animate"];
  return { animate, cancel };
}

function timeBar(): Element | null {
  return document.querySelector("[data-toast-timer]");
}

describe("Toast", () => {
  test("is a status message with its title and message from props", () => {
    render(<Toast title="Adicionado ao carrinho" message="Pneu Enduro 120/90" />);

    expect(screen.getByRole("status").textContent).toBe(
      "Adicionado ao carrinhoPneu Enduro 120/90",
    );
  });

  test.each(["neutral", "success", "info"] as const)("the %s tone is a status", (tone) => {
    render(<Toast tone={tone} title="Mensagem" />);

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("the danger tone is an alert", () => {
    render(<Toast tone="danger" title="O pagamento falhou" />);

    expect(screen.getByRole("alert").textContent).toBe("O pagamento falhou");
  });

  test("each tone has its own icon, so the tone is not colour alone", () => {
    const icons = (["neutral", "success", "info", "danger"] as const).map((tone) => {
      const { container, unmount } = render(<Toast tone={tone} title="Mensagem" />);
      const icon = container.querySelector("svg")?.getAttribute("class") ?? "";
      unmount();
      return /lucide-[\w-]+/.exec(icon)?.[0];
    });

    expect(new Set(icons).size).toBe(4);
    expect(icons).not.toContain(undefined);
  });

  test("declares its inverse surface, for the focus ring of its controls", () => {
    render(<Toast title="Mensagem" />);

    expect(screen.getByRole("status").getAttribute("data-surface")).toBe("inverse");
  });

  test("has a close button named from props", async () => {
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("has no close button without `onClose`", () => {
    render(<Toast title="Mensagem" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  test("shows an action", () => {
    render(<Toast title="Removido" action={<button type="button">Anular</button>} />);

    expect(
      within(screen.getByRole("status")).getByRole("button", { name: "Anular" }),
    ).toBeDefined();
  });

  test("stays until closed when no duration is given", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} />);

    act(() => vi.advanceTimersByTime(60_000));

    expect(onClose).not.toHaveBeenCalled();
  });

  test("closes itself after `duration`", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} duration={8000} />);

    act(() => vi.advanceTimersByTime(7999));
    expect(onClose).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("never closes itself in less than five seconds", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} duration={500} />);

    act(() => vi.advanceTimersByTime(4999));
    expect(onClose).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("waits while the pointer is over it, then starts the time again", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} duration={5000} />);

    fireEvent.mouseEnter(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(20_000));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(5000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("waits while the focus is inside it", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={onClose} duration={5000} />);

    act(() => screen.getByRole("button", { name: "Fechar" }).focus());
    act(() => vi.advanceTimersByTime(20_000));
    expect(onClose).not.toHaveBeenCalled();

    act(() => screen.getByRole("button", { name: "Fechar" }).blur());
    act(() => vi.advanceTimersByTime(5000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("a toast that closes itself shows a bar filling over its time", () => {
    const { animate } = installAnimate();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={() => {}} duration={8000} />);

    expect(timeBar()?.closest("[aria-hidden]")?.getAttribute("aria-hidden")).toBe("true");
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(timeBar());
    expect(animate.mock.calls[0][0]).toEqual([{ scale: "0 1" }, { scale: "1 1" }]);
    expect(animate.mock.calls[0][1]).toEqual({ duration: 8000, fill: "forwards" });
  });

  test("the bar takes the time the toast really stays", () => {
    const { animate } = installAnimate();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={() => {}} duration={500} />);

    expect(animate.mock.calls[0][1]).toEqual({ duration: 5000, fill: "forwards" });
  });

  test("the bar empties while the toast waits and fills again after", () => {
    const { animate, cancel } = installAnimate();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={() => {}} duration={5000} />);

    fireEvent.mouseEnter(screen.getByRole("status"));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(screen.getByRole("status"));
    expect(animate).toHaveBeenCalledTimes(2);
  });

  test("a toast that stays has no bar", () => {
    const { animate } = installAnimate();
    render(<Toast title="Mensagem" closeLabel="Fechar" onClose={() => {}} />);

    expect(timeBar()).toBeNull();
    expect(animate).not.toHaveBeenCalled();
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <Toaster label="Notificações">
        <Toast title="Mensagem" message="Texto" closeLabel="Fechar" onClose={() => {}} />
        <Toast title="Com tempo" closeLabel="Fechar" onClose={() => {}} duration={6000} />
      </Toaster>,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("a toast with an action cannot have a duration, and a close button needs a name", () => {
    expectTypeOf<ToastProps>().not.toHaveProperty("style");
    // @ts-expect-error the user needs time to reach the action
    void (<Toast title="x" action={<button type="button">y</button>} duration={6000} />);
    // @ts-expect-error a close button needs its name
    void (<Toast title="x" onClose={() => {}} />);
  });
});

describe("Toaster", () => {
  test("is a named live region that exists before any toast", () => {
    render(<Toaster label="Notificações" />);
    const region = screen.getByRole("region", { name: "Notificações" });

    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.childElementCount).toBe(0);
  });

  test("lets clicks through to the page around its toasts", () => {
    render(
      <Toaster label="Notificações">
        <Toast title="Primeira" />
      </Toaster>,
    );

    expect(screen.getByRole("region").className).toContain("pointer-events-none");
    expect(screen.getByRole("status").className).toContain("pointer-events-auto");
  });

  test("holds the toasts it is given", () => {
    render(
      <Toaster label="Notificações">
        <Toast title="Primeira" />
        <Toast tone="danger" title="Segunda" />
      </Toaster>,
    );
    const region = screen.getByRole("region", { name: "Notificações" });

    expect(within(region).getByRole("status").textContent).toBe("Primeira");
    expect(within(region).getByRole("alert").textContent).toBe("Segunda");
  });
});
