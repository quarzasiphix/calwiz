// Dev helper: node scripts/screenshot.mjs <url> <out.png> [width] [height] [fullPage 1|0] [theme dark|light]
import { chromium } from "@playwright/test";
const [,, url, out, w = "390", h = "844", full = "1", theme = "dark"] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, timezoneId: "Europe/Warsaw", locale: "en-GB", colorScheme: theme });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: full === "1" });
if (errs.length) console.log("ERRORS:", errs.join("\n"));
await b.close();
