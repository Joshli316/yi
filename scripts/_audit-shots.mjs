import { chromium } from 'playwright';
const browser = await chromium.launch();
const url = 'https://yi-1ot.pages.dev/';
const targets = [
  { w: 375, h: 700, name: 'mobile' },
  { w: 768, h: 800, name: 'tablet' },
  { w: 1280, h: 900, name: 'desktop' },
];
const errors = [];
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: t.w, height: t.h } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${t.name}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${t.name}] PAGEERROR: ${e.message}`));
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${t.name}] HTTP ${r.status()}: ${r.url()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
    horizontal: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  console.log(`[${t.name} ${t.w}x${t.h}] doc=${overflow.docW} win=${overflow.winW} horizontalScroll=${overflow.horizontal}`);
  await page.screenshot({ path: `_dev-screens/audit-${t.name}.png`, fullPage: true });
  await ctx.close();
}
if (errors.length) { console.log('\nERRORS:'); errors.forEach(e => console.log(' -', e)); }
else { console.log('\nNo errors.'); }
await browser.close();
