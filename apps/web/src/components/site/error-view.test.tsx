import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { ErrorView } from "@/components/site/error-view";

const messages = {
  title: "Ocorreu um erro",
  message: "Não foi possível mostrar esta página.",
  retry: "Tentar novamente",
  home: "Voltar ao início",
  reference: "Referência",
  homeHref: "/pt",
};

describe("ErrorView", () => {
  test("shows the title as the page heading and the message, from props", () => {
    render(<ErrorView messages={messages} onRetry={() => {}} />);

    expect(screen.getByRole("heading", { level: 1, name: "Ocorreu um erro" })).toBeTruthy();
    expect(screen.getByText("Não foi possível mostrar esta página.")).toBeTruthy();
  });

  test("calls the retry function when the retry button is pressed", async () => {
    const onRetry = vi.fn();
    render(<ErrorView messages={messages} onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("links to the home of the locale", () => {
    render(<ErrorView messages={messages} onRetry={() => {}} />);

    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/pt");
  });

  test("shows the digest as a reference when there is one", () => {
    render(<ErrorView messages={messages} digest="abc123" onRetry={() => {}} />);

    expect(screen.getByText(/Referência/).textContent).toContain("abc123");
  });

  test("shows no reference line without a digest", () => {
    render(<ErrorView messages={messages} onRetry={() => {}} />);

    expect(screen.queryByText(/Referência/)).toBeNull();
  });
});
