import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ErrorMessagesProvider, useErrorMessages } from "@/components/site/error-messages";

const messages = {
  title: "Ocorreu um erro",
  message: "Não foi possível mostrar esta página.",
  retry: "Tentar novamente",
  home: "Voltar ao início",
  reference: "Referência",
  homeHref: "/pt",
};

function Probe() {
  const value = useErrorMessages();
  return <p>{value ? `${value.title} ${value.homeHref}` : "none"}</p>;
}

describe("ErrorMessagesProvider", () => {
  test("gives the messages to the components below it", () => {
    render(
      <ErrorMessagesProvider messages={messages}>
        <Probe />
      </ErrorMessagesProvider>,
    );

    expect(screen.getByText("Ocorreu um erro /pt")).toBeTruthy();
  });

  test("gives nothing outside a provider", () => {
    render(<Probe />);

    expect(screen.getByText("none")).toBeTruthy();
  });
});
