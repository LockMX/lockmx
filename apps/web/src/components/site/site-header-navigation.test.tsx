import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SiteHeaderNavigation } from "@/components/site/site-header-navigation";

const navigation = vi.hoisted(() => ({ pathname: "/pt" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const props = {
  label: "Principal",
  menuLabel: "Menu",
  items: [
    { href: "/pt", label: "Início" },
    { href: "/pt/empresa", label: "Empresa" },
  ],
};

// jsdom has no `matchMedia` and no layout: a test sets whether the screen is
// wide and says the window was resized.
let isDesktop: boolean;

function resizeTo(desktop: boolean) {
  isDesktop = desktop;
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function menuButton() {
  return screen.getByRole("button", { name: "Menu" });
}

function list() {
  return screen.getByRole("list");
}

function isShownOnNarrowScreens() {
  return !list().classList.contains("hidden");
}

beforeEach(() => {
  navigation.pathname = "/pt";
  isDesktop = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: isDesktop })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SiteHeaderNavigation", () => {
  test("is one navigation landmark with the button and the links", () => {
    render(<SiteHeaderNavigation {...props} />);

    const landmark = screen.getByRole("navigation", { name: "Principal" });
    expect(within(landmark).getByRole("button", { name: "Menu" })).toBeTruthy();
    expect(within(landmark).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Início",
      "Empresa",
    ]);
  });

  test("marks only the link of the current page", () => {
    render(<SiteHeaderNavigation {...props} />);

    expect(screen.getByRole("link", { name: "Início" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Empresa" }).getAttribute("aria-current")).toBeNull();
  });

  test("starts closed, and the button names the list it controls", () => {
    render(<SiteHeaderNavigation {...props} />);

    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(menuButton().getAttribute("aria-controls")).toBe(list().id);
    expect(list().id).not.toBe("");
    expect(isShownOnNarrowScreens()).toBe(false);
  });

  test("the button is for narrow screens only, and the list always shows from md up", () => {
    render(<SiteHeaderNavigation {...props} />);

    expect(menuButton().classList.contains("md:hidden")).toBe(true);
    expect(list().classList.contains("md:flex")).toBe(true);
  });

  test("opens and closes with the button, keeping its name", async () => {
    render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    expect(menuButton().getAttribute("aria-expanded")).toBe("true");
    expect(isShownOnNarrowScreens()).toBe(true);

    await userEvent.click(menuButton());
    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(isShownOnNarrowScreens()).toBe(false);
  });

  test("closes on Escape and returns the focus to the button", async () => {
    render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    screen.getByRole("link", { name: "Empresa" }).focus();
    await userEvent.keyboard("{Escape}");

    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(isShownOnNarrowScreens()).toBe(false);
    expect(document.activeElement).toBe(menuButton());
  });

  test("Escape does not take the focus when the menu is closed", async () => {
    render(<SiteHeaderNavigation {...props} />);

    const link = screen.getByRole("link", { name: "Empresa" });
    link.focus();
    await userEvent.keyboard("{Escape}");

    expect(document.activeElement).toBe(link);
  });

  test("closes when a link is chosen and moves the focus off the hidden link", async () => {
    render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    await userEvent.click(screen.getByRole("link", { name: "Início" }));

    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(isShownOnNarrowScreens()).toBe(false);
    expect(document.activeElement).toBe(menuButton());
  });

  test("choosing a link with the menu closed leaves the focus alone", async () => {
    render(<SiteHeaderNavigation {...props} />);

    const link = screen.getByRole("link", { name: "Início" });
    await userEvent.click(link);

    expect(document.activeElement).toBe(link);
  });

  test("closes when the width passes the md breakpoint", async () => {
    render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    resizeTo(true);

    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(isShownOnNarrowScreens()).toBe(false);
  });

  test("stays open when the screen is resized and still narrow", async () => {
    render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    resizeTo(false);

    expect(menuButton().getAttribute("aria-expanded")).toBe("true");
  });

  test("closes when the page changes", async () => {
    const { rerender } = render(<SiteHeaderNavigation {...props} />);

    await userEvent.click(menuButton());
    navigation.pathname = "/en";
    rerender(<SiteHeaderNavigation {...props} />);

    expect(menuButton().getAttribute("aria-expanded")).toBe("false");
    expect(isShownOnNarrowScreens()).toBe(false);
  });

  test("stops listening to the width when it leaves the page", () => {
    const { unmount } = render(<SiteHeaderNavigation {...props} />);

    unmount();
    vi.mocked(window.matchMedia).mockClear();
    resizeTo(true);

    expect(window.matchMedia).not.toHaveBeenCalled();
  });
});
