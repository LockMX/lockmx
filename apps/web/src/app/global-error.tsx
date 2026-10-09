"use client";

// Source: 01-app/03-api-reference/03-file-conventions/error.md, "Global Error"
// (bundled Next.js docs): replaces the root layout when it fails, so it brings
// its own <html> and <body>, gets no global stylesheet and cannot export
// metadata. It is plain HTML on purpose: readable with the browser defaults.
import { usePathname } from "next/navigation";
import { pickGlobalErrorMessages } from "@/lib/i18n/global-error-messages";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ retry }: GlobalErrorProps) {
  const messages = pickGlobalErrorMessages(usePathname());

  return (
    <html lang={messages.lang}>
      <body>
        <title>{messages.title}</title>
        <main>
          <h1>{messages.title}</h1>
          <p>{messages.message}</p>
          <p>
            <button type="button" onClick={() => retry()}>
              {messages.retry}
            </button>
          </p>
          <p>
            {/* A full page load: the application that failed is not reused. */}
            <a href={messages.homeHref}>{messages.home}</a>
          </p>
        </main>
      </body>
    </html>
  );
}
