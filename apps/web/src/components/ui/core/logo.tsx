import Image, { type ImageProps } from "next/image";

type LogoVariant = "lockup" | "wide" | "wordmark";
type LogoTone = "dark" | "light" | "mono";

// The official artwork, served from public/brand/logo. It is never redrawn or
// recoloured: a new look means a new file from the client's identity pack.
// Width and height are the pixel size of each file, so the browser reserves
// the right space before the image loads.
const LOGO_SHAPES: Record<
  LogoVariant,
  { file: string; width: number; height: number }
> = {
  lockup: { file: "lockup", width: 1400, height: 376 },
  wide: { file: "lockup-wide", width: 1400, height: 377 },
  wordmark: { file: "wordmark", width: 1400, height: 293 },
};

const TONE_COLOURS: Record<LogoTone, string> = {
  dark: "black-yellow",
  light: "white-yellow",
  mono: "black-white",
};

export type LogoProps = Omit<
  ImageProps,
  "src" | "width" | "height" | "fill" | "style" | "alt" | "sizes"
> & {
  /** `lockup` has the "Modular System" tagline, `wide` offsets it, `wordmark` has none. */
  variant?: LogoVariant;
  /** `dark` for light surfaces, `light` for inverse surfaces, `mono` is black and white. */
  tone?: LogoTone;
  alt: string;
  /** Rendered width, for example `"160px"`: the logo is always sized with CSS. */
  sizes: string;
};

export function Logo({
  variant = "wordmark",
  tone = "dark",
  alt,
  ...imageProps
}: LogoProps) {
  const { file, width, height } = LOGO_SHAPES[variant];

  return (
    <Image
      {...imageProps}
      src={`/brand/logo/${file}-${TONE_COLOURS[tone]}.png`}
      width={width}
      height={height}
      alt={alt}
    />
  );
}
