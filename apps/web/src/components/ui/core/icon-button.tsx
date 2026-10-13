import Link from "next/link";
import { classNames } from "@/components/ui/class-names";
import { Icon, type IconName, type IconSize } from "@/components/ui/core/icon";

type IconButtonVariant =
  | "ghost"
  | "ghost-inverse"
  | "outline"
  | "primary"
  | "secondary";
type IconButtonSize = "sm" | "md" | "lg";

const BASE_CLASSES =
  "relative inline-grid place-items-center rounded-sm border transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "border-transparent text-text-strong hover:bg-surface-sunken",
  "ghost-inverse":
    "border-transparent text-text-inverse hover:bg-surface-inverse-raised",
  outline: "border-border-control text-text-strong hover:bg-surface-sunken",
  primary:
    "border-transparent bg-action-primary text-text-on-accent hover:bg-action-primary-hover",
  secondary:
    "border-transparent bg-action-secondary text-text-inverse hover:bg-action-secondary-hover",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const ICON_SIZES: Record<IconButtonSize, IconSize> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const COUNT_CLASSES =
  "absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-pill bg-yellow px-1 text-2xs font-bold leading-none text-black ring-2";

// The ring separates the count from the icon, so it takes the colour of the
// surface the variant is made for.
const COUNT_RING_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "ring-surface-page",
  "ghost-inverse": "ring-surface-inverse",
  outline: "ring-surface-page",
  primary: "ring-surface-page",
  secondary: "ring-surface-page",
};

type IconButtonAppearance = {
  icon: IconName;
  /** The accessible name, also shown as the tooltip. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** A counter on the corner, for example the items in the cart. Hidden at zero. */
  count?: number;
};

type NamedByLabel = "style" | "children" | "aria-label" | "title";

type ActionIconButtonProps = Omit<React.ComponentProps<"button">, NamedByLabel> &
  IconButtonAppearance & { href?: undefined };

type LinkIconButtonProps = Omit<React.ComponentProps<typeof Link>, NamedByLabel> &
  IconButtonAppearance;

export type IconButtonProps = ActionIconButtonProps | LinkIconButtonProps;

/** A control with only an icon. With `href` it is a link and is announced as one. */
export function IconButton(props: IconButtonProps) {
  const { icon, label, variant = "ghost", size = "md", count = 0, className, ...rest } = props;
  const hasCount = count > 0;
  const shared = {
    // The count is part of the name, so it is announced with the label.
    "aria-label": hasCount ? `${label} ${count}` : label,
    title: label,
    className: classNames(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className),
  };
  const content = (
    <>
      <Icon name={icon} size={ICON_SIZES[size]} />
      {hasCount && (
        <span
          aria-hidden="true"
          className={classNames(COUNT_CLASSES, COUNT_RING_CLASSES[variant])}
        >
          {count}
        </span>
      )}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link {...rest} {...shared}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest;

  return (
    <button {...buttonProps} {...shared} type={type}>
      {content}
    </button>
  );
}
