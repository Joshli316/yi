#!/usr/bin/env node
// Snap the LIVE Yi hub + click each card and confirm landing.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', '_dev-screens');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto('https://yi-1ot.pages.dev/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: resolve(OUT, 'live-yi-hub.png'), fullPage: true });

// Confirm chip on each linked sibling
const cards = await page.$$eval('article.card a[href*=".pages.dev"]', (els) =>
  Array.from(new Set(els.map((e) => e.href)))
);
console.log('Card URLs:', cards);
console.log('Errors:', errors.length);
errors.forEach((e) => console.log('  !', e));

for (const url of cards) {
  const p2 = await ctx.newPage();
  await p2.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await p2.waitForTimeout(1200);
  const chip = await p2.$('a[href*="yi-1ot.pages.dev"]');
  console.log(`  ${url} → chip ${chip ? '✓' : '✗ MISSING'}`);
  await p2.close();
}

await browser.close();
console.log('done');
