import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Image as ImageGlyph,
  Info,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  Minus,
  Package,
  Pencil,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { classNames } from "@/components/ui/class-names";

// The closed set of icons the design system uses (ADR 0010). Importing each by
// name keeps the others out of the bundle; adding an icon is one line here.
const ICONS = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  bell: Bell,
  check: Check,
  "chevron-down": ChevronDown,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  image: ImageGlyph,
  info: Info,
  "key-round": KeyRound,
  "loader-circle": LoaderCircle,
  lock: Lock,
  mail: Mail,
  minus: Minus,
  package: Package,
  pencil: Pencil,
  plus: Plus,
  receipt: Receipt,
  search: Search,
  "shopping-cart": ShoppingCart,
  "trash-2": Trash2,
  truck: Truck,
  user: User,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
export type IconSize = "sm" | "md" | "lg";

export const iconNames = Object.keys(ICONS) as IconName[];

const SIZE_CLASSES: Record<IconSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export type IconProps = {
  name: IconName;
  size?: IconSize;
  /** Layout only: margin, colour inherited from text, `animate-spin`. */
  className?: string;
};

/**
 * Always decorative: lucide-react renders `aria-hidden="true"` unless the icon
 * is given a name, and this component offers no way to give one. The control
 * around the icon carries the accessible name.
 */
export function Icon({ name, size = "md", className }: IconProps) {
  const Glyph = ICONS[name];

  return (
    <Glyph className={classNames(SIZE_CLASSES[size], "shrink-0", className)} />
  );
}
