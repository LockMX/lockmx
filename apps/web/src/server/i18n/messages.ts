import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/server/i18n/messages/pt";

const dictionaries: Record<Locale, () => Promise<Messages>> = {
  pt: () => import("@/server/i18n/messages/pt").then((module) => module.pt),
  en: () => import("@/server/i18n/messages/en").then((module) => module.en),
};

export async function getMessages(locale: Locale): Promise<Messages> {
  return dictionaries[locale]();
}
