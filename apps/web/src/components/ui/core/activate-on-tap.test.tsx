import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ActivateOnTap } from "@/components/ui";

// jsdom has no `matchMedia`: the double answers the two queries the component asks.
function setDevice({ canHover = false, reducedMotion = false } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (query === "(hover: none)" && !canHover) ||
      (query === "(prefers-reduced-motion: reduce)" && reducedMotion),
    media: query,
  }));
}

// Stands for the navigation of the link: jsdom does not navigate.
const follow = vi.fn((event: React.MouseEvent) => event.preventDefault());

function renderCard() {
  const { unmount } = render(
    <ActivateOnTap className="grid">
      <a href="#racks" onClick={follow}>
        Suportes LockMX
      </a>
    </ActivateOnTap>,
  );
  const link = screen.getByRole("link");
  return { link, element: link.parentElement!, unmount };
}

beforeEach(() => {
  vi.useFakeTimers();
  follow.mockClear();
  document.documentElement.style.setProperty("--duration-lock", "360ms");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--duration-lock");
});

describe("ActivateOnTap", () => {
  test("renders its children in one element with the class from props, inactive at first", () => {
    setDevice();
    const { element } = renderCard();

    expect(element.className).toBe("grid");
    expect(element.hasAttribute("data-active")).toBe(false);
  });

  test("on a device without hover, a tap marks it active and follows the link once the effect has played", () => {
    setDevice();
    const { link, element } = renderCard();

    const notPrevented = fireEvent.click(link);

    expect(notPrevented).toBe(false);
    expect(element.hasAttribute("data-active")).toBe(true);
    expect(follow).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(359));
    expect(follow).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(follow).toHaveBeenCalledOnce();
  });

  test("follows the link once when it is tapped again while the effect plays", () => {
    setDevice();
    const { link } = renderCard();

    fireEvent.click(link);
    fireEvent.click(link);
    act(() => vi.advanceTimersByTime(360));

    expect(follow).toHaveBeenCalledOnce();
  });

  test("follows the link again on a later tap, if the page is still there", () => {
    setDevice();
    const { link } = renderCard();

    fireEvent.click(link);
    act(() => vi.advanceTimersByTime(360));
    fireEvent.click(link);
    act(() => vi.advanceTimersByTime(360));

    expect(follow).toHaveBeenCalledTimes(2);
  });

  test.each([
    ["on a device with hover", { canHover: true }],
    ["under reduced motion", { reducedMotion: true }],
  ])("%s, follows the link at once", (_, device) => {
    setDevice(device);
    const { link, element } = renderCard();

    fireEvent.click(link);

    expect(follow).toHaveBeenCalledOnce();
    expect(element.hasAttribute("data-active")).toBe(false);
  });

  test("lets a click with a modifier key through, so the link opens in a new tab at once", () => {
    setDevice();
    const { link, element } = renderCard();

    fireEvent.click(link, { ctrlKey: true });

    expect(follow).toHaveBeenCalledOnce();
    expect(element.hasAttribute("data-active")).toBe(false);
  });

  test("does not follow the link after it has left the page", () => {
    setDevice();
    const { link, unmount } = renderCard();

    fireEvent.click(link);
    unmount();
    act(() => vi.advanceTimersByTime(360));

    expect(follow).not.toHaveBeenCalled();
  });
});
