"use client";

// Source: 01-app/03-api-reference/03-file-conventions/error.md (bundled Next.js docs):
// an error boundary is a Client Component; `retry` re-fetches and re-renders
// the segment. It sits inside the layout of this group, so the shell stays.
import { useErrorMessages } from "@/components/site/error-messages";
import { ErrorView } from "@/components/site/error-view";

type ErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function MarketingError({ error, retry }: ErrorProps) {
  const messages = useErrorMessages();
  // Without the texts of the layout there is nothing to show: global-error takes it.
  if (!messages) throw error;

  return <ErrorView messages={messages} digest={error.digest} onRetry={retry} />;
}
