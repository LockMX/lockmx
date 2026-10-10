import { Section } from "@/components/site/sections/section";

type SystemProps = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
};

/** What the system is and who it is for, in the words of the client. */
export function System({ id, eyebrow, title, text }: SystemProps) {
  return (
    <Section id={id} eyebrow={eyebrow} title={title}>
      <p className="text-lg leading-body lg:w-2/3">{text}</p>
    </Section>
  );
}
