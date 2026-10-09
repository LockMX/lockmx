import { expect, test } from "@playwright/test";

// The origin the test server is built with (playwright.config.ts).
const origin = "https://lockmx.com";
// A second server with the coming soon switch on (playwright.config.ts).
const comingSoonServer = "http://localhost:3101";

function locations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

test.describe("sitemap.xml", () => {
  test("is served without a locale redirect and lists both home pages", async ({ request }) => {
    const response = await request.get("/sitemap.xml", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    const urls = locations(await response.text());
    expect(urls).toContain(`${origin}/pt`);
    expect(urls).toContain(`${origin}/en`);
  });

  test("lists only absolute addresses of the site, and not the placeholder", async ({ request }) => {
    const urls = locations(await (await request.get("/sitemap.xml")).text());

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith(`${origin}/`)).toBe(true);
      expect(url).not.toContain("coming-soon");
    }
  });

  test("every entry answers 200", async ({ request }) => {
    const urls = locations(await (await request.get("/sitemap.xml")).text());

    for (const url of urls) {
      const response = await request.get(url.slice(origin.length), { maxRedirects: 0 });
      expect(response.status(), url).toBe(200);
    }
  });
});

test("robots.txt allows crawling and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt", { maxRedirects: 0 });

  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/Allow: \//);
  expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
});

test.describe("indexing", () => {
  for (const path of ["/pt", "/en"]) {
    test(`${path} carries no noindex header`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.headers()["x-robots-tag"]).toBeUndefined();
    });

    test(`${path} carries the noindex header while coming soon is on`, async ({ request }) => {
      const response = await request.get(`${comingSoonServer}${path}`);

      expect(response.status()).toBe(200);
      expect(response.headers()["x-robots-tag"]).toBe("noindex");
    });
  }
});
