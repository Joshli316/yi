// Self-contained smoke test for the Yi hub.
// Boots a Node http server over the project root, runs Playwright assertions,
// exits 0 on pass / 1 on fail. No external dev-server needed.
//
// Run: npm run test:smoke
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

function startServer() {
  return new Promise((resolveStart) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://x');
        let path = decodeURIComponent(url.pathname);
        if (path === '/' || path.endsWith('/')) path += 'index.html';
        const full = join(ROOT, path);
        if (!full.startsWith(ROOT)) { res.writeHead(403).end(); return; }
        const s = await stat(full).catch(() => null);
        if (!s || !s.isFile()) { res.writeHead(404).end(); return; }
        const data = await readFile(full);
        res.writeHead(200, { 'Content-Type': MIME[extname(full).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      } catch { res.writeHead(500).end(); }
    });
    server.listen(0, '127.0.0.1', () => resolveStart({ server, port: server.address().port }));
  });
}

const fail = (msg) => { console.error(`✗ ${msg}`); failed = true; };
const ok = (msg) => console.log(`✓ ${msg}`);
let failed = false;

const { server, port } = await startServer();
const base = `http://127.0.0.1:${port}`;
console.log(`booted server on ${base}`);

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const httpErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) httpErrors.push(`HTTP ${r.status()}: ${r.url()}`); });

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });

  // 1. Hero stable taglines render.
  const cn = (await page.textContent('.hero-tagline-cn'))?.trim();
  const en = (await page.textContent('.hero-tagline-en'))?.trim();
  cn === '把难事变易' ? ok('hero CN tagline') : fail(`hero CN tagline = "${cn}"`);
  en === 'Make hard things easy.' ? ok('hero EN tagline') : fail(`hero EN tagline = "${en}"`);

  // 2. All 4 app cards render.
  const cards = await page.$$('article.card[data-app]');
  cards.length === 4 ? ok('4 app cards rendered') : fail(`expected 4 cards, got ${cards.length}`);

  // 3. Lang toggle swaps the hero pitch + apps heading.
  const pitchBefore = (await page.textContent('[data-i18n="hero_pitch"]'))?.trim();
  const appsHeadBefore = (await page.textContent('#apps-heading'))?.trim();
  await page.click('#lang-toggle');
  await page.waitForTimeout(150);
  const pitchAfter = (await page.textContent('[data-i18n="hero_pitch"]'))?.trim();
  const appsHeadAfter = (await page.textContent('#apps-heading'))?.trim();
  pitchBefore && pitchAfter && pitchBefore !== pitchAfter
    ? ok('lang toggle swaps hero pitch')
    : fail('lang toggle did not swap hero pitch');
  appsHeadAfter === 'Four tools, one family.'
    ? ok('apps heading swaps to EN')
    : fail(`apps heading after toggle = "${appsHeadAfter}"`);

  // 4. html[lang] flipped after toggle.
  const langAttr = await page.getAttribute('html', 'lang');
  langAttr === 'en' ? ok('html[lang]="en" after toggle') : fail(`html[lang]="${langAttr}" after toggle`);

  // 5. No console errors, no 4xx.
  consoleErrors.length === 0 ? ok('zero console errors') : fail(`${consoleErrors.length} console errors:\n  ${consoleErrors.join('\n  ')}`);
  httpErrors.length === 0 ? ok('zero 4xx/5xx responses') : fail(`${httpErrors.length} HTTP errors:\n  ${httpErrors.join('\n  ')}`);
} finally {
  await browser.close();
  server.close();
}

if (failed) { console.error('\nsmoke test FAILED'); process.exit(1); }
console.log('\nsmoke test PASSED');
