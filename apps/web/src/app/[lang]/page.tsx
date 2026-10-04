import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

export default async function Home() {
  const locale = await getCurrentLocale();
  const { home, languageSwitcher } = await getMessages(locale);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">{home.heading}</h1>
      <p>{home.intro}</p>
      <LanguageSwitcher label={languageSwitcher.label} current={locale} />
    </main>
  );
}
