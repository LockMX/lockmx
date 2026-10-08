import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Logo } from "@/components/ui/core/logo";

// next/image points `src` at its optimizer; the served file is the `url` parameter.
function sourceFile(image: HTMLElement): string | null {
  const src = image.getAttribute("src") ?? "";
  return new URL(src, "http://localhost").searchParams.get("url");
}

// A PNG stores its pixel width and height as big-endian integers at bytes 16 and 20.
// Source: https://www.w3.org/TR/png-3/#11IHDR
function pngSize(publicPath: string): { width: number; height: number } {
  const file = readFileSync(path.join(process.cwd(), "public", publicPath));
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

describe("Logo", () => {
  test.each([
    ["lockup", "dark", "/brand/logo/lockup-black-yellow.png"],
    ["lockup", "light", "/brand/logo/lockup-white-yellow.png"],
    ["lockup", "mono", "/brand/logo/lockup-black-white.png"],
    ["wide", "dark", "/brand/logo/lockup-wide-black-yellow.png"],
    ["wide", "light", "/brand/logo/lockup-wide-white-yellow.png"],
    ["wide", "mono", "/brand/logo/lockup-wide-black-white.png"],
    ["wordmark", "dark", "/brand/logo/wordmark-black-yellow.png"],
    ["wordmark", "light", "/brand/logo/wordmark-white-yellow.png"],
    ["wordmark", "mono", "/brand/logo/wordmark-black-white.png"],
  ] as const)(
    "%s in %s tone renders %s with the file's own dimensions",
    (variant, tone, file) => {
      render(<Logo variant={variant} tone={tone} alt="LockMX" sizes="160px" />);

      const image = screen.getByRole("img", { name: "LockMX" });
      const { width, height } = pngSize(file);

      expect(sourceFile(image)).toBe(file);
      expect(image.getAttribute("width")).toBe(String(width));
      expect(image.getAttribute("height")).toBe(String(height));
    },
  );

  test("defaults to the dark wordmark", () => {
    render(<Logo alt="LockMX" sizes="160px" />);

    expect(sourceFile(screen.getByRole("img"))).toBe(
      "/brand/logo/wordmark-black-yellow.png",
    );
  });

  test("takes its accessible name from the alt prop only", () => {
    render(<Logo alt="LockMX, página inicial" sizes="160px" />);

    expect(screen.getByRole("img").getAttribute("alt")).toBe(
      "LockMX, página inicial",
    );
  });

  test("passes the sizes hint and the layout class to the image", () => {
    render(<Logo alt="LockMX" sizes="160px" className="h-8 w-auto" />);

    const image = screen.getByRole("img");

    expect(image.getAttribute("sizes")).toBe("160px");
    expect(image.getAttribute("class")).toBe("h-8 w-auto");
  });

  // Checked by `pnpm typecheck`: the elements are built, never rendered.
  test("requires alt and sizes, and takes no style", () => {
    // @ts-expect-error alt is required: the page supplies the accessible name.
    const withoutAlt = <Logo sizes="160px" />;
    // @ts-expect-error sizes is required: the logo is always sized with CSS.
    const withoutSizes = <Logo alt="LockMX" />;
    // @ts-expect-error style is not a prop: visual rules come from classes.
    const withStyle = <Logo alt="LockMX" sizes="160px" style={{ opacity: 0.5 }} />;

    expect([withoutAlt, withoutSizes, withStyle]).toHaveLength(3);
  });
});
