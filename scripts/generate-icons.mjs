// Generates PWA icons from an inline SVG. Run: npm run icons
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const BG = "#0b0d17";
const MOON = "#efe6d2";
const GOLD = "#d6b578";

// Crescent mark on the night background. `pad` shrinks the art into the maskable safe zone (80% circle).
const art = (pad) => {
  const s = 512, c = s / 2, r = (s / 2 - pad) * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#1c2140"/><stop offset="1" stop-color="${BG}"/></radialGradient>
    <mask id="m"><rect width="${s}" height="${s}" fill="white"/><circle cx="${c + r * 0.42}" cy="${c - r * 0.3}" r="${r * 0.86}" fill="black"/></mask>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#g)"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="${MOON}" mask="url(#m)"/>
  <circle cx="${c + r * 0.78}" cy="${c - r * 0.74}" r="${r * 0.09}" fill="${GOLD}"/>
</svg>`;
};
const mono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" d="M256 96a160 160 0 1 0 155 197A136 136 0 0 1 216 101a161 161 0 0 1 40-5Z"/></svg>`;

mkdirSync("public/icons", { recursive: true });
const any = Buffer.from(art(40));
const maskable = Buffer.from(art(110));
const out = [
  ["public/icons/icon-192.png", any, 192],
  ["public/icons/icon-512.png", any, 512],
  ["public/icons/maskable-192.png", maskable, 192],
  ["public/icons/maskable-512.png", maskable, 512],
  ["public/apple-touch-icon.png", maskable, 180],
];
for (const [file, svg, size] of out) await sharp(svg).resize(size, size).png().toFile(file);
writeFileSync("public/favicon.svg", art(20));
writeFileSync("public/icons/monochrome.svg", mono);
// 48px ICO (PNG-in-ICO).
const png48 = await sharp(any).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6); header.writeUInt8(48, 7); header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png48.length, 14); header.writeUInt32LE(22, 18);
writeFileSync("public/favicon.ico", Buffer.concat([header, png48]));
// Social preview.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${BG}"/>
<g transform="translate(150 95) scale(0.86)">${art(40).replace(/<\/?svg[^>]*>/g, "").replace('<rect width="512" height="512" fill="url(#g)"/>', "")}</g>
<text x="640" y="300" font-family="Georgia, serif" font-size="96" fill="${MOON}">Calwiz</text>
<text x="644" y="370" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#a0a3b8">Moon, sky and numbers for every day</text></svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og-image.png");
console.log("icons written");
