import Image from "next/image";
import { ButtonLink } from "@/components/ui";

type HeroAction = {
  href: string;
  label: string;
};

export type HeroImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

type HeroProps = {
  eyebrow: string;
  /** The heading is set on two lines; the second one is the accent. */
  titleLead: string;
  titleAccent: string;
  text: string;
  primaryAction: HeroAction;
  secondaryAction: HeroAction;
  /** The hero works without an image: the text then takes the row. */
  image?: HeroImage;
};

const HEADING_ID = "hero-heading";

/** The opening of the landing page, with the only `h1` of the page. */
export function Hero({
  eyebrow,
  titleLead,
  titleAccent,
  text,
  primaryAction,
  secondaryAction,
  image,
}: HeroProps) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      data-surface="inverse"
      className="bg-surface-inverse text-text-inverse"
    >
      <div className="mx-auto grid max-w-page items-center gap-12 px-gutter py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <p className="text-xs leading-tight font-bold tracking-eyebrow text-yellow uppercase">
            {eyebrow}
          </p>
          <h1
            id={HEADING_ID}
            className="font-display text-display-md leading-display font-black tracking-display uppercase italic sm:text-display-lg lg:text-display-xl"
          >
            <span className="block">{titleLead}</span>{" "}
            <span className="block text-yellow">{titleAccent}</span>
          </h1>
          <p className="text-lg leading-body text-text-inverse-muted">{text}</p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink
              href={primaryAction.href}
              variant="primary"
              size="lg"
              slanted
              iconRight="arrow-right"
            >
              {primaryAction.label}
            </ButtonLink>
            <ButtonLink href={secondaryAction.href} variant="outline-inverse" size="lg">
              {secondaryAction.label}
            </ButtonLink>
          </div>
        </div>
        {image && (
          <div className="relative">
            {/* Above the fold, so it is not loaded lazily (bundled image.md, `loading`). */}
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              sizes="(min-width: 80rem) 36rem, (min-width: 48rem) 50vw, 100vw"
              loading="eager"
              className="aspect-square w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-2 left-6 h-4 w-1/2 skew-x-(--slant) bg-yellow"
            />
          </div>
        )}
      </div>
    </section>
  );
}
