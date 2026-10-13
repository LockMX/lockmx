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
// 2026-10-13): the path of Meta's own file (Instagram_Glyph_Black.svg, drawn on
// 1000 units), unchanged and scaled to the 24 units of the set. It is a filled
// shape, so it takes the colour of the text but no stroke.
const INSTAGRAM_GLYPH =
  "M295.42,6c-53.2,2.51-89.53,11-121.29,23.48-32.87,12.81-60.73,30-88.45,57.82S40.89,143,28.17,175.92c-12.31,31.83-20.65,68.19-23,121.42S2.3,367.68,2.56,503.46,3.42,656.26,6,709.6c2.54,53.19,11,89.51,23.48,121.28,12.83,32.87,30,60.72,57.83,88.45S143,964.09,176,976.83c31.8,12.29,68.17,20.67,121.39,23s70.35,2.87,206.09,2.61,152.83-.86,206.16-3.39S799.1,988,830.88,975.58c32.87-12.86,60.74-30,88.45-57.84S964.1,862,976.81,829.06c12.32-31.8,20.69-68.17,23-121.35,2.33-53.37,2.88-70.41,2.62-206.17s-.87-152.78-3.4-206.1-11-89.53-23.47-121.32c-12.85-32.87-30-60.7-57.82-88.45S862,40.87,829.07,28.19c-31.82-12.31-68.17-20.7-121.39-23S637.33,2.3,501.54,2.56,348.75,3.4,295.42,6m5.84,903.88c-48.75-2.12-75.22-10.22-92.86-17-23.36-9-40-19.88-57.58-37.29s-28.38-34.11-37.5-57.42c-6.85-17.64-15.1-44.08-17.38-92.83-2.48-52.69-3-68.51-3.29-202s.22-149.29,2.53-202c2.08-48.71,10.23-75.21,17-92.84,9-23.39,19.84-40,37.29-57.57s34.1-28.39,57.43-37.51c17.62-6.88,44.06-15.06,92.79-17.38,52.73-2.5,68.53-3,202-3.29s149.31.21,202.06,2.53c48.71,2.12,75.22,10.19,92.83,17,23.37,9,40,19.81,57.57,37.29s28.4,34.07,37.52,57.45c6.89,17.57,15.07,44,17.37,92.76,2.51,52.73,3.08,68.54,3.32,202s-.23,149.31-2.54,202c-2.13,48.75-10.21,75.23-17,92.89-9,23.35-19.85,40-37.31,57.56s-34.09,28.38-57.43,37.5c-17.6,6.87-44.07,15.07-92.76,17.39-52.73,2.48-68.53,3-202.05,3.29s-149.27-.25-202-2.53m407.6-674.61a60,60,0,1,0,59.88-60.1,60,60,0,0,0-59.88,60.1M245.77,503c.28,141.8,115.44,256.49,257.21,256.22S759.52,643.8,759.25,502,643.79,245.48,502,245.76,245.5,361.22,245.77,503m90.06-.18a166.67,166.67,0,1,1,167,166.34,166.65,166.65,0,0,1-167-166.34";

const Instagram = createLucideIcon("instagram", [
  [
    "path",
    {
      d: INSTAGRAM_GLYPH,
      transform: "scale(0.024) translate(-2.5 -2.5)",
      fill: "currentColor",
      stroke: "none",
      key: "glyph",
    },
  ],
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
export type IconSize = "sm" | "md" | "lg" | "xl";

export const iconNames = Object.keys(ICONS) as IconName[];

const SIZE_CLASSES: Record<IconSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
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
