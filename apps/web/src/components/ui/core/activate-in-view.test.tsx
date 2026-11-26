import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ActivateInView } from "@/components/ui";

// jsdom has neither `IntersectionObserver` nor `matchMedia`. The double keeps
// the callback of the last observer, so a test can report a visible ratio.
type Report = (ratio: number) => void;
let report: Report | undefined;
let observed: Element[] = [];
const disconnect = vi.fn();

class IntersectionObserverDouble {
  constructor(callback: IntersectionObserverCallback) {
    report = (ratio) =>
      act(() =>
        callback(
          observed.map(
            (target) =>
              ({ target, intersectionRatio: ratio, isIntersecting: ratio > 0 }) as IntersectionObserverEntry,
          ),
          this as unknown as IntersectionObserver,
        ),
      );
  }
  observe(target: Element) {
    observed.push(target);
  }
  disconnect() {
    disconnect();
  }
}

function setHover(canHover: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(hover: none)" ? !canHover : false,
    media: query,
  }));
}

function renderCard() {
  render(
    <ActivateInView className="grid">
      <button type="button">Suportes LockMX</button>
    </ActivateInView>,
  );
  return screen.getByRole("button").parentElement!;
}

beforeEach(() => {
  report = undefined;
  observed = [];
  disconnect.mockClear();
  vi.stubGlobal("IntersectionObserver", IntersectionObserverDouble);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ActivateInView", () => {
  test("renders its children in one element with the class from props, inactive at first", () => {
    setHover(false);
    const element = renderCard();

    expect(element.className).toBe("grid");
    expect(element.hasAttribute("data-active")).toBe(false);
  });

  test("on a device without hover, is active while most of it is in view, each time", () => {
    setHover(false);
    const element = renderCard();

    expect(observed).toEqual([element]);
    report?.(0.8);
    expect(element.hasAttribute("data-active")).toBe(true);
    report?.(0.2);
    expect(element.hasAttribute("data-active")).toBe(false);
    report?.(1);
    expect(element.hasAttribute("data-active")).toBe(true);
  });

  test("on a device with hover, observes nothing and is never active", () => {
    setHover(true);
    const element = renderCard();

    expect(observed).toEqual([]);
    expect(element.hasAttribute("data-active")).toBe(false);
  });

  test("stops observing when it leaves the page", () => {
    setHover(false);
    const { unmount } = render(
      <ActivateInView>
        <span>card</span>
      </ActivateInView>,
    );

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
