import { readFile } from "node:fs/promises";
import sharp from "sharp";

const logo = await sharp(await readFile(new URL("../public/assets/logo-light.svg", import.meta.url)))
  .resize({ width: 310 }).png().toBuffer();
const artwork = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0b0b0d"/>
  <rect width="1200" height="8" fill="#f4c430"/>
  <rect y="8" width="12" height="622" fill="#da291c"/>
  <g font-family="Arial, sans-serif" fill="#f7f3ea">
    <text x="64" y="245" font-size="64" font-weight="700">Helping businesses make</text>
    <text x="64" y="325" font-size="64" font-weight="700" fill="#f4c430">better hiring decisions.</text>
    <text x="64" y="405" font-size="29">Permanent Recruitment. Retained Search.</text>
    <text x="64" y="451" font-size="29">Fractional Leadership. Market Intelligence &amp; Advisory.</text>
    <path d="M64 499H1136" stroke="#d8d2c4" stroke-opacity="0.3"/>
    <text x="64" y="557" font-size="27">Manchester-led. North West-rooted. UK-wide.</text>
  </g>
</svg>`);
const image = await sharp(artwork).composite([{ input: logo, left: 64, top: 57 }])
  .png({ compressionLevel: 9 }).toBuffer();
await sharp(image).toFile(new URL("../public/assets/essential-resourcing-social-2026.png", import.meta.url).pathname);
// Keep legacy image requests current while new metadata uses a fresh cache key.
await sharp(image).toFile(new URL("../public/assets/og-image.png", import.meta.url).pathname);
