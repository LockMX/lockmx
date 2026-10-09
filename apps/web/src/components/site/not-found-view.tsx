import { PageMessage } from "@/components/site/page-message";
import { ButtonLink } from "@/components/ui";

type NotFoundViewProps = {
  title: string;
  message: string;
  homeLabel: string;
  homeHref: string;
};

export function NotFoundView({ title, message, homeLabel, homeHref }: NotFoundViewProps) {
  return (
    <PageMessage title={title} message={message}>
      <ButtonLink href={homeHref}>{homeLabel}</ButtonLink>
    </PageMessage>
  );
}
