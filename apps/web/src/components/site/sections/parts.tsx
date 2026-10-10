import { Section } from "@/components/site/sections/section";
import { Card, Icon, type IconName } from "@/components/ui";

export type Part = {
  icon: IconName;
  title: string;
  text: string;
};

type PartsProps = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  parts: Part[];
};

/** The parts of the system, one card each. A photograph replaces the icon when one exists. */
export function Parts({ id, eyebrow, title, text, parts }: PartsProps) {
  return (
    <Section id={id} surface="subtle" eyebrow={eyebrow} title={title}>
      <p className="text-lg leading-body lg:w-2/3">{text}</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((part) => (
          <Card as="li" key={part.title} className="flex flex-col gap-4">
            <span className="grid size-12 place-items-center rounded-sm bg-surface-inverse text-yellow">
              <Icon name={part.icon} size="lg" />
            </span>
            <h3 className="font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic">
              {part.title}
            </h3>
            <p className="text-md leading-snug">{part.text}</p>
          </Card>
        ))}
      </ul>
    </Section>
  );
}
