import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

// A stub until the home page spec is built: the public site shows the
// placeholder instead while COMING_SOON is set (see proxy.ts).
export default async function Home() {
  const locale = await getCurrentLocale();
  const { metadata, languageSwitcher } = await getMessages(locale);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-gutter py-12 text-center">
      <h1 className="text-heading-lg font-semibold">{metadata.title}</h1>
      <LanguageSwitcher label={languageSwitcher.label} current={locale} />
    </main>
  );
}
