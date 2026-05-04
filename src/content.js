// ============================================
// Yi 易 — App metadata
// Single source of truth. Update here, not in HTML.
// ============================================

export const YI_APPS = [
  {
    id: 'shuiyi',
    cn: '税易',
    py: 'ShuiYi',
    titleZh: '报税不再难',
    titleEn: 'Tax Made Easy',
    blurbZh: 'NRA/RA 身份判定、Form 8843、税收协定、FICA 退款。',
    blurbEn: 'NRA/RA status, Form 8843, treaty benefits, FICA refunds.',
    useWhenZh: '报税季 · 第一次报税 · 搞不清协定',
    useWhenEn: 'Tax season · First-time filer · Treaty confusion',
    url: 'https://shuiyi.pages.dev/',
    thumb: 'public/thumbs/shuiyi.jpg',
  },
  {
    id: 'baoyi',
    cn: '保易',
    py: 'BaoYi',
    titleZh: '保险一目了然',
    titleEn: 'Insurance Made Easy',
    blurbZh: 'Waiver 资格、J-1 合规、计划对比、账单解读。',
    blurbEn: 'Waiver eligibility, J-1 compliance, plan comparison, bill decoding.',
    useWhenZh: '入学注册 · 选保险 · 收到一张看不懂的账单',
    useWhenEn: 'Enrolling · Picking a plan · Got a confusing bill',
    url: 'https://baoyi.pages.dev/',
    thumb: 'public/thumbs/baoyi.jpg',
  },
  {
    id: 'gongyi',
    cn: '工易',
    py: 'GongYi',
    titleZh: '工作授权不踩雷',
    titleEn: 'Work Auth Made Easy',
    blurbZh: 'OPT 失业天数追踪、STEM 资格、I-983、关键截止日历。',
    blurbEn: 'OPT unemployment tracking, STEM eligibility, I-983, deadline calendar.',
    useWhenZh: '在 OPT 期间 · 找工作 · 申请 STEM 延期',
    useWhenEn: 'On OPT · Job searching · STEM extension',
    url: 'https://gongyi-opt.pages.dev/',
    thumb: 'public/thumbs/gongyi.jpg',
  },
  {
    id: 'luyi',
    cn: '路易',
    py: 'LuYi',
    titleZh: '走出一条移民路',
    titleEn: 'Path Made Easy',
    blurbZh: 'H-1B 抽签胜率、O-1 自评、EB 类对比、绿卡排期。',
    blurbEn: 'H-1B lottery odds, O-1 self-assessment, EB comparison, green-card backlog.',
    useWhenZh: 'OPT 之后 · H-1B 没中 · 长期规划',
    useWhenEn: 'After OPT · H-1B miss · Long-term planning',
    url: 'https://luyi.pages.dev/',
    thumb: 'public/thumbs/luyi.jpg',
  },
];

export function findApp(id) {
  return YI_APPS.find((a) => a.id === id);
}
