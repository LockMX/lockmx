import { PageMessage } from "@/components/site/page-message";
import { ButtonLink } from "@/components/ui";

type PendingPageViewProps = {
  /** The name of the page, shown as its heading. */
  title: string;
  message: string;
  homeLabel: string;
  homeHref: string;
};

/** A page whose content is not written yet: it only says so. */
export function PendingPageView({ title, message, homeLabel, homeHref }: PendingPageViewProps) {
  return (
    <PageMessage title={title} message={message}>
      <ButtonLink href={homeHref}>{homeLabel}</ButtonLink>
    </PageMessage>
  );
}
