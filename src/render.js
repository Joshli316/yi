// ============================================
// Yi 易 — DOM rendering for app cards
// Reads from content.js, renders into #apps.
// CSP-safe: no inline event handlers.
// ============================================

import { YI_APPS } from './content.js';
import { getLang } from './i18n.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function thumbHtml(app) {
  const path = `/${app.thumb}`;
  return `
    <div class="thumb-frame">
      <div class="thumb-placeholder" aria-hidden="true">${escapeHtml(app.cn)} · ${escapeHtml(app.py)}</div>
      <img src="${escapeHtml(path)}" alt="${escapeHtml(app.cn)} ${escapeHtml(app.py)}" loading="lazy">
    </div>`;
}

function cardHtml(app) {
  return `
    <article class="card flex flex-col" data-app="${escapeHtml(app.id)}">
      <a href="${escapeHtml(app.url)}" class="card-thumb-link no-underline" aria-label="${escapeHtml(app.titleEn)}">
        ${thumbHtml(app)}
      </a>
      <div class="p-7 flex-1 flex flex-col gap-4">
        <header class="flex items-baseline gap-2 flex-wrap">
          <h3 class="card-title leading-none">
            <span class="font-cn">${escapeHtml(app.cn)}</span>
            <span class="font-en italic ml-1">${escapeHtml(app.py)}</span>
          </h3>
        </header>
        <p class="card-blurb">
          <span data-app-title class="block font-medium mb-1">${escapeHtml(app.titleZh)}</span>
          <span data-app-blurb class="text-soft">${escapeHtml(app.blurbZh)}</span>
        </p>
        <p class="card-when mt-auto">
          <em class="not-italic eyebrow block mb-1" data-i18n="card_use_when">什么时候用</em>
          <span data-app-when>${escapeHtml(app.useWhenZh)}</span>
        </p>
        <div class="pt-2">
          <a class="btn-gold inline-flex items-center" href="${escapeHtml(app.url)}" data-i18n="card_open">打开 →</a>
        </div>
      </div>
    </article>`;
}

export function renderApps(mountEl) {
  if (!mountEl) return;
  mountEl.innerHTML = `
    <div class="apps-grid">
      ${YI_APPS.map(cardHtml).join('')}
    </div>`;
  // Hide broken thumbnails so the placeholder shows through (CSP-safe).
  mountEl.querySelectorAll('.thumb-frame img').forEach((img) => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  });
  refreshDynamicI18n();
  document.addEventListener('lang:changed', refreshDynamicI18n);
}

function refreshDynamicI18n() {
  const lang = getLang();
  document.querySelectorAll('[data-app]').forEach((card) => {
    const id = card.getAttribute('data-app');
    const app = YI_APPS.find((a) => a.id === id);
    if (!app) return;
    const titleEl = card.querySelector('[data-app-title]');
    if (titleEl) titleEl.textContent = lang === 'zh' ? app.titleZh : app.titleEn;
    const blurbEl = card.querySelector('[data-app-blurb]');
    if (blurbEl) blurbEl.textContent = lang === 'zh' ? app.blurbZh : app.blurbEn;
    const whenEl = card.querySelector('[data-app-when]');
    if (whenEl) whenEl.textContent = lang === 'zh' ? app.useWhenZh : app.useWhenEn;
  });
}
