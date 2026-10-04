// Source: 01-app/03-api-reference/04-functions/next-root-params.md (bundled Next.js docs)
// Root parameter getters work in Server Components only; this module needs no `server-only`.
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function getCurrentLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}
