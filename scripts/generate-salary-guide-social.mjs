import { readFile } from "node:fs/promises";
import sharp from "sharp";

const logo = await sharp(await readFile(new URL("../public/assets/logo-light.svg", import.meta.url)))
  .resize({ width: 270 }).png().toBuffer();
const artwork = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0b0b0d"/>
  <rect width="1200" height="8" fill="#f4c430"/>
  <rect y="8" width="12" height="622" fill="#da291c"/>
  <g font-family="Arial, sans-serif" fill="#f7f3ea">
    <text x="64" y="235" font-size="54" font-weight="700">Manchester &amp; North West</text>
    <text x="64" y="320" font-size="72" font-weight="700">Marketing Salary Guide</text>
    <text x="64" y="414" font-size="88" font-weight="700" fill="#f4c430">2026</text>
    <path d="M64 474H1136" stroke="#d8d2c4" stroke-opacity="0.3"/>
    <text x="64" y="530" font-size="27">Salary guides are useful. They're not gospel.</text>
    <text x="64" y="578" font-size="22" fill="#d8d2c4">David Walsh | Essential Resourcing</text>
  </g>
</svg>`);
await sharp(artwork).composite([{ input: logo, left: 64, top: 57 }])
  .png({ compressionLevel: 9 })
  .toFile(new URL("../public/assets/salary-guide-2026-social.png", import.meta.url).pathname);
