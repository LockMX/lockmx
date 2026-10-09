import { defaultLocale, htmlLang, isLocale, type Locale } from "@/lib/i18n/config";

type GlobalErrorMessages = {
  title: string;
  message: string;
  retry: string;
  home: string;
};

// The texts of `app/global-error.tsx`. It replaces the root layout when that
// layout fails, so it cannot receive the dictionaries from the server.
export const globalErrorMessages: Record<Locale, GlobalErrorMessages> = {
  pt: {
    title: "Ocorreu um erro",
    message: "Não foi possível mostrar esta página.",
    retry: "Tentar novamente",
    home: "Voltar ao início",
  },
  en: {
    title: "Something went wrong",
    message: "This page could not be shown.",
    retry: "Try again",
    home: "Back to home",
  },
};

// Picks the texts from the locale segment of the address.
export function pickGlobalErrorMessages(pathname: string | null) {
  const first = pathname?.split("/").filter(Boolean)[0] ?? "";
  const locale = isLocale(first) ? first : defaultLocale;

  return { ...globalErrorMessages[locale], lang: htmlLang[locale], homeHref: `/${locale}` };
}
