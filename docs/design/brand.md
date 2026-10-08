# Brand

## Logo

The logo is the client's artwork. It is never redrawn, recoloured, filtered, cropped or rebuilt from type. A variant that does not exist as a file is requested from the client's identity pack, not produced in CSS.

Rendered with the `Logo` component (`apps/web/src/components/ui/core/logo.tsx`), which serves these files from `apps/web/public/brand/logo/`:

| `variant` | Artwork | `tone="dark"` | `tone="light"` | `tone="mono"` |
|---|---|---|---|---|
| `lockup` | Wordmark with the "Modular System" tagline | `lockup-black-yellow.png` | `lockup-white-yellow.png` | `lockup-black-white.png` |
| `wide` | Lockup with the tagline offset | `lockup-wide-black-yellow.png` | `lockup-wide-white-yellow.png` | `lockup-wide-black-white.png` |
| `wordmark` | Wordmark only | `wordmark-black-yellow.png` | `wordmark-white-yellow.png` | `wordmark-black-white.png` |

- `dark` (black and yellow) goes on light surfaces, `light` (white and yellow) on inverse surfaces, `mono` (black and white) where yellow is not available.
- Minimum size: the lockup is used at 120px wide or more, because the tagline is not legible below that; smaller placements use the wordmark. Source: the imported `Logo.prompt.md` (2026-10-08). No minimum for the wordmark and no clear-space rule were supplied by the client or the design system; both are open.
- `alt` is required and comes from the dictionaries. When the logo is the only content of a link, `alt` names the destination.
- `sizes` is required and states the rendered width (for example `"160px"`). The files are 1400px wide and are always displayed much smaller, so without it the browser would download a far larger image than it shows. Source: `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (16.3.6, `sizes`), 2026-10-08.
- Size and placement are set with `className` (for example `h-8 w-auto`). As a direct child of a column flex container the image is stretched to the full width; add `self-start` (or another alignment) there.

## Assets

| Location | Content | Served |
|---|---|---|
| `apps/web/public/brand/logo/` | The nine cropped, transparent PNGs above, as exported by the design system (1400px wide). | yes |
| `logo/` at the repository root | The client's full identity pack (PNG, mockups, `.ai`, `.eps`). Git-ignored, for local consultation. | no |

Only what a page uses goes into `public/`, since everything there is public. The mockups are added when a page needs one.

## Display typeface

Status on 2026-10-08: **Barlow Condensed is a stand-in.** It was chosen by the design tool to echo the logo's slanted lettering and is loaded through `next/font/google` (ADR 0011).

The owner reported on 2026-10-08 that the typeface used for the logo is "Rushdriver italic". What is known:

- A typeface named "Rush Driver", with an italic file, is listed on DaFont under the author RantautypeStudio as "Free for personal use". The author's note there says the font is for personal use only, that commercial use is not allowed, and that a commercial licence is sold at `rantaustudio.com`. Source: https://www.dafont.com/rush-driver.font (2026-10-08).
- That this listing is the same typeface as the logo is inferred from the name. It has not been checked against the artwork.
- The author's own site could not be opened on 2026-10-08, so the licence types, whether one of them covers embedding in a website, and the price are not confirmed.
- No font file was supplied, and none is in the repository or in the identity pack.

Until the client holds a licence that covers use as a web font on a commercial site, and supplies the file obtained under that licence, the stand-in stays. A file downloaded from a font aggregator is not used. When the conditions are met, the font replaces Barlow Condensed through `next/font/local` in `layout.tsx`: the `--font-display` token keeps its name, so no component changes. Replacing the web font does not touch the logo files, which are images.

Open, for the client or the designer of the logo to confirm: that the logo artwork was produced under a commercial licence of the typeface. The listing above says the free file is for personal use only and that a licence bought after use is not accepted. This file records what the listing says; it is not a legal assessment.
