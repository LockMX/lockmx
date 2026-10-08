import { classNames } from "@/components/ui/class-names";

type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "danger"
  | "info"
  | "warning"
  | "inverse";
type BadgeVariant = "soft" | "solid";
type BadgeShape = "pill" | "slant";

const TONE_CLASSES: Record<BadgeVariant, Record<BadgeTone, string>> = {
  soft: {
    neutral: "bg-surface-sunken text-text-body",
    accent: "bg-yellow-100 text-ink-950",
    success: "bg-status-success-bg text-status-success",
    danger: "bg-status-danger-bg text-status-danger",
    info: "bg-status-info-bg text-status-info",
    warning: "bg-status-warning-bg text-status-warning-text",
    inverse: "bg-ink-950 text-white",
  },
  solid: {
    neutral: "bg-ink-700 text-white",
    accent: "bg-yellow text-black",
    success: "bg-status-success text-white",
    danger: "bg-status-danger text-white",
    info: "bg-status-info text-white",
    warning: "bg-status-warning text-black",
    inverse: "bg-ink-950 text-white",
  },
};

const SHAPE_CLASSES: Record<BadgeShape, string> = {
  pill: "h-5.5 rounded-pill px-2 font-sans text-xs font-semibold",
  slant:
    "h-6.5 px-3.5 font-display text-sm font-extrabold italic uppercase tracking-caps clip-slant-sm",
};

export type BadgeProps = Omit<React.ComponentProps<"span">, "style" | "children"> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  shape?: BadgeShape;
  /** A small dot before the text. Decoration: the text carries the state. */
  dot?: boolean;
  children: React.ReactNode;
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  shape = "pill",
  dot = false,
  className,
  children,
  ...spanProps
}: BadgeProps) {
  return (
    <span
      {...spanProps}
      className={classNames(
        "inline-flex items-center gap-1.5 leading-none whitespace-nowrap",
        TONE_CLASSES[variant][tone],
        SHAPE_CLASSES[shape],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-pill bg-current" />}
      {children}
    </span>
  );
}
