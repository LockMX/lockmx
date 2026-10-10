import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SectionFocus } from "@/components/site/section-focus";

const navigation = vi.hoisted(() => ({ pathname: "/pt" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

// The links do not navigate here: jsdom has no navigation.
function Page({ listening }: { listening: boolean }) {
  return (
    <>
      {listening && <SectionFocus />}
      <a href="#system" onClick={(event) => event.preventDefault()}>
        <span>Sistema</span>
      </a>
      <a href="https://example.com/#system" onClick={(event) => event.preventDefault()}>
        Outra
      </a>
      <section id="system" aria-label="Sistema" tabIndex={-1} />
    </>
  );
}

function section() {
  return screen.getByRole("region", { name: "Sistema" });
}

describe("SectionFocus", () => {
  beforeEach(() => {
    navigation.pathname = "/pt";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  test("moves the focus to the section a link of the page leads to", async () => {
    render(<Page listening />);

    await userEvent.click(screen.getByText("Sistema"));

    expect(document.activeElement).toBe(section());
  });

  test("leaves the focus alone for a link to another page", async () => {
    render(<Page listening />);

    await userEvent.click(screen.getByText("Outra"));

    expect(document.activeElement).not.toBe(section());
  });

  test("leaves the focus alone when the link opens elsewhere", async () => {
    render(<Page listening />);
    const user = userEvent.setup();

    await user.keyboard("{Control>}");
    await user.click(screen.getByText("Sistema"));
    await user.keyboard("{/Control}");

    expect(document.activeElement).not.toBe(section());
  });

  test("moves the focus to the section the page opens with", () => {
    window.location.hash = "#system";
    render(<Page listening />);

    expect(document.activeElement).toBe(section());
  });

  test("moves the focus to the section when the page was reached from another one", () => {
    const { rerender } = render(<Page listening />);
    expect(document.activeElement).not.toBe(section());

    window.location.hash = "#system";
    navigation.pathname = "/en";
    rerender(<Page listening />);

    expect(document.activeElement).toBe(section());
  });

  test("follows a fragment reached without a click", () => {
    render(<Page listening />);

    window.location.hash = "#system";
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(document.activeElement).toBe(section());
  });

  test("stops listening when it leaves the page", async () => {
    const { rerender } = render(<Page listening />);
    rerender(<Page listening={false} />);

    await userEvent.click(screen.getByText("Sistema"));

    expect(document.activeElement).not.toBe(section());
  });
});
