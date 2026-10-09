"use client";

import { createContext, useContext } from "react";

export type ErrorMessages = {
  title: string;
  message: string;
  retry: string;
  home: string;
  /** Label of the error reference shown when the error has a digest. */
  reference: string;
  homeHref: string;
};

const ErrorMessagesContext = createContext<ErrorMessages | null>(null);

type ErrorMessagesProviderProps = {
  messages: ErrorMessages;
  children: React.ReactNode;
};

/**
 * An error boundary is a Client Component and cannot read the dictionaries.
 * The layout above it passes the few strings it needs through this provider.
 */
export function ErrorMessagesProvider({ messages, children }: ErrorMessagesProviderProps) {
  return <ErrorMessagesContext value={messages}>{children}</ErrorMessagesContext>;
}

export function useErrorMessages(): ErrorMessages | null {
  return useContext(ErrorMessagesContext);
}
