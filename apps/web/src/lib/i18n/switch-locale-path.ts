import type { Locale } from "@/lib/i18n/config";

// Replaces the locale segment of a path: /pt/a/b to /en/a/b.
export function switchLocalePath(pathname: string, target: Locale): string {
  const [, ...rest] = pathname.split("/").filter(Boolean);
  return `/${[target, ...rest].join("/")}`;
}
