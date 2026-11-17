import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import { localizedPath, publicPaths } from "@/lib/site/public-paths";
import {
  blockTexts,
  runHref,
  type PolicyBlock,
  type PolicyDocument,
  type PolicyRun,
} from "@/lib/site/policy-document";
import { getPolicy, policies } from "@/server/site/policies/policies";

function runs(document: PolicyDocument): PolicyRun[] {
  return document.blocks.flatMap((block) => blockTexts(block).flat());
}

function ids(document: PolicyDocument): string[] {
  return document.blocks.flatMap((block) => (block.id ? [block.id] : []));
}

// A link to another page of the site carries the locale of the text.
const sitePage = /^\/(pt|en)(\/.*)?$/;

// What a translation must keep: the blocks, their ids and levels, and in each
// text the same runs with the same marks and addresses (a link to a page of
// the site differs only by its locale).
function skeleton(block: PolicyBlock) {
  return {
    kind: block.kind,
    id: block.id,
    level: block.kind === "heading" ? block.level : undefined,
    texts: blockTexts(block).map((text) =>
      text.map((run) =>
        typeof run === "string"
          ? "text"
          : { strong: run.strong, em: run.em, href: run.href?.replace(sitePage, "/:locale$2") },
      ),
    ),
  };
}

const cases = policies.flatMap((name) => locales.map((locale) => [name, locale] as const));

describe.each(cases)("the %s policy in %s", (name, locale) => {
  const policy = getPolicy(name, locale);

  test("has content", () => {
    expect(policy.blocks.length).toBeGreaterThan(0);
  });

  test("gives each id to one block only", () => {
    expect(new Set(ids(policy)).size).toBe(ids(policy).length);
  });

  test("leads every link within the page to a block that exists", () => {
    const targets = runs(policy)
      .map(runHref)
      .filter((href) => href?.startsWith("#"))
      .map((href) => href!.slice(1));

    for (const target of targets) {
      expect(ids(policy)).toContain(target);
    }
  });

  test("leads every link to a page of the site to a public page in its locale", () => {
    const pages = runs(policy)
      .map(runHref)
      .filter((href) => href?.startsWith("/"));

    for (const href of pages) {
      expect(publicPaths.map((path) => localizedPath(locale, path))).toContain(href);
    }
  });

  test("does not link to the old address of the return policy", () => {
    expect(runs(policy).map(runHref)).not.toContain("http://www.lockmx.com/return-policy");
  });

  // The page heading is the h1, so the text starts at h2 and never skips one.
  test("skips no heading level", () => {
    let previous = 1;
    for (const block of policy.blocks) {
      if (block.kind !== "heading") continue;
      expect(block.level).toBeLessThanOrEqual(previous + 1);
      previous = block.level;
    }
  });

  test("leaves no text empty", () => {
    for (const block of policy.blocks) {
      for (const text of blockTexts(block)) {
        if (block.kind === "table") continue; // a table cell may be empty
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });
});

describe.each(policies)("the translation of the %s policy", (name) => {
  test("follows the English text block by block", () => {
    expect(getPolicy(name, "pt").blocks.map(skeleton)).toEqual(
      getPolicy(name, "en").blocks.map(skeleton),
    );
  });
});

describe("policies", () => {
  test("are the privacy policy, the terms and the return policy", () => {
    expect(policies).toEqual(["privacy", "terms", "returns"]);
  });
});
