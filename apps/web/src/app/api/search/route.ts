// Sources (bundled Next.js docs): 01-app/03-api-reference/03-file-conventions/route.md
// (`request.nextUrl`) and 01-app/01-getting-started/15-route-handlers.md: a
// Route Handler is not cached by default, so every request runs.
import type { NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { SEARCH_PARAM } from "@/lib/shop/search";
import { getSearchSuggestions } from "@/server/shop/search-suggestions";

// The suggestions of the shop's search bar (spec 005, T10). The browser gives
// only the text and the language, both checked on the server. The rate limit
// is a rule of the hosting firewall (ADR 0016), not code.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = params.get("lang") ?? "";
  if (!isLocale(locale)) return Response.json({ suggestions: [] }, { status: 400 });

  return Response.json({ suggestions: await getSearchSuggestions(locale, params.get(SEARCH_PARAM)) });
}
