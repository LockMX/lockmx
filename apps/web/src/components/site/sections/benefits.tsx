import { Section } from "@/components/site/sections/section";

export type Benefit = {
  title: string;
  text: string;
};

type BenefitsProps = {
  id: string;
  eyebrow: string;
  title: string;
  benefits: Benefit[];
};

/** Why the system: only the benefits the client states. */
export function Benefits({ id, eyebrow, title, benefits }: BenefitsProps) {
  return (
    <Section id={id} eyebrow={eyebrow} title={title}>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <li
            key={benefit.title}
            className="flex flex-col gap-3 border-t-2 border-border-strong pt-4"
          >
            <h3 className="font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic">
              {benefit.title}
            </h3>
            <p className="text-md leading-snug">{benefit.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
