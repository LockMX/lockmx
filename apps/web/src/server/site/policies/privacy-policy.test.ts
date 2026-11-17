import { describe, expect, test } from "vitest";
import { locales } from "@/lib/i18n/config";
import {
  blockTexts,
  runHref,
  type PolicyBlock,
  type PolicyDocument,
  type PolicyRun,
} from "@/lib/site/policy-document";
import { getPrivacyPolicy } from "@/server/site/policies/privacy-policy";

function runs(document: PolicyDocument): PolicyRun[] {
  return document.blocks.flatMap((block) => blockTexts(block).flat());
}

function ids(document: PolicyDocument): string[] {
  return document.blocks.flatMap((block) => (block.id ? [block.id] : []));
}

// What a translation must keep: the blocks, their ids and levels, and in each
// text the same runs with the same marks and addresses.
function skeleton(block: PolicyBlock) {
  return {
    kind: block.kind,
    id: block.id,
    level: block.kind === "heading" ? block.level : undefined,
    texts: blockTexts(block).map((text) =>
      text.map((run) =>
        typeof run === "string" ? "text" : { strong: run.strong, em: run.em, href: run.href },
      ),
    ),
  };
}

describe.each(locales)("the privacy policy in %s", (locale) => {
  const policy = getPrivacyPolicy(locale);

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

    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(ids(policy)).toContain(target);
    }
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

describe("the translation of the privacy policy", () => {
  test("follows the English text block by block", () => {
    expect(getPrivacyPolicy("pt").blocks.map(skeleton)).toEqual(
      getPrivacyPolicy("en").blocks.map(skeleton),
    );
  });
});
