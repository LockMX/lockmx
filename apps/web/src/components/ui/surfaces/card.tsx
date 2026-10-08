import Link from "next/link";
import { classNames } from "@/components/ui/class-names";

type CardVariant = "outlined" | "raised" | "subtle" | "inverse" | "accent";
type CardPadding = "none" | "sm" | "md" | "lg";
type CardElement = "div" | "section" | "article" | "li";

type CardAppearance = {
  variant?: CardVariant;
  padding?: CardPadding;
};

type StaticCardProps = Omit<React.HTMLAttributes<HTMLElement>, "style" | "onClick"> &
  CardAppearance & {
    /** The element of a card that is not interactive. */
    as?: CardElement;
    href?: undefined;
    onClick?: undefined;
  };

type LinkCardProps = Omit<React.ComponentProps<typeof Link>, "style" | "as"> &
  CardAppearance;

type ButtonCardProps = Omit<React.ComponentProps<"button">, "style" | "onClick"> &
  CardAppearance & {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    href?: undefined;
  };

export type CardProps = StaticCardProps | LinkCardProps | ButtonCardProps;

const VARIANT_CLASSES: Record<CardVariant, string> = {
  outlined: "border-border-subtle bg-surface-card text-text-body",
  raised: "border-border-subtle bg-surface-card text-text-body shadow-md",
  subtle: "border-transparent bg-surface-subtle text-text-body",
  inverse: "border-border-inverse bg-surface-inverse text-text-inverse",
  accent: "border-transparent bg-surface-accent text-text-on-accent",
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// The lift is a movement, so it is left out under reduced motion.
const INTERACTIVE_CLASSES =
  "block w-full text-left no-underline transition-[border-color,translate] motion-safe:hover:-translate-y-0.5";

// The border of an inverse card is already dark: it has nothing to go to.
const HOVER_BORDER_CLASSES: Record<CardVariant, string> = {
  outlined: "hover:border-border-strong",
  raised: "hover:border-border-strong",
  subtle: "hover:border-border-strong",
  inverse: "",
  accent: "hover:border-border-strong",
};

function cardClassName(
  { variant = "outlined", padding = "md" }: CardAppearance,
  interactive: boolean,
  className?: string,
): string {
  return classNames(
    "rounded-md border",
    VARIANT_CLASSES[variant],
    PADDING_CLASSES[padding],
    interactive && INTERACTIVE_CLASSES,
    interactive && HOVER_BORDER_CLASSES[variant],
    className,
  );
}

/**
 * A surface that groups content. With `href` the whole card is one link, and
 * with `onClick` one button: its content is then the accessible name, so it
 * holds no other control (and, for a button, no block elements).
 */
export function Card(props: CardProps) {
  if (props.href !== undefined) {
    const { variant, padding, className, ...linkProps } = props;
    return (
      <Link
        {...linkProps}
        className={cardClassName({ variant, padding }, true, className)}
      />
    );
  }

  if (props.onClick !== undefined) {
    const { variant, padding, className, type = "button", ...buttonProps } = props;
    return (
      <button
        {...buttonProps}
        type={type}
        className={cardClassName({ variant, padding }, true, className)}
      />
    );
  }

  const { as: Element = "div", variant, padding, className, ...elementProps } = props;
  return (
    <Element
      {...elementProps}
      // The controls inside an inverse card get the ring made for a dark surface.
      data-surface={variant === "inverse" ? "inverse" : undefined}
      className={cardClassName({ variant, padding }, false, className)}
    />
  );
}
