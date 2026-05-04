// ============================================
// Yi 易 — bilingual toggle
// Pattern adapted from MaDao: localStorage-persisted,
// updates html[lang] in init AND on toggle.
// ============================================

const LS_KEY = 'yi:lang';
let currentLang = 'zh';

const STRINGS = {
  // Hero — "Yi 易" stays bilingual-fixed (zine treatment)
  hero_glyph: { zh: '易', en: '易' },
  hero_yi: { zh: 'Yi', en: 'Yi' },
  hero_tagline_cn: { zh: '把难事变易', en: '把难事变易' },
  hero_tagline_en: { zh: 'Make hard things easy.', en: 'Make hard things easy.' },
  hero_pitch: {
    zh: '四个免费、双语、不收集个人信息的工具——为在美国念书的国际学生打造。报税、保险、工作授权、移民。每一个都是你需要时翻开的那一本说明书。',
    en: 'Four free, bilingual, no-tracking tools for international students in the US. Taxes, insurance, work authorization, immigration. Each one is the manual you reach for when you actually need it.',
  },
  hero_meta: { zh: '免费 · 无登录 · 双语', en: 'Free · No login · Bilingual' },
  hero_cta: { zh: '看看四个工具 ↓', en: 'See the four tools ↓' },

  // Section labels
  apps_label: { zh: '工具 · The Tools', en: 'The Tools · 工具' },
  why_label: { zh: '为什么是 Yi · Why Yi', en: 'Why Yi · 为什么是 Yi' },
  faq_label: { zh: '常见问题 · FAQ', en: 'FAQ · 常见问题' },

  // Card UI
  card_use_when: { zh: '什么时候用', en: 'Use when' },
  card_open: { zh: '打开 →', en: 'Open →' },

  // Why-Yi section
  why_h2: { zh: '一个家族，四个工具', en: 'One family, four tools' },
  why_lede: {
    zh: '在美国念书有许多看不懂的系统——税法、保险、工作签证、移民排期。Yi 把每一个都拆成一个独立的小工具，免费、双语、不需要登录。你只要在需要的那一刻打开对应的那一本就好。',
    en: 'Studying in the US means navigating a lot of opaque systems — tax law, insurance, work visas, immigration backlogs. Yi breaks each one down into a small standalone tool — free, bilingual, no login. Open whichever one you need, when you need it.',
  },
  why_p1_h: { zh: '为留学生打造', en: 'Made for international students' },
  why_p1_b: {
    zh: '每个工具都默认非美国公民、F-1/J-1 身份、对美国体制不熟。例子用的是「我」不是「你应该」。',
    en: 'Every tool assumes you\'re a non-citizen, F-1/J-1 status, new to US systems. Examples use "I" not "you should."',
  },
  why_p2_h: { zh: '不存任何数据', en: 'No data leaves your device' },
  why_p2_b: {
    zh: '所有计算都在浏览器里跑。没有账号、没有 Cookie、没有分析脚本。关掉网页，数据就消失。',
    en: 'Everything runs in your browser. No accounts, no cookies, no analytics. Close the tab, the data is gone.',
  },
  why_p3_h: { zh: '不是法律建议', en: 'Not legal advice' },
  why_p3_b: {
    zh: '我们解释、计算、对比、生成检查清单。重大决定请咨询持证的会计师 / 律师 / DSO。',
    en: 'We explain, calculate, compare, and checklist. For consequential decisions, consult a licensed CPA, attorney, or DSO.',
  },
  why_p4_h: { zh: '一个人做的', en: 'Built by one person' },
  why_p4_b: {
    zh: '用 Claude Code 一个人做出来的。如果发现错误或想要新功能，欢迎 GitHub 提 issue。',
    en: 'Built by one person using Claude Code. Found a bug or want a feature? Open a GitHub issue.',
  },

  // FAQ
  faq_q1: { zh: '为什么叫「易」？', en: 'Why "Yi 易"?' },
  faq_a1: {
    zh: '「易」在中文里既是「容易」，也是变化、流动的意思。这四个工具想做的就是把复杂、令人焦虑的系统变得简单一点。',
    en: '"Yi 易" means both "easy" and "change/flow." These four tools try to make complex, anxiety-inducing systems just a little simpler.',
  },
  faq_q2: { zh: '我必须四个都用吗？', en: 'Do I have to use all four?' },
  faq_a2: {
    zh: '不必。每个工具都是独立的——按需取用。多数人在不同人生阶段会陆续用到不同的工具。',
    en: 'No. Each tool is standalone — use whatever you need. Most people will reach for different tools at different life stages.',
  },
  faq_q3: { zh: '这些是法律 / 税务 / 医疗建议吗？', en: 'Are these legal / tax / medical advice?' },
  faq_a3: {
    zh: '不是。这些工具帮你理解规则、做计算、生成检查清单。重要决定请咨询持牌专业人士（CPA、律师、医生、DSO）。',
    en: 'No. These tools help you understand rules, do calculations, and generate checklists. For consequential decisions, consult a licensed professional (CPA, attorney, doctor, DSO).',
  },
  faq_q4: { zh: '我的数据会被存吗？', en: 'Is my data stored anywhere?' },
  faq_a4: {
    zh: '不会。所有计算都在你的浏览器本地跑——没有服务器、没有账号、没有 Cookie、没有分析脚本。关掉标签页，数据就清空。',
    en: 'No. Everything runs locally in your browser — no server, no account, no cookies, no analytics. Close the tab and the data is gone.',
  },
  faq_q5: { zh: '为什么免费？', en: 'Why is this free?' },
  faq_a5: {
    zh: '因为这本来就该免费。市面上的同类工具多数是把基础信息收费打包卖给最焦虑的那群人。Yi 的目标是让你不需要付钱也能搞清楚自己的处境。',
    en: 'Because it should be free. Most paid alternatives wrap basic information into a service sold to the most anxious users. Yi exists so you can understand your situation without paying.',
  },
  faq_q6: { zh: '这是谁做的？', en: 'Who built this?' },
  faq_a6: {
    zh: '一个用 Claude Code 自己学编程的留学生。这四个工具都是我做的——这个 hub 把它们串成一个家族。',
    en: 'A student who learned to code with Claude Code. I built all four — this hub stitches them into a family.',
  },

  // Footer
  footer_built: { zh: '用 Claude Code 搭建', en: 'Built with Claude Code' },
  footer_github: { zh: 'GitHub', en: 'GitHub' },

  // a11y
  a11y_skip: { zh: '跳到主内容', en: 'Skip to main content' },
  a11y_lang_toggle: { zh: '切换到英文', en: 'Switch to Chinese' },
};

export function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] || entry.en || key;
}

export function getLang() {
  return currentLang;
}

export function setLanguage(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try { localStorage.setItem(LS_KEY, lang); } catch {}
  applyTranslations();
  document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang } }));
}

export function toggleLanguage() {
  setLanguage(currentLang === 'zh' ? 'en' : 'zh');
}

export function initI18n() {
  let stored = null;
  try { stored = localStorage.getItem(LS_KEY); } catch {}
  // Default: Chinese (per global CLAUDE.md), unless user previously chose English.
  currentLang = stored === 'en' ? 'en' : 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  applyTranslations();
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  // Toggle reflects the CURRENT language (per project rule).
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = currentLang === 'zh' ? '中' : 'EN';
    toggleBtn.setAttribute('aria-label', t('a11y_lang_toggle'));
  }
}
