import type { Metadata } from "next";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata } = await getMessages(locale);
  return buildPageMetadata({ locale, path: "/", description: metadata.description });
}

// A stub until the home page spec is built: the public site shows the
// placeholder instead while COMING_SOON is set (see proxy.ts).
export default async function Home() {
  const locale = await getCurrentLocale();
  const { metadata } = await getMessages(locale);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-gutter py-12 text-center">
      <h1 className="text-heading-lg font-semibold">{metadata.title}</h1>
    </div>
  );
}
