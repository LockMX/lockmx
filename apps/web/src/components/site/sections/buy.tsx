import { Section } from "@/components/site/sections/section";
import { ButtonLink } from "@/components/ui";

type BuyProps = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  action: { href: string; label: string };
};

/**
 * The closing block that repeats the main action of the page. Until the shop
 * exists the action leads to the contact section (spec 004, T6).
 */
export function Buy({ id, eyebrow, title, text, action }: BuyProps) {
  return (
    <Section id={id} surface="inverse" eyebrow={eyebrow} title={title}>
      <p className="text-lg leading-body text-text-inverse-muted lg:w-2/3">{text}</p>
      <div>
        <ButtonLink href={action.href} variant="primary" size="lg" slanted iconRight="arrow-right">
          {action.label}
        </ButtonLink>
      </div>
    </Section>
  );
}
