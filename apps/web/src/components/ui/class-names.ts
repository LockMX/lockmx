type ClassValue = string | false | null | undefined;

/** Joins the classes that apply, skipping the conditions that did not. */
export function classNames(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
