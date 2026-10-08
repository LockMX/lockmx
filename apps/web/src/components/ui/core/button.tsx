import { classNames } from "@/components/ui/class-names";
import {
  BUTTON_ICON_SIZES,
  buttonClassName,
  type ButtonAppearance,
} from "@/components/ui/core/button-styles";
import { Icon, type IconName } from "@/components/ui/core/icon";

export type ButtonProps = Omit<React.ComponentProps<"button">, "style"> &
  ButtonAppearance & {
    iconLeft?: IconName;
    iconRight?: IconName;
    /** Shows a spinner, marks the button busy and stops it from being activated. */
    loading?: boolean;
  };

export function Button({
  variant,
  size = "md",
  slanted,
  fullWidth,
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...buttonProps
}: ButtonProps) {
  const iconSize = BUTTON_ICON_SIZES[size];
  const leadingIcon = loading ? "loader-circle" : iconLeft;

  return (
    <button
      {...buttonProps}
      type={type}
      // The native attribute blocks clicks, keys and form submission without
      // a handler, so the button can stay a Server Component.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName(
        { variant, size, slanted, fullWidth },
        classNames(disabled && !loading && "opacity-40", className),
      )}
    >
      {leadingIcon && (
        <Icon
          name={leadingIcon}
          size={iconSize}
          className={loading ? "animate-spin" : undefined}
        />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
