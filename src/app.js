// ============================================
// Yi 易 — entry
// ============================================

import { initI18n, applyTranslations, toggleLanguage } from './i18n.js';
import { renderApps } from './render.js';

function init() {
  initI18n();
  renderApps(document.getElementById('apps'));
  applyTranslations();

  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.addEventListener('click', () => toggleLanguage());

  // Smooth-scroll for the hero CTA
  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const sel = el.getAttribute('data-scroll-to');
      if (!sel) return;
      const target = document.querySelector(sel);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
