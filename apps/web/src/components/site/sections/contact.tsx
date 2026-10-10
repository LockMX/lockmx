import { Section } from "@/components/site/sections/section";
import { Card } from "@/components/ui";

type ContactProps = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  emailLabel: string;
  email: string;
};

/** The contact details, on the one accent section of the page. */
export function Contact({ id, eyebrow, title, text, emailLabel, email }: ContactProps) {
  return (
    <Section id={id} surface="accent" eyebrow={eyebrow} title={title}>
      <div className="grid items-start gap-8 md:grid-cols-2">
        <p className="text-lg leading-body">{text}</p>
        <Card padding="lg">
          <dl className="flex flex-col gap-1">
            <dt className="text-2xs leading-tight font-semibold tracking-label text-text-muted uppercase">
              {emailLabel}
            </dt>
            <dd>
              <a href={`mailto:${email}`} className="text-lg leading-snug font-semibold break-all">
                {email}
              </a>
            </dd>
          </dl>
        </Card>
      </div>
    </Section>
  );
}
