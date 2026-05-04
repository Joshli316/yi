#!/usr/bin/env node
// ============================================
// Yi 易 — Thumbnail snapper
// Visit each of the 4 sibling apps, save 1600x900 thumbnails.
// Run: npm run snap (or: node scripts/snap-thumbs.mjs)
// ============================================

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/thumbs');

// JPEG for screenshot-y pages with photos/gradients (smaller),
// PNG for pages dominated by flat colors / sharp text where PNG wins.
const TARGETS = [
  { id: 'shuiyi', url: 'https://shuiyi-5j5.pages.dev/', format: 'jpeg' },
  { id: 'baoyi',  url: 'https://baoyi.pages.dev/',      format: 'jpeg' },
  { id: 'gongyi', url: 'https://gongyi-opt.pages.dev/', format: 'jpeg' },
  { id: 'luyi',   url: 'https://luyi-3re.pages.dev/',   format: 'jpeg' },
];

const VIEWPORT = { width: 1600, height: 900 };

async function snapLive(page, target) {
  const ext = target.format === 'jpeg' ? 'jpg' : 'png';
  const file = resolve(OUT, `${target.id}.${ext}`);
  console.log(`→ ${target.id}: ${target.url}`);
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const opts = {
    path: file, fullPage: false,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    type: target.format === 'jpeg' ? 'jpeg' : 'png',
  };
  if (target.format === 'jpeg') opts.quality = 85;
  await page.screenshot(opts);
  console.log(`  saved ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  for (const t of TARGETS) {
    try { await snapLive(page, t); }
    catch (e) { console.error(`  ✗ ${t.id} failed: ${e.message}`); }
  }
  await browser.close();
  console.log('done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
