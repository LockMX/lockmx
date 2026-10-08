import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

// Compiles app/globals.css with the installed Tailwind and checks that the
// design tokens are the only theme (ADR 0009).
// Source for the API: node_modules/tailwindcss/dist/lib.d.mts (`compile`, `CompileOptions`).
const globalsPath = path.join(process.cwd(), "src/app/globals.css");
const require = createRequire(path.join(process.cwd(), "package.json"));

async function loadStylesheet(id: string, base: string) {
  const file =
    id === "tailwindcss"
      ? require.resolve("tailwindcss/index.css")
      : path.resolve(base, id);
  return {
    path: file,
    base: path.dirname(file),
    content: await readFile(file, "utf8"),
  };
}

const candidates = [
  "bg-red-500",
  "text-red-500",
  "text-xl",
  "rounded-lg",
  "shadow-xl",
  "font-extralight",
  "bg-surface-page",
  "bg-action-primary",
  "bg-yellow-50",
  "border-border-control",
  "text-text-strong",
  "text-strong",
  "text-sm",
  "text-display-xl",
  "font-display",
  "font-sans",
  "font-mono",
  "font-semibold",
  "leading-body",
  "tracking-label",
  "rounded-sm",
  "rounded-pill",
  "shadow-md",
  "ease-out",
  "p-4",
  "h-header",
  "px-gutter",
  "max-w-page",
];

let css: string;

beforeAll(async () => {
  const globals = await readFile(globalsPath, "utf8");
  const compiler = await compile(globals, {
    base: path.dirname(globalsPath),
    loadStylesheet,
  });
  css = compiler.build(candidates);
});

function ruleFor(utility: string): string | undefined {
  const selector = `.${utility} {`;
  const start = css.indexOf(selector);
  if (start === -1) return undefined;
  return css.slice(start, css.indexOf("}", start) + 1);
}

describe("default Tailwind theme", () => {
  it.each([
    "bg-red-500",
    "text-red-500",
    "text-xl",
    "rounded-lg",
    "shadow-xl",
    "font-extralight",
  ])("does not generate %s", (utility) => {
    expect(ruleFor(utility)).toBeUndefined();
  });
});

describe("token utilities", () => {
  it.each([
    ["bg-surface-page", "background-color: var(--surface-page)"],
    ["bg-action-primary", "background-color: var(--action-primary)"],
    ["bg-yellow-50", "background-color: var(--lmx-yellow-50)"],
    ["border-border-control", "border-color: var(--border-control)"],
    ["text-text-strong", "color: var(--text-strong)"],
    ["text-sm", "font-size: var(--text-sm)"],
    ["text-display-xl", "font-size: var(--text-display-xl)"],
    ["font-display", "font-family: var(--font-display)"],
    ["font-sans", "font-family: var(--font-sans)"],
    ["font-mono", "font-family: var(--font-mono)"],
    ["font-semibold", "font-weight: var(--weight-semibold)"],
    ["leading-body", "line-height: var(--leading-body)"],
    ["tracking-label", "letter-spacing: var(--tracking-label)"],
    ["rounded-sm", "border-radius: var(--radius-sm)"],
    ["rounded-pill", "border-radius: var(--radius-pill)"],
    ["shadow-md", "var(--shadow-md)"],
    ["ease-out", "transition-timing-function: var(--ease-out)"],
    ["p-4", "padding: calc(var(--space-1) * 4)"],
    ["h-header", "height: var(--header-height)"],
    ["px-gutter", "padding-inline: var(--container-pad)"],
    ["max-w-page", "max-width: var(--container-max)"],
  ])("%s resolves to its token", (utility, declaration) => {
    expect(ruleFor(utility)).toContain(declaration);
  });

  it("keeps colour text tokens out of the font-size utilities", () => {
    expect(ruleFor("text-strong")).toBeUndefined();
    expect(ruleFor("text-sm")).not.toContain("color:");
  });
});

// Boolean assertions keep a failure readable: matching against `css` directly
// would print the whole stylesheet.
function compiledCssMatches(pattern: RegExp): boolean {
  return pattern.test(css);
}

describe("compiled stylesheet", () => {
  it("has no custom property that refers to itself", () => {
    expect(compiledCssMatches(/(--[\w-]+)\s*:\s*var\(\1\)/)).toBe(false);
  });

  it("has no dark colour scheme block", () => {
    expect(compiledCssMatches(/prefers-color-scheme/)).toBe(false);
  });

  it("draws the focus ring from the focus token", () => {
    expect(
      compiledCssMatches(/:focus-visible\s*\{[^}]*var\(--focus-ring\)/),
    ).toBe(true);
  });

  it("switches the focus ring on inverse surfaces", () => {
    expect(
      compiledCssMatches(
        /\[data-surface="?inverse"?\]\s*\{[^}]*--focus-ring:\s*var\(--focus-ring-inverse\)/,
      ),
    ).toBe(true);
  });

  it("removes motion when the user asks for reduced motion", () => {
    expect(compiledCssMatches(/prefers-reduced-motion:\s*reduce/)).toBe(true);
  });
});
