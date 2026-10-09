import type { ErrorMessages } from "@/components/site/error-messages";
import { PageMessage } from "@/components/site/page-message";
import { Button, ButtonLink } from "@/components/ui";

type ErrorViewProps = {
  messages: ErrorMessages;
  /** Identifier of the error in the server logs. Never the error message itself. */
  digest?: string;
  onRetry: () => void;
};

/** What a visitor sees when a page fails to render. Shows no technical detail. */
export function ErrorView({ messages, digest, onRetry }: ErrorViewProps) {
  return (
    <PageMessage title={messages.title} message={messages.message}>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onRetry}>{messages.retry}</Button>
        <ButtonLink href={messages.homeHref} variant="outline">
          {messages.home}
        </ButtonLink>
      </div>
      {digest && (
        <p className="text-xs leading-tight text-text-muted">
          {messages.reference} <code>{digest}</code>
        </p>
      )}
    </PageMessage>
  );
}
