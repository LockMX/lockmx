import { ComingSoon } from "@/components/coming-soon";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

// Placeholder: replaced by the real home page when its spec is built.
export default async function Home() {
  const { home } = await getMessages(await getCurrentLocale());

  return <ComingSoon logoAlt={home.logoAlt} message={home.comingSoon} />;
}
