#!/usr/bin/env node
// Generate the Open Graph card at public/og.png (1200x630).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/og.png');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Inter:wght@600&family=JetBrains+Mono:wght@500&family=Noto+Sans+SC:wght@600;700&display=swap" rel="stylesheet">
<style>
html,body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden;}
body{
  position:relative;
  background:#FAFAF7;
  font-family:'Inter','Noto Sans SC',sans-serif;color:#1A1A1A;
}
.stage{
  position:absolute;inset:64px 80px 96px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:0.4em;text-transform:uppercase;color:#7A7A7A;margin:0 0 18px;}
.glyph-row{display:flex;align-items:baseline;gap:24px;margin:0;}
.glyph{font-family:'Noto Sans SC',sans-serif;font-size:240px;font-weight:700;line-height:1;color:#C99A2E;letter-spacing:0.02em;}
.yi{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;color:#4A4A4A;font-size:120px;}
.rule{border:0;height:2px;background:#C99A2E;width:80px;margin:28px auto 22px;}
.tag-cn{font-family:'Noto Sans SC',sans-serif;font-size:40px;font-weight:600;letter-spacing:0.06em;color:#1A1A1A;margin:0;}
.tag-en{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:32px;color:#4A4A4A;margin:6px 0 0;}
.row{position:absolute;bottom:40px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center;
  font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:0.18em;text-transform:uppercase;color:#7A7A7A;}
.row .pill{border:1.5px solid #1A1A1A;color:#1A1A1A;padding:8px 14px;border-radius:9999px;}
</style></head><body>
  <div class="stage">
    <p class="eyebrow">A Family · 一个家族</p>
    <div class="glyph-row">
      <span class="glyph">易</span>
      <span class="yi">Yi</span>
    </div>
    <hr class="rule">
    <p class="tag-cn">把难事变易</p>
    <p class="tag-en">Make hard things easy.</p>
  </div>
  <div class="row">
    <span>4 Tools · 4 个工具</span>
    <span class="pill">yi-1ot.pages.dev</span>
  </div>
</body></html>`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await mkdir(dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`saved ${OUT}`);
