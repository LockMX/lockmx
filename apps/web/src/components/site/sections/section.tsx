import { classNames } from "@/components/ui/class-names";

type SectionSurface = "page" | "subtle" | "inverse" | "accent";

type SectionProps = {
  /** The id a link leads to; the heading is named after it. */
  id: string;
  surface?: SectionSurface;
  /** 1 when the section is the whole of its page. */
  level?: 1 | 2;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

const SURFACE_CLASSES: Record<SectionSurface, string> = {
  page: "bg-surface-page text-text-body",
  subtle: "bg-surface-subtle text-text-body",
  inverse: "bg-surface-inverse text-text-inverse",
  accent: "bg-surface-accent text-text-on-accent",
};

// Yellow is not a text colour on a light surface, and the amber of the
// eyebrow has no contrast on yellow.
const EYEBROW_CLASSES: Record<SectionSurface, string> = {
  page: "text-text-accent",
  subtle: "text-text-accent",
  inverse: "text-yellow",
  accent: "text-text-on-accent",
};

const TITLE_CLASSES: Record<SectionSurface, string> = {
  page: "text-text-strong",
  subtle: "text-text-strong",
  inverse: "text-text-inverse",
  accent: "text-text-on-accent",
};

/**
 * A section of the landing page: a region named by its heading, with the
 * eyebrow above it. It can take the focus, so a link to it moves the focus
 * there, but it is not a tab stop.
 */
export function Section({
  id,
  surface = "page",
  level = 2,
  eyebrow,
  title,
  children,
}: SectionProps) {
  const headingId = `${id}-heading`;
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={-1}
      data-surface={surface === "inverse" ? "inverse" : undefined}
      className={classNames("outline-none", SURFACE_CLASSES[surface])}
    >
      <div className="mx-auto flex max-w-page flex-col gap-10 px-gutter py-16 md:py-24">
        <div className="flex flex-col gap-3">
          <p
            className={classNames(
              "text-xs leading-tight font-bold tracking-eyebrow uppercase",
              EYEBROW_CLASSES[surface],
            )}
          >
            {eyebrow}
          </p>
          <Heading
            id={headingId}
            className={classNames(
              "font-display text-display-sm leading-display font-extrabold tracking-display uppercase italic md:text-display-md",
              TITLE_CLASSES[surface],
            )}
          >
            {title}
          </Heading>
        </div>
        {children}
      </div>
    </section>
  );
}
