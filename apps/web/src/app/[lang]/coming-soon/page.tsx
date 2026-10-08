import { ComingSoon } from "@/components/coming-soon";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

// Shown at every address while COMING_SOON is "true" (see proxy.ts). Removed at launch.
export default async function ComingSoonPage() {
  const { comingSoon } = await getMessages(await getCurrentLocale());

  return <ComingSoon logoAlt={comingSoon.logoAlt} message={comingSoon.message} />;
}
