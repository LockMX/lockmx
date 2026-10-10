import type { Metadata } from "next";
import { ModularSystem } from "@/components/site/sections/modular-system";
import { modularSystemPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { modularSystem } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: modularSystemPath,
    title: modularSystem.pageTitle,
    description: modularSystem.description,
  });
}

// The main product of the site: what the modular system is and its parts.
export default async function ModularSystemPage() {
  const locale = await getCurrentLocale();
  const { modularSystem } = await getMessages(locale);

  return (
    <ModularSystem
      id="modular-system"
      eyebrow={modularSystem.eyebrow}
      title={modularSystem.title}
      paragraphs={[modularSystem.systemText, modularSystem.partsText]}
      parts={[
        { icon: "hard-hat", ...modularSystem.helmets },
        { icon: "footprints", ...modularSystem.boots },
        { icon: "shirt", ...modularSystem.hangers },
        { icon: "shelving-unit", ...modularSystem.shelves },
      ]}
    />
  );
}
