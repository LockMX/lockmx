import { classNames } from "@/components/ui/class-names";
import type { IconSize } from "@/components/ui/core/icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-inverse"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonAppearance = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Cuts the sides to the logo's slant. For hero and merchandising actions. */
  slanted?: boolean;
  fullWidth?: boolean;
};

const BASE_CLASSES =
  "items-center justify-center border-2 font-display font-bold italic uppercase leading-none tracking-caps whitespace-nowrap no-underline transition-colors active:translate-y-px disabled:pointer-events-none";

// A variant sets `--button-bg` for each state; the shape decides what paints it.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "text-text-on-accent [--button-bg:var(--action-primary)] hover:[--button-bg:var(--action-primary-hover)] active:[--button-bg:var(--action-primary-press)]",
  secondary:
    "text-text-inverse [--button-bg:var(--action-secondary)] hover:[--button-bg:var(--action-secondary-hover)] active:[--button-bg:var(--lmx-ink-700)]",
  outline:
    "text-text-strong hover:text-text-inverse [--button-bg:transparent] hover:[--button-bg:var(--lmx-ink-950)] active:[--button-bg:var(--lmx-ink-800)]",
  "outline-inverse":
    "text-text-inverse hover:text-text-strong [--button-bg:transparent] hover:[--button-bg:var(--lmx-white)] active:[--button-bg:var(--lmx-ink-200)]",
  ghost:
    "text-text-strong [--button-bg:transparent] hover:[--button-bg:var(--surface-sunken)] active:[--button-bg:var(--lmx-ink-200)]",
  danger:
    "text-white [--button-bg:var(--status-danger)] hover:[--button-bg:var(--status-danger-hover)] active:[--button-bg:var(--status-danger-press)]",
};

// Only the outline variants show their border; the others keep it transparent
// so every variant has the same box.
const BORDER_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-transparent",
  secondary: "border-transparent",
  outline: "border-border-strong",
  "outline-inverse": "border-white",
  ghost: "border-transparent",
  danger: "border-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 text-md",
  md: "h-11 gap-2 text-lg",
  lg: "h-13.5 gap-2.5 text-heading-md",
};

const PADDING_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5",
  md: "px-5",
  lg: "px-7",
};

// The cut takes room from both ends, so a slanted button is padded further.
const SLANTED_PADDING_CLASSES: Record<ButtonSize, string> = {
  sm: "px-6",
  md: "px-7.5",
  lg: "px-9.5",
};

const RECTANGLE_CLASSES = "rounded-sm bg-(--button-bg)";

// The background is a clipped pseudo-element, so the element keeps a whole
// outline for its focus ring. A slanted button has no visible border.
const SLANTED_CLASSES =
  "relative isolate border-transparent before:absolute before:inset-0 before:-z-10 before:bg-(--button-bg) before:transition-colors before:clip-slant";

export const BUTTON_ICON_SIZES: Record<ButtonSize, IconSize> = {
  sm: "sm",
  md: "md",
  lg: "md",
};

export function buttonClassName(
  {
    variant = "primary",
    size = "md",
    slanted = false,
    fullWidth = false,
  }: ButtonAppearance,
  className?: string,
): string {
  return classNames(
    fullWidth ? "flex w-full" : "inline-flex",
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    slanted ? SLANTED_PADDING_CLASSES[size] : PADDING_CLASSES[size],
    slanted
      ? SLANTED_CLASSES
      : classNames(RECTANGLE_CLASSES, BORDER_CLASSES[variant]),
    className,
  );
}
