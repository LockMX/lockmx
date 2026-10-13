import type { Metadata } from "next";
import { ContactChannels } from "@/components/site/contact-channels";
import { Section } from "@/components/site/sections/section";
import { contactEmail, instagramHandle, instagramUrl } from "@/lib/site/contact";
import { contactPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { contact } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: contactPath,
    title: contact.title,
    description: contact.description,
  });
}

// How to reach LockMX: the email address and the social networks (spec 005,
// decision 20). A contact form, if it comes, lives here (spec 006).
export default async function ContactPage() {
  const locale = await getCurrentLocale();
  const { contact } = await getMessages(locale);

  return (
    <Section id="contact" level={1} eyebrow={contact.eyebrow} title={contact.title}>
      <p className="text-lg leading-body">{contact.text}</p>
      <ContactChannels
        channels={[
          {
            title: contact.emailTitle,
            icon: "mail",
            href: `mailto:${contactEmail}`,
            text: contactEmail,
          },
          {
            title: contact.socialTitle,
            icon: "instagram",
            href: instagramUrl,
            text: instagramHandle,
            external: true,
          },
        ]}
      />
    </Section>
  );
}
