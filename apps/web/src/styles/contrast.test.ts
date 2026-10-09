import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Guards the colour tokens against WCAG 2.1 AA contrast regressions.
// Sources:
// https://www.w3.org/TR/WCAG21/#contrast-minimum (1.4.3, 4.5:1 for text)
// https://www.w3.org/TR/WCAG21/#non-text-contrast (1.4.11, 3:1 for UI boundaries and focus)
// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
// https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
const TEXT_MINIMUM = 4.5;
const NON_TEXT_MINIMUM = 3;

const tokensCss = readFileSync(
  path.join(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

function readDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!declarations.has(name)) declarations.set(name, value.trim());
  }
  return declarations;
}

const declarations = readDeclarations(tokensCss);

function resolveHex(token: string): string {
  const value = declarations.get(token);
  if (value === undefined) throw new Error(`Token ${token} is not defined`);

  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (reference) return resolveHex(reference[1]);

  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Token ${token} does not resolve to a hex colour: ${value}`);
  }
  return value;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(firstHex: string, secondHex: string): number {
  const [lighter, darker] = [
    relativeLuminance(firstHex),
    relativeLuminance(secondHex),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function tokenContrast(foreground: string, background: string): number {
  return contrastRatio(resolveHex(foreground), resolveHex(background));
}

describe("contrast ratio formula", () => {
  it("gives 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("gives 1 for a colour on itself", () => {
    expect(contrastRatio("#FFB600", "#FFB600")).toBeCloseTo(1, 5);
  });
});

describe("text tokens meet 4.5:1 on the surfaces they are used on", () => {
  it.each([
    ["--text-strong", "--surface-page"],
    ["--text-strong", "--surface-subtle"],
    ["--text-strong", "--surface-sunken"],
    ["--text-body", "--surface-page"],
    ["--text-body", "--surface-subtle"],
    ["--text-body", "--surface-sunken"],
    ["--text-muted", "--surface-page"],
    ["--text-muted", "--surface-subtle"],
    ["--text-muted", "--surface-sunken"],
    ["--text-subtle", "--surface-page"],
    ["--text-subtle", "--surface-subtle"],
    ["--text-subtle", "--surface-sunken"],
    ["--text-accent", "--surface-page"],
    ["--text-accent", "--surface-subtle"],
    ["--text-accent", "--surface-sunken"],
    ["--text-inverse", "--surface-inverse"],
    ["--text-inverse", "--surface-inverse-raised"],
    ["--text-inverse-muted", "--surface-inverse"],
    ["--text-inverse-muted", "--surface-inverse-raised"],
    ["--text-on-accent", "--surface-accent"],
    // Tabs: the count of a tab that is not selected.
    ["--text-body", "--lmx-ink-200"],
    // DataTable: a row with a link, under the pointer.
    ["--text-body", "--lmx-yellow-50"],
    ["--text-strong", "--lmx-yellow-50"],
  ])("%s on %s", (foreground, background) => {
    expect(tokenContrast(foreground, background)).toBeGreaterThanOrEqual(
      TEXT_MINIMUM,
    );
  });
});

describe("action labels meet 4.5:1 in every state", () => {
  it.each([
    ["--text-on-accent", "--action-primary"],
    ["--text-on-accent", "--action-primary-hover"],
    ["--text-on-accent", "--action-primary-press"],
    ["--text-inverse", "--action-secondary"],
    ["--text-inverse", "--action-secondary-hover"],
    ["--lmx-white", "--status-danger"],
    ["--lmx-white", "--status-danger-hover"],
    ["--lmx-white", "--status-danger-press"],
  ])("%s on %s", (foreground, background) => {
    expect(tokenContrast(foreground, background)).toBeGreaterThanOrEqual(
      TEXT_MINIMUM,
    );
  });
});

// Warning is the exception: its fill is a yellow that carries black text, so
// its text colour is a separate token.
describe("status colours meet 4.5:1 as text, on their tint and as a solid fill", () => {
  it.each([
    ["--status-success", "--surface-page"],
    ["--status-success", "--status-success-bg"],
    ["--lmx-white", "--status-success"],
    ["--status-danger", "--surface-page"],
    ["--status-danger", "--status-danger-bg"],
    ["--status-warning-text", "--surface-page"],
    ["--status-warning-text", "--status-warning-bg"],
    ["--text-on-accent", "--status-warning"],
    ["--status-info", "--surface-page"],
    ["--status-info", "--status-info-bg"],
    ["--lmx-white", "--status-info"],
  ])("%s on %s", (foreground, background) => {
    expect(tokenContrast(foreground, background)).toBeGreaterThanOrEqual(
      TEXT_MINIMUM,
    );
  });
});

describe("focus rings and control boundaries meet 3:1", () => {
  it.each([
    ["--focus-ring", "--surface-page"],
    ["--focus-ring", "--surface-subtle"],
    ["--focus-ring", "--surface-sunken"],
    ["--focus-ring", "--surface-accent"],
    ["--focus-ring-inverse", "--surface-inverse"],
    ["--focus-ring-inverse", "--surface-inverse-raised"],
    ["--border-control", "--surface-page"],
    ["--border-control", "--surface-subtle"],
    ["--border-control", "--surface-sunken"],
    ["--border-strong", "--surface-page"],
    // Toast: the tone icons, on the black of the toast.
    ["--lmx-yellow", "--surface-inverse"],
    ["--status-success", "--surface-inverse"],
    ["--status-info", "--surface-inverse"],
    ["--status-danger", "--surface-inverse"],
  ])("%s on %s", (indicator, background) => {
    expect(tokenContrast(indicator, background)).toBeGreaterThanOrEqual(
      NON_TEXT_MINIMUM,
    );
  });
});
