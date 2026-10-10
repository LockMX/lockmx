import { Section } from "@/components/site/sections/section";
import { Card, Icon, type IconName } from "@/components/ui";

export type Part = {
  icon: IconName;
  title: string;
  text: string;
};

type ModularSystemProps = {
  id: string;
  eyebrow: string;
  title: string;
  /** What the system is and what it is made of, in the words of the client. */
  paragraphs: string[];
  parts: Part[];
};

/**
 * The modular system and its parts, one card each. It is the whole of its
 * page, so its heading is the `h1`. A photograph replaces the icon of a part
 * when one exists.
 */
export function ModularSystem({ id, eyebrow, title, paragraphs, parts }: ModularSystemProps) {
  return (
    <Section id={id} level={1} eyebrow={eyebrow} title={title}>
      <div className="flex flex-col gap-4 lg:w-2/3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-lg leading-body">
            {paragraph}
          </p>
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((part) => (
          <Card as="li" key={part.title} className="flex flex-col gap-4">
            <span className="grid size-12 place-items-center rounded-sm bg-surface-inverse text-yellow">
              <Icon name={part.icon} size="lg" />
            </span>
            <h2 className="font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic">
              {part.title}
            </h2>
            <p className="text-md leading-snug">{part.text}</p>
          </Card>
        ))}
      </ul>
    </Section>
  );
}
