// Central translation tables. Formula symbols (u, v, a, t, s, ω, T, f...) stay
// identical in both languages — that mirrors how Bengali-medium physics texts
// actually write equations. Only labels, connecting words, and units change.

export const UNIT_TR = {
  'm/s': { en: 'm/s', bn: 'মি/সে' },
  'm/s²': { en: 'm/s²', bn: 'মি/সে²' },
  s: { en: 's', bn: 'সে' },
  m: { en: 'm', bn: 'মি' },
  '°': { en: '°', bn: 'ডিগ্রি' },
  'rad/s': { en: 'rad/s', bn: 'রেড/সে' },
  Hz: { en: 'Hz', bn: 'হার্জ' },
  N: { en: 'N', bn: 'নিউটন' },
  kg: { en: 'kg', bn: 'কেজি' },
  '': { en: '', bn: '' },
};

export function unit(key, lang) {
  const u = UNIT_TR[key];
  return u ? u[lang] : key || '';
}

export const STR = {
  brandTagline: { en: 'Advanced kinematics, solved.', bn: 'উন্নত গতিবিদ্যার সমাধান, সহজে।' },
  quick: { en: 'Quick', bn: 'দ্রুত' },
  learn: { en: 'Learn', bn: 'শেখা' },
  modeHint: {
    en: 'Quick gives you the number. Learn shows the working, the graph, and the motion itself.',
    bn: 'দ্রুততে শুধু উত্তর পাবেন। শেখায় দেখবেন সমাধানের ধাপ, লেখচিত্র ও গতির অ্যানিমেশন।',
  },
  solveFor: { en: 'Solve for', bn: 'কী বের করবেন' },
  calculate: { en: 'Calculate', bn: 'হিসাব করুন' },
  stepByStep: { en: 'Step by step', bn: 'ধাপে ধাপে সমাধান' },
  given: { en: 'given', bn: 'প্রদত্ত' },
  comingSoon: { en: 'Coming in Phase 2', bn: 'পরবর্তী পর্বে আসছে' },
};

export function s(key, lang) {
  return STR[key][lang];
}

// All topics are now built (see MODULES in app.js); kept as an empty list so
// a future Phase 3 addition has a ready-made "coming soon" slot to reuse.
export const COMING_SOON = [];
