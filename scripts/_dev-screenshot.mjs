#!/usr/bin/env node
// Local dev tool — full-page screenshots at 4 widths against the local server.
// Run: python3 -m http.server 8765, then: node scripts/_dev-screenshot.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', '_dev-screens');
await mkdir(OUT, { recursive: true });

const BREAKS = [
  { w: 375,  h: 800,  name: 'mobile'  },
  { w: 768,  h: 1024, name: 'tablet'  },
  { w: 1024, h: 768,  name: 'desktop' },
  { w: 1440, h: 900,  name: 'wide'    },
];
const URL = process.env.URL || 'http://localhost:8765/';

const browser = await chromium.launch({ headless: true });
for (const b of BREAKS) {
  const ctx = await browser.newContext({ viewport: { width: b.w, height: b.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('PAGE-ERROR: ' + err.message));
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: resolve(OUT, `${b.name}-${b.w}.png`), fullPage: true });
  // Toggle to EN and snap again
  await page.click('#lang-toggle');
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(OUT, `${b.name}-${b.w}-en.png`), fullPage: true });
  console.log(`${b.name} (${b.w}×${b.h}): ${consoleErrors.length} console errors`);
  if (consoleErrors.length) consoleErrors.forEach((e) => console.log(`  ! ${e}`));
  await ctx.close();
}
await browser.close();
console.log(`done. screens in ${OUT}/`);
