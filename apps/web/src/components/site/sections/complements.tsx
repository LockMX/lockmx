import { Section } from "@/components/site/sections/section";

type ComplementsProps = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
};

/** One short block on what the shop carries besides the system. */
export function Complements({ id, eyebrow, title, text }: ComplementsProps) {
  return (
    <Section id={id} surface="subtle" eyebrow={eyebrow} title={title}>
      <p className="text-lg leading-body lg:w-2/3">{text}</p>
    </Section>
  );
}
