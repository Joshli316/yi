#!/usr/bin/env node
// Spawn a static server for each of the 4 sibling apps' dist/, snap the header,
// confirm the "← Yi 易" chip is visible. Pass/fail per app.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', '_dev-screens');
await mkdir(OUT, { recursive: true });

const HOME = process.env.HOME;
const APPS = [
  { id: 'shuiyi', dir: `${HOME}/Desktop/Projects/ShuiYi/dist` },
  { id: 'baoyi',  dir: `${HOME}/Desktop/Projects/BaoYi/dist`  },
  { id: 'gongyi', dir: `${HOME}/Desktop/Projects/GongYi/dist` },
  { id: 'luyi',   dir: `${HOME}/Desktop/Projects/LuYi/dist`   },
];

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

function startServer(root, port) {
  return new Promise((res) => {
    const server = http.createServer((req, response) => {
      let p = req.url.split('?')[0];
      if (p === '/') p = '/index.html';
      const file = join(root, p);
      try {
        const data = fs.readFileSync(file);
        response.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'text/plain' });
        response.end(data);
      } catch {
        response.writeHead(404); response.end('not found');
      }
    });
    server.listen(port, () => res(server));
  });
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 240 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`[${msg.location().url}] ${msg.text()}`); });
page.on('pageerror', (err) => consoleErrors.push('PAGE-ERROR: ' + err.message));

for (let i = 0; i < APPS.length; i++) {
  const app = APPS[i];
  const port = 9000 + i;
  consoleErrors.length = 0;
  const server = await startServer(app.dir, port);
  try {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: resolve(OUT, `backlink-${app.id}.png`), clip: { x: 0, y: 0, width: 1280, height: 120 } });
    // Confirm chip exists by querying the DOM
    const chipFound = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="yi-suite.pages.dev"]'));
      return links.length > 0 ? links[0].textContent.trim().replace(/\s+/g, ' ') : null;
    });
    const status = chipFound ? `✓ chip: "${chipFound}"` : `✗ chip MISSING`;
    console.log(`${app.id.padEnd(7)} ${status}  (errors: ${consoleErrors.length})`);
    if (consoleErrors.length) consoleErrors.forEach((e) => console.log(`           ! ${e}`));
  } catch (e) {
    console.log(`${app.id} FAILED: ${e.message}`);
  } finally {
    server.close();
  }
}
await browser.close();
console.log(`\nheader screens in ${OUT}/backlink-*.png`);
