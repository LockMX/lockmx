import type { Metadata } from "next";
import { Benefits } from "@/components/site/sections/benefits";
import { Buy } from "@/components/site/sections/buy";
import { Complements } from "@/components/site/sections/complements";
import { Contact } from "@/components/site/sections/contact";
import { Hero, type HeroImage } from "@/components/site/sections/hero";
import { contactEmail } from "@/lib/site/contact";
import { localizedPath, modularSystemPath } from "@/lib/site/public-paths";
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

// The landing page: it presents the brand and leads to the modular system and to contact.
export default async function Home() {
  const locale = await getCurrentLocale();
  const { home } = await getMessages(locale);
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
          href: localizedPath(locale, modularSystemPath),
          label: home.hero.secondaryAction,
        }}
        image={{ ...HERO_IMAGE, alt: home.hero.imageAlt }}
      />
      <Benefits
        id={sectionIds.why}
        eyebrow={home.why.eyebrow}
        title={home.why.title}
        benefits={[home.why.space, home.why.place, home.why.tough, home.why.time]}
      />
      <Buy
        id={sectionIds.buy}
        eyebrow={home.buy.eyebrow}
        title={home.buy.title}
        text={home.buy.text}
        action={{ href: contactHref, label: home.buy.action }}
      />
      <Complements
        id={sectionIds.complements}
        eyebrow={home.complements.eyebrow}
        title={home.complements.title}
        text={home.complements.text}
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
