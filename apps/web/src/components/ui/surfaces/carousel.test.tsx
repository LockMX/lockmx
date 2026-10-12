import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Carousel, type CarouselProps } from "@/components/ui/surfaces/carousel";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;
const INTERVAL = 6000;
const VIEWPORT_WIDTH = 1000;

const LABELS: CarouselProps["labels"] = {
  roleDescription: "carrossel",
  slideRoleDescription: "diapositivo",
  slide: "{index} de {total}",
  pause: "Pausar rotação",
  play: "Retomar rotação",
  previous: "Anterior",
  next: "Seguinte",
};

// jsdom lays nothing out, so the tests say how many slides fit side by side.
let perView = 1;
let reducedMotion = false;

function isViewport(element: Element): boolean {
  return element.hasAttribute("aria-live");
}

function slideWidth(): number {
  return VIEWPORT_WIDTH / perView;
}

function define(name: string, get: (this: HTMLElement) => number) {
  Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get });
}

beforeEach(() => {
  perView = 1;
  reducedMotion = false;
  vi.useFakeTimers();
  define("clientWidth", function () {
    return isViewport(this) ? VIEWPORT_WIDTH : 0;
  });
  define("scrollWidth", function () {
    return isViewport(this) ? this.children.length * slideWidth() : 0;
  });
  define("offsetWidth", function () {
    return this.parentElement && isViewport(this.parentElement) ? slideWidth() : 0;
  });
  define("offsetLeft", function () {
    const parent = this.parentElement;
    if (!parent || !isViewport(parent)) return 0;
    return Array.from(parent.children).indexOf(this) * slideWidth();
  });
  // The browser scrolls, clamps to the end and reports it.
  Element.prototype.scrollTo = function (this: Element, options?: ScrollToOptions | number) {
    const left = typeof options === "object" ? (options.left ?? 0) : 0;
    this.scrollLeft = Math.max(0, Math.min(left, this.scrollWidth - this.clientWidth));
    fireEvent.scroll(this);
  } as Element["scrollTo"];
  vi.stubGlobal(
    "matchMedia",
    (query: string): Partial<MediaQueryList> => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  for (const name of ["clientWidth", "scrollWidth", "offsetWidth", "offsetLeft"]) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
  delete (Element.prototype as unknown as Record<string, unknown>).scrollTo;
});

function renderCarousel(count = 3, props: Partial<CarouselProps> = {}) {
  return render(
    <Carousel label="Produtos em destaque" labels={LABELS} emptyMessage="Sem produtos" {...props}>
      {Array.from({ length: count }, (_, index) => (
        <a key={index} href={`https://example.com/${index + 1}`}>
          Produto {index + 1}
        </a>
      ))}
    </Carousel>,
  );
}

function carousel(): HTMLElement {
  return screen.getByRole("region", { name: "Produtos em destaque" });
}

function slides(): HTMLElement[] {
  return within(carousel()).getAllByRole("group", { hidden: true });
}

function viewport(): HTMLElement {
  return slides()[0].parentElement as HTMLElement;
}

function shown(): string[] {
  return slides()
    .filter((slide) => !slide.hasAttribute("inert"))
    .map((slide) => slide.textContent ?? "");
}

function button(name: string): HTMLElement {
  return within(carousel()).getByRole("button", { name });
}

// Focus that arrives with the keyboard: the browser tells it from a click.
function tabTo(element: HTMLElement) {
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab" });
  act(() => element.focus());
}

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("Carousel", () => {
  test("is a named region described as a carousel, with one described group per slide", () => {
    renderCarousel();

    expect(carousel().getAttribute("aria-roledescription")).toBe("carrossel");
    expect(slides()).toHaveLength(3);
    expect(slides().map((slide) => slide.getAttribute("aria-label"))).toEqual([
      "1 de 3",
      "2 de 3",
      "3 de 3",
    ]);
    for (const slide of slides()) {
      expect(slide.getAttribute("aria-roledescription")).toBe("diapositivo");
    }
  });

  test("shows the heading it is given", () => {
    renderCarousel(3, { heading: <h2>Destaques</h2> });

    expect(within(carousel()).getByRole("heading", { level: 2, name: "Destaques" })).not.toBeNull();
  });

  test("the rotation control comes first, before the slides", () => {
    renderCarousel();
    const [first] = within(carousel()).getAllByRole("button");

    expect(first.getAttribute("aria-label")).toBe("Pausar rotação");
    expect(
      first.compareDocumentPosition(viewport()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("only the slides in view can be reached", () => {
    renderCarousel();

    expect(shown()).toEqual(["Produto 1"]);
    expect(slides()[1].getAttribute("aria-hidden")).toBe("true");
    expect(slides()[0].hasAttribute("aria-hidden")).toBe(false);
  });

  test("advances by itself after the interval and goes back to the start after the end", () => {
    renderCarousel();

    wait(INTERVAL - 1);
    expect(shown()).toEqual(["Produto 1"]);
    wait(1);
    expect(shown()).toEqual(["Produto 2"]);
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 3"]);
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 1"]);
  });

  test("takes its interval from a prop", () => {
    renderCarousel(3, { interval: 2000 });

    wait(2000);
    expect(shown()).toEqual(["Produto 2"]);
  });

  test("the rotation control pauses and resumes, and its name says what it does", () => {
    renderCarousel();

    fireEvent.click(button("Pausar rotação"));
    wait(INTERVAL * 2);
    expect(shown()).toEqual(["Produto 1"]);

    fireEvent.click(button("Retomar rotação"));
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 2"]);
    expect(button("Pausar rotação")).not.toBeNull();
  });

  test("slide changes are announced only while it is not rotating", () => {
    renderCarousel();

    expect(viewport().getAttribute("aria-live")).toBe("off");
    fireEvent.click(button("Pausar rotação"));
    expect(viewport().getAttribute("aria-live")).toBe("polite");
  });

  test("previous and next move one page and wrap at the ends", () => {
    renderCarousel();

    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 2"]);
    fireEvent.click(button("Anterior"));
    expect(shown()).toEqual(["Produto 1"]);
    fireEvent.click(button("Anterior"));
    expect(shown()).toEqual(["Produto 3"]);
    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 1"]);
  });

  test("a move by hand restarts the wait", () => {
    renderCarousel();

    wait(INTERVAL - 1000);
    fireEvent.click(button("Seguinte"));
    wait(INTERVAL - 1);
    expect(shown()).toEqual(["Produto 2"]);
    wait(1);
    expect(shown()).toEqual(["Produto 3"]);
  });

  test("follows a scroll made by hand", () => {
    renderCarousel();

    viewport().scrollLeft = 2 * VIEWPORT_WIDTH;
    fireEvent.scroll(viewport());

    expect(shown()).toEqual(["Produto 3"]);
    expect(within(carousel()).getByText("3 / 3")).not.toBeNull();
  });

  test("holds while the pointer is over the slides and goes on when it leaves", () => {
    renderCarousel();

    fireEvent.pointerEnter(viewport());
    wait(INTERVAL * 2);
    expect(shown()).toEqual(["Produto 1"]);

    fireEvent.pointerLeave(viewport());
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 2"]);
  });

  test("stops when the keyboard focus comes in and stays stopped after it leaves", () => {
    renderCarousel();

    tabTo(within(slides()[0]).getByRole("link"));
    expect(button("Retomar rotação")).not.toBeNull();
    act(() => (document.activeElement as HTMLElement).blur());
    wait(INTERVAL * 2);
    expect(shown()).toEqual(["Produto 1"]);

    fireEvent.click(button("Retomar rotação"));
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 2"]);
  });

  test("a click on a slide does not stop it", () => {
    renderCarousel();
    const link = within(slides()[0]).getByRole("link");

    fireEvent.mouseDown(link);
    act(() => link.focus());

    expect(button("Pausar rotação")).not.toBeNull();
  });

  test("moving the focus inside does not stop a rotation the visitor resumed", () => {
    renderCarousel();

    tabTo(button("Pausar rotação"));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Retomar rotação");
    fireEvent.click(button("Retomar rotação"));
    tabTo(button("Seguinte"));

    expect(button("Pausar rotação")).not.toBeNull();
  });

  test("with reduced motion it starts paused and never moves by itself", () => {
    reducedMotion = true;
    renderCarousel();

    expect(button("Retomar rotação")).not.toBeNull();
    wait(INTERVAL * 3);
    expect(shown()).toEqual(["Produto 1"]);
  });

  test("with reduced motion the visitor can still move it and start it", () => {
    reducedMotion = true;
    renderCarousel();

    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 2"]);
    fireEvent.click(button("Retomar rotação"));
    wait(INTERVAL);
    expect(shown()).toEqual(["Produto 3"]);
  });

  test("moves a page of slides at a time when several fit", () => {
    perView = 2;
    renderCarousel(6);

    expect(shown()).toEqual(["Produto 1", "Produto 2"]);
    expect(within(carousel()).getByText("1 / 3")).not.toBeNull();
    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 3", "Produto 4"]);
    expect(within(carousel()).getByText("2 / 3")).not.toBeNull();
  });

  test("the last page is full when the slides do not divide evenly", () => {
    perView = 4;
    renderCarousel(6);

    expect(within(carousel()).getByText("1 / 2")).not.toBeNull();
    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 3", "Produto 4", "Produto 5", "Produto 6"]);
    expect(within(carousel()).getByText("2 / 2")).not.toBeNull();
    fireEvent.click(button("Seguinte"));
    expect(shown()).toEqual(["Produto 1", "Produto 2", "Produto 3", "Produto 4"]);
  });

  test("the position is not read twice: the slides already say it", () => {
    renderCarousel();

    expect(within(carousel()).getByText("1 / 3").closest("[aria-hidden='true']")).not.toBeNull();
  });

  test("has no controls and does not rotate when every slide fits", () => {
    perView = 4;
    renderCarousel(3);

    expect(within(carousel()).queryByRole("button")).toBeNull();
    expect(shown()).toHaveLength(3);
    wait(INTERVAL * 2);
    expect(viewport().scrollLeft).toBe(0);
  });

  test("shows the empty message when it has no slides", () => {
    renderCarousel(0);

    expect(within(carousel()).getByText("Sem produtos")).not.toBeNull();
    expect(within(carousel()).queryByRole("button")).toBeNull();
    expect(within(carousel()).queryByRole("group")).toBeNull();
  });

  test("uses no raw colour or pixel value", () => {
    const { container } = renderCarousel();

    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
    expect(container.querySelector("[style]")).toBeNull();
  });
});
