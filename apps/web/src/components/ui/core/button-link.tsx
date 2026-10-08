import Link from "next/link";
import {
  BUTTON_ICON_SIZES,
  buttonClassName,
  type ButtonAppearance,
} from "@/components/ui/core/button-styles";
import { Icon, type IconName } from "@/components/ui/core/icon";

export type ButtonLinkProps = Omit<React.ComponentProps<typeof Link>, "style"> &
  ButtonAppearance & {
    iconLeft?: IconName;
    iconRight?: IconName;
  };

/** Navigation that looks like a `Button`. It is an anchor, so it is announced as a link. */
export function ButtonLink({
  variant,
  size = "md",
  slanted,
  fullWidth,
  iconLeft,
  iconRight,
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  const iconSize = BUTTON_ICON_SIZES[size];

  return (
    <Link
      {...linkProps}
      className={buttonClassName({ variant, size, slanted, fullWidth }, className)}
    >
      {iconLeft && <Icon name={iconLeft} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </Link>
  );
}
