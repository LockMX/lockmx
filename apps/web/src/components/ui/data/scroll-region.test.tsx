import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ScrollRegion } from "@/components/ui/data/scroll-region";

// jsdom lays nothing out: every width is 0 and there is no `ResizeObserver`.
// The widths are set by hand and the observer is a double that reports once
// when it starts observing, as a browser does, and again when told to.
let widths = { scroll: 0, client: 0 };
let notify: () => void = () => {};

class ResizeObserverDouble {
  constructor(private readonly callback: () => void) {
    notify = () => this.callback();
  }
  observe() {
    this.callback();
  }
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverDouble);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => widths.scroll);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => widths.client);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderRegion() {
  render(
    <>
      <h2 id="name">Encomendas</h2>
      <ScrollRegion labelledBy="name" data-testid="region">
        <p>Conteúdo</p>
      </ScrollRegion>
    </>,
  );
  return screen.getByTestId("region");
}

describe("ScrollRegion", () => {
  test("scrolls sideways and shows its content", () => {
    widths = { scroll: 300, client: 300 };
    const region = renderRegion();

    expect(region.className).toContain("overflow-x-auto");
    expect(region.textContent).toBe("Conteúdo");
  });

  test("is no tab stop and no region while its content fits", () => {
    widths = { scroll: 300, client: 300 };
    const region = renderRegion();

    expect(region.hasAttribute("tabindex")).toBe(false);
    expect(region.hasAttribute("role")).toBe(false);
    expect(region.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("is a named, focusable region when its content is wider than it", () => {
    widths = { scroll: 640, client: 300 };
    const region = renderRegion();

    expect(region.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("region", { name: "Encomendas" })).toBe(region);
  });

  test("follows a change of size", () => {
    widths = { scroll: 300, client: 300 };
    const region = renderRegion();

    widths = { scroll: 640, client: 300 };
    act(() => notify());
    expect(region.getAttribute("tabindex")).toBe("0");

    widths = { scroll: 300, client: 300 };
    act(() => notify());
    expect(region.hasAttribute("tabindex")).toBe(false);
  });

  test("measures once by itself, without waiting for the observer", () => {
    // A browser delivers the observer's first report with a frame, and a tab
    // that is not visible draws none.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    widths = { scroll: 640, client: 300 };
    const region = renderRegion();

    expect(region.getAttribute("tabindex")).toBe("0");
  });

  test("without a `ResizeObserver` it still measures once", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    widths = { scroll: 640, client: 300 };
    const region = renderRegion();

    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.textContent).toBe("Conteúdo");
  });
});
