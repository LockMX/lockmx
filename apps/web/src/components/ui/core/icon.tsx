import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Footprints,
  HardHat,
  Image as ImageGlyph,
  Info,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  Menu,
  Minus,
  Package,
  PackageOpen,
  Pause,
  Pencil,
  Play,
  Plus,
  Receipt,
  Search,
  ShelvingUnit,
  Shirt,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  User,
  X,
  createLucideIcon,
  type LucideIcon,
} from "lucide-react";
import { classNames } from "@/components/ui/class-names";

// Lucide ships no brand icons, so this one is ours (ADR 0010, update of
// 2026-10-13): the outline Lucide drew for Instagram before it dropped brands,
// built with its own helper so it takes size, colour and stroke like the rest.
const Instagram = createLucideIcon("instagram", [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "frame" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "lens" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "flash" }],
]);

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
  footprints: Footprints,
  "hard-hat": HardHat,
  image: ImageGlyph,
  info: Info,
  instagram: Instagram,
  "key-round": KeyRound,
  "loader-circle": LoaderCircle,
  lock: Lock,
  mail: Mail,
  menu: Menu,
  minus: Minus,
  package: Package,
  "package-open": PackageOpen,
  pause: Pause,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  receipt: Receipt,
  search: Search,
  "shelving-unit": ShelvingUnit,
  shirt: Shirt,
  "shopping-cart": ShoppingCart,
  store: Store,
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
