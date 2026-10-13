import type { Metadata } from "next";
import { Benefits } from "@/components/site/sections/benefits";
import { Contact } from "@/components/site/sections/contact";
import { Hero, type HeroImage } from "@/components/site/sections/hero";
import { ModularSystem } from "@/components/site/sections/modular-system";
import { contactEmail } from "@/lib/site/contact";
import { sectionHref, sectionIds } from "@/lib/site/sections";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

// A mockup of the client's identity pack (M5), exported at this size.
const HERO_IMAGE: Omit<HeroImage, "alt"> = {
  src: "/brand/mockups/sign-black.jpg",
  width: 1600,
  height: 1600,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata } = await getMessages(locale);
  return buildPageMetadata({ locale, path: "/", description: metadata.description });
}

type WhyMessages = Awaited<ReturnType<typeof getMessages>>["modularSystem"]["why"];

function whyBenefits(why: WhyMessages) {
  return [why.space, why.place, why.tough, why.time];
}

// The landing page: it presents the modular system and leads to contact.
export default async function Home() {
  const locale = await getCurrentLocale();
  const { home, modularSystem } = await getMessages(locale);
  const contactHref = sectionHref(locale, sectionIds.contact);

  return (
    <>
      <Hero
        eyebrow={home.hero.eyebrow}
        titleLead={home.hero.titleLead}
        titleAccent={home.hero.titleAccent}
        text={home.hero.text}
        // Until the shop exists, the main action of the page leads to contact.
        primaryAction={{ href: contactHref, label: home.hero.primaryAction }}
        secondaryAction={{
          href: sectionHref(locale, sectionIds.system),
          label: home.hero.secondaryAction,
        }}
        image={{ ...HERO_IMAGE, alt: home.hero.imageAlt }}
      />
      <ModularSystem
        id={sectionIds.system}
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
      <Benefits
        id={sectionIds.why}
        eyebrow={modularSystem.why.eyebrow}
        title={modularSystem.why.title}
        benefits={whyBenefits(modularSystem.why)}
        action={{ href: contactHref, label: modularSystem.why.action }}
      />
      <Contact
        id={sectionIds.contact}
        eyebrow={home.contact.eyebrow}
        title={home.contact.title}
        text={home.contact.text}
        emailLabel={home.contact.emailLabel}
        email={contactEmail}
      />
    </>
  );
}
