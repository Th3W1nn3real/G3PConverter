# G3P Converter

[![CI](https://github.com/Th3W1nn3real/G3PConverter/actions/workflows/ci.yml/badge.svg)](https://github.com/Th3W1nn3real/G3PConverter/actions/workflows/ci.yml) [**→ Try it online**](https://g3p-converter.vercel.app)

A small, focused converter for producing `.g3p` still-picture files from PNG and JPEG
images — a personal remix of [CasPCE](https://github.com/mdanishharoon/CasPCE) by
mdanishharoon (MIT licensed).

No Casio Picture Conversion Engine required: no virtual machines, no platform quirks,
no license keys. Load images, preview them on an fx-CG50 frame, and download `.g3p`
files — some of the last calculations happen entirely in your browser.

The current implementation targets the simple 16-bit `3C1B` `.g3p` variant:

- 384×192 pixels, the fx-CG screen size.
- RGB565 pixels, two bytes per pixel.
- Raw DEFLATE-compressed image data.
- Adler-32 checksum over the uncompressed RGB565 bytes.
- Casio's per-byte payload obfuscation.
- No extra `CP0100`/`CAPTURE` footer metadata.

## Highlights

- **Fully browser-based** — images never leave the device.
- **Multi-image batch** — load several files and export all of them as a ZIP.
- **Quality presets** — Photo Smooth, Photo Crisp, Diagram, Text, and Pixel art.
- **Advanced tuning** — dithering, sharpening, contrast, saturation, brightness,
  smooth resize, and progressive downsampling.
- **Bilingual UI** — English and Italian, switchable in the header.

# Running Locally

## Requirements

- **Node.js 20.19+ or 22.12+** (or **Bun 1.x**, which the project was built with) — needed only for the web app
- **Python 3.9+** — only for the command-line converter
- No accounts, no API keys, no calculator connection: everything runs locally

## Web App

```sh
bun install
bun run dev
```

No Bun installed? Plain npm works the same way:

```sh
npm install
npm run dev
```

Then open the local Vite URL and load a PNG or JPEG. The app previews the
384×192 calculator frame and generates a downloadable `.g3p` entirely in the
browser. Native raw DEFLATE is used when available, with a bundled `fflate`
fallback for broader browser support.

You can also load multiple PNG/JPEG files at once. The selected image is shown
in the preview, and the **Download ZIP** action exports every loaded image as a
separate `.g3p` using the currently selected fit, preset, and tuning recipe.

The browser app includes quality profiles for common source types:

- **Photo**: progressive resize, light sharpening, and RGB565 dithering.
- **Diagram**: sharper edges for charts, maps, and UI captures.
- **Text**: higher contrast and edge sharpening for dense screenshots.
- **Pixel art**: nearest-neighbor scaling with no smoothing.

For production:

```sh
bun run build
bun run preview
```

Vercel can deploy this as a standard Vite app. Import the repo, use `bun install`
as the install command, `bun run build` as the build command, and `dist` as the
output directory. If you use the Vercel CLI, upgrade first for best compatibility:

```sh
npm i -g vercel@latest
# or
pnpm add -g vercel@latest
```

## Languages

The web UI ships in English and Italian. Use the language toggle in the header;
the choice is stored in the browser and restored on the next visit.

## Python CLI

First, make sure Pillow is installed:

```sh
pip install -r requirements.txt
```

```sh
python3 -m g3p_converter input.png output.g3p
python3 -m g3p_converter input.jpg output.g3p --fit contain --background '#f3efe6'
python3 -m g3p_converter input.png output.g3p --fit cover
```

The output is always a 384×192 16-bit color `.g3p` still image.

# Research Notes

Useful references:

- Cemetech's reverse-engineering thread: https://www.cemetech.net/forum/viewtopic.php?t=10560&start=0
- Cemetech SourceCoder, which supports `.g3p` parsing and 3-bit/16-bit export: https://www.cemetech.net/sc/
- Casio's official loadable `.g3p` examples: https://edu.casio.com/products/supportinformation/
- WikiPrizm bitmap notes, including RGB565 screen/background data: https://prizm.cemetech.net/OS_Information/Bitmaps/

The converter intentionally generates the simpler no-footer form described in the
Cemetech thread because it avoids the more complex variants while still matching
the accepted still-picture structure.

# Credits

- Original project: [CasPCE](https://github.com/mdanishharoon/CasPCE) by
  [mdanishharoon](https://github.com/mdanishharoon) — the conversion core and the
  design groundwork come from there.
- Format research: the Cemetech and WikiPrizm communities.

# License

[MIT](LICENSE) © Th3W1nn3real, based on CasPCE © mdanishharoon.
