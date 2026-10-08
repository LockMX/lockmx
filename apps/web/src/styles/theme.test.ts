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
  "max-w-md",
  "drop-shadow-md",
  "inset-shadow-sm",
  "text-shadow-sm",
  "blur-md",
  "transition-colors",
  "animate-spin",
  "sm:px-gutter",
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
  "font-extrabold",
  "tracking-caps",
  "clip-slant",
  "clip-slant-sm",
  "before:clip-slant",
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
    "max-w-md",
    "drop-shadow-md",
    "inset-shadow-sm",
    "text-shadow-sm",
    "blur-md",
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
    ["font-extrabold", "font-weight: var(--weight-extrabold)"],
    ["tracking-caps", "letter-spacing: var(--tracking-caps)"],
    ["clip-slant", "var(--slant-cut) 0,"],
    ["clip-slant-sm", "var(--slant-cut-sm) 0,"],
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

  it("runs a transition without an explicit duration on the motion tokens", () => {
    const rule = ruleFor("transition-colors");

    expect(rule).toContain("var(--duration-fast)");
    expect(rule).toContain("var(--ease-out)");
  });

  it("keeps the spin animation and the responsive variants", () => {
    expect(ruleFor("animate-spin")).toContain("animation:");
    expect(compiledCssMatches(/@media \(width >= 40rem\)/)).toBe(true);
  });

  it("sets no line height with a font size, so each size needs a leading", () => {
    expect(ruleFor("text-sm")).not.toContain("line-height");
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

  it("sizes type, spacing and layout in rem, so they follow the reader's font size", () => {
    expect(
      compiledCssMatches(
        /--(text|space|container|header)-[\w-]+:\s*[\d.]+px/,
      ),
    ).toBe(false);
    expect(compiledCssMatches(/--text-md:\s*1rem/)).toBe(true);
    expect(compiledCssMatches(/--space-1:\s*0\.25rem/)).toBe(true);
  });

  it("stops the page from scrolling behind a modal dialog", () => {
    expect(
      compiledCssMatches(/html:has\(dialog:modal\)\s*\{[^}]*overflow:\s*hidden/),
    ).toBe(true);
  });

  it("underlines links in their own text colour, not in yellow", () => {
    expect(
      compiledCssMatches(/\n\s*a\s*\{[^}]*text-decoration-color/),
    ).toBe(false);
    expect(
      compiledCssMatches(/\n\s*a\s*\{[^}]*text-decoration(-line)?:\s*underline/),
    ).toBe(true);
  });

  it("gives links on inverse surfaces a light colour and the yellow underline", () => {
    expect(
      compiledCssMatches(
        /\[data-surface="?inverse"?\] a\s*\{[^}]*color:\s*var\(--text-inverse\)[^}]*text-decoration-color:\s*var\(--lmx-yellow\)/,
      ),
    ).toBe(true);
  });

  it("removes motion when the user asks for reduced motion", () => {
    expect(compiledCssMatches(/prefers-reduced-motion:\s*reduce/)).toBe(true);
  });
});
