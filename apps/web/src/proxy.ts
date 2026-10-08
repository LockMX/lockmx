// Sources:
// https://nextjs.org/docs/app/guides/internationalization (bundled: 01-app/02-guides/internationalization.md)
// 01-app/03-api-reference/03-file-conventions/proxy.md (matcher with negative matching)
import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/negotiate";

// A first segment shaped like a language code (fr, en-US) that is not supported.
const localeShaped = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

// The public site shows only the placeholder while this is "true" in the
// deployment's environment. It is unset in development, where every page is
// served as it is. Read per request, so it follows the environment it runs in.
const COMING_SOON_SEGMENT = "coming-soon";

function comingSoonEnabled(): boolean {
  return process.env.COMING_SOON === "true";
}

export function proxy(request: NextRequest) {
  const [first = "", ...rest] = request.nextUrl.pathname.split("/").filter(Boolean);

  if (isLocale(first)) {
    return comingSoonEnabled()
      ? NextResponse.rewrite(new URL(`/${first}/${COMING_SOON_SEGMENT}`, request.url))
      : NextResponse.next();
  }

  const locale = resolveLocale(request.headers.get("accept-language"));
  const remaining = localeShaped.test(first) ? rest : [first, ...rest].filter(Boolean);

  const url = request.nextUrl.clone();
  url.pathname = `/${[locale, ...remaining].join("/")}`;

  const response = NextResponse.redirect(url);
  // The target depends on Accept-Language, so caches must not share it across languages.
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip API routes, Next.js internals and files with an extension (favicon.ico, logo.svg).
  matcher: ["/((?!api|_next|.*[.].*).*)"],
};
