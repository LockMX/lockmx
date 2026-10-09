// The public origin of the site, used for canonical and alternate addresses.
// SITE_URL is read here and nowhere else.
const LOCAL_ORIGIN = "http://localhost:3000";

function fail(reason: string): never {
  throw new Error(`SITE_URL ${reason}. Set it to the public origin, for example https://lockmx.com.`);
}

export function parseSiteUrl(value: string | undefined, nodeEnv: string | undefined): URL {
  const production = nodeEnv === "production";
  const raw = value?.trim() ?? "";

  if (raw === "") {
    if (production) fail("is not set");
    return new URL(LOCAL_ORIGIN);
  }

  if (!URL.canParse(raw)) fail("is not an absolute address");
  const url = new URL(raw);

  if (url.protocol !== "https:" && (production || url.protocol !== "http:")) {
    fail("must use https");
  }
  if (url.pathname !== "/" || url.search !== "" || url.hash !== "") {
    fail("must be an origin only, without a path");
  }
  return url;
}

export function getSiteUrl(): URL {
  return parseSiteUrl(process.env.SITE_URL, process.env.NODE_ENV);
}
