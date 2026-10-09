import { NotFoundView } from "@/components/site/not-found-view";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

export default async function NotFound() {
  const locale = await getCurrentLocale();
  const { notFound } = await getMessages(locale);

  return (
    <NotFoundView
      title={notFound.title}
      message={notFound.message}
      homeLabel={notFound.home}
      homeHref={`/${locale}`}
    />
  );
}
