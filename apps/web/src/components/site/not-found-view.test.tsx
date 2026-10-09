import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { NotFoundView } from "@/components/site/not-found-view";

describe("NotFoundView", () => {
  test("shows the title as the page heading, the message and a link home, from props", () => {
    render(
      <NotFoundView
        title="Página não encontrada"
        message="O endereço não existe."
        homeLabel="Voltar ao início"
        homeHref="/pt"
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeTruthy();
    expect(screen.getByText("O endereço não existe.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/pt");
  });
});
