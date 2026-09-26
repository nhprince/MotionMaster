import { fmt, solveTimeFromDisplacement } from '../utils/math.js';
import { drawLineGraph } from '../utils/plot.js';
import { unit } from '../i18n.js';

// Symbol, label (both languages), and unit key for each SUVAT variable.
const VAR = {
  u: { label: { en: 'Initial velocity (u)', bn: 'প্রাথমিক বেগ (u)' }, unitKey: 'm/s' },
  v: { label: { en: 'Final velocity (v)', bn: 'শেষ বেগ (v)' }, unitKey: 'm/s' },
  a: { label: { en: 'Acceleration (a)', bn: 'ত্বরণ (a)' }, unitKey: 'm/s²' },
  t: { label: { en: 'Time (t)', bn: 'সময় (t)' }, unitKey: 's' },
  s: { label: { en: 'Displacement (s)', bn: 'সরণ (s)' }, unitKey: 'm' },
};

// Each candidate's `core` returns the equation text (symbols + numbers, no unit).
// The unit for the target variable is appended after, per language.
const FORMULAS = {
  v: [
    { needs: ['u', 'a', 't'], calc: (k) => k.u + k.a * k.t,
      core: (k, r) => `v = u + at = ${k.u} + (${k.a})(${k.t}) = ${fmt(r)}` },
    { needs: ['u', 'a', 's'], calc: (k) => Math.sqrt(Math.max(0, k.u * k.u + 2 * k.a * k.s)),
      core: (k, r) => `v = √(u² + 2as) = √(${k.u}² + 2(${k.a})(${k.s})) = ${fmt(r)}` },
    { needs: ['s', 't', 'u'], calc: (k) => (2 * k.s) / k.t - k.u,
      core: (k, r) => `v = 2s/t − u = 2(${k.s})/${k.t} − ${k.u} = ${fmt(r)}` },
  ],
  u: [
    { needs: ['v', 'a', 't'], calc: (k) => k.v - k.a * k.t,
      core: (k, r) => `u = v − at = ${k.v} − (${k.a})(${k.t}) = ${fmt(r)}` },
    { needs: ['v', 'a', 's'], calc: (k) => Math.sqrt(Math.max(0, k.v * k.v - 2 * k.a * k.s)),
      core: (k, r) => `u = √(v² − 2as) = √(${k.v}² − 2(${k.a})(${k.s})) = ${fmt(r)}` },
    { needs: ['s', 't', 'v'], calc: (k) => (2 * k.s) / k.t - k.v,
      core: (k, r) => `u = 2s/t − v = 2(${k.s})/${k.t} − ${k.v} = ${fmt(r)}` },
  ],
  a: [
    { needs: ['u', 'v', 't'], calc: (k) => (k.v - k.u) / k.t,
      core: (k, r) => `a = (v − u)/t = (${k.v} − ${k.u})/${k.t} = ${fmt(r)}` },
    { needs: ['u', 'v', 's'], calc: (k) => (k.v * k.v - k.u * k.u) / (2 * k.s),
      core: (k, r) => `a = (v² − u²)/2s = (${k.v}² − ${k.u}²)/2(${k.s}) = ${fmt(r)}` },
    { needs: ['u', 't', 's'], calc: (k) => (2 * (k.s - k.u * k.t)) / (k.t * k.t),
      core: (k, r) => `a = 2(s − ut)/t² = 2(${k.s} − ${k.u}×${k.t})/${k.t}² = ${fmt(r)}` },
  ],
  t: [
    { needs: ['u', 'v', 'a'], calc: (k) => (k.v - k.u) / k.a,
      core: (k, r) => `t = (v − u)/a = (${k.v} − ${k.u})/${k.a} = ${fmt(r)}` },
    { needs: ['u', 'v', 's'], calc: (k) => (2 * k.s) / (k.u + k.v),
      core: (k, r) => `t = 2s/(u + v) = 2(${k.s})/(${k.u} + ${k.v}) = ${fmt(r)}` },
    { needs: ['u', 'a', 's'], calc: (k) => solveTimeFromDisplacement(k.u, k.a, k.s),
      core: (k, r, lang) =>
        lang === 'bn'
          ? `s = ut + ½at² সমীকরণের ধনাত্মক মূল থেকে → t = ${fmt(r)}`
          : `s = ut + ½at² solved for the positive root → t = ${fmt(r)}` },
  ],
  s: [
    { needs: ['u', 't', 'a'], calc: (k) => k.u * k.t + 0.5 * k.a * k.t * k.t,
      core: (k, r) => `s = ut + ½at² = (${k.u})(${k.t}) + ½(${k.a})(${k.t})² = ${fmt(r)}` },
    { needs: ['u', 'v', 't'], calc: (k) => 0.5 * (k.u + k.v) * k.t,
      core: (k, r) => `s = ½(u + v)t = ½(${k.u} + ${k.v})(${k.t}) = ${fmt(r)}` },
    { needs: ['u', 'v', 'a'], calc: (k) => (k.v * k.v - k.u * k.u) / (2 * k.a),
      core: (k, r) => `s = (v² − u²)/2a = (${k.v}² − ${k.u}²)/2(${k.a}) = ${fmt(r)}` },
  ],
};

function trySolve(target, known, lang) {
  const candidates = FORMULAS[target].filter((c) => c.needs.every((n) => known[n] != null));
  if (candidates.length === 0) return null;
  const c = candidates[0];
  const value = c.calc(known);
  if (!Number.isFinite(value)) return null;
  const line = `${c.core(known, value, lang)} ${unit(VAR[target].unitKey, lang)}`;
  return { value, step: line };
}

function deriveAll(initialKnown, target, targetValue, lang) {
  const known = { ...initialKnown, [target]: targetValue };
  const steps = [];
  for (let pass = 0; pass < 3; pass++) {
    let progressed = false;
    for (const key of Object.keys(FORMULAS)) {
      if (known[key] != null) continue;
      const solved = trySolve(key, known, lang);
      if (solved) {
        known[key] = solved.value;
        steps.push(solved.step);
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  return { known, extraSteps: steps };
}

const PLACEHOLDER = {
  u: { en: 'e.g. 0', bn: 'যেমন ০' },
  v: { en: 'e.g. 20', bn: 'যেমন ২০' },
  a: { en: 'e.g. 9.8', bn: 'যেমন ৯.৮' },
  t: { en: 'e.g. 4', bn: 'যেমন ৪' },
  s: { en: 'e.g. 100', bn: 'যেমন ১০০' },
};

const NOT_ENOUGH = {
  en: (label) => `Not enough information to find ${label}. Fill in at least three of the other four fields (in a combination that determines it).`,
  bn: (label) => `${label} বের করার জন্য পর্যাপ্ত তথ্য নেই। বাকি চারটি ঘরের মধ্যে অন্তত তিনটি এমনভাবে পূরণ করুন যা এটি নির্ধারণ করে।`,
};

export const kinematicsModule = {
  id: 'kinematics',
  name: { en: 'Kinematics', bn: 'গতিবিদ্যা' },
  tagline: {
    en: 'Constant-acceleration motion — the five SUVAT variables.',
    bn: 'সুষম ত্বরণের গতি — পাঁচটি SUVAT চলক।',
  },
  fields: Object.keys(VAR).map((id) => ({
    id,
    label: VAR[id].label,
    unitKey: VAR[id].unitKey,
    placeholder: PLACEHOLDER[id],
  })),
  solveOptions: [
    { value: 'v', label: VAR.v.label, kind: 'velocity' },
    { value: 'u', label: VAR.u.label, kind: 'velocity' },
    { value: 'a', label: VAR.a.label, kind: 'acceleration' },
    { value: 't', label: VAR.t.label, kind: 'time' },
    { value: 's', label: VAR.s.label, kind: 'distance' },
  ],

  calculate(values, target, lang) {
    const known = { ...values };
    delete known[target];

    const solved = trySolve(target, known, lang);
    if (!solved) {
      return { ok: false, message: NOT_ENOUGH[lang](VAR[target].label[lang]) };
    }

    const { known: full, extraSteps } = deriveAll(known, target, solved.value, lang);
    const steps = [solved.step, ...extraSteps];

    const table = Object.keys(VAR).map((key) => ({
      label: VAR[key].label[lang],
      value: full[key] != null ? fmt(full[key]) : '—',
      unit: unit(VAR[key].unitKey, lang),
      highlight: key === target,
      given: values[key] != null,
    }));

    let canvases = null;
    if (full.u != null && full.a != null && full.t != null && full.t > 0) {
      const N = 40;
      const vPts = [], sPts = [];
      for (let i = 0; i <= N; i++) {
        const tau = (full.t * i) / N;
        vPts.push({ x: tau, y: full.u + full.a * tau });
        sPts.push({ x: tau, y: full.u * tau + 0.5 * full.a * tau * tau });
      }
      const tUnit = unit('s', lang);
      canvases = [
        {
          title: lang === 'bn' ? 'বেগ বনাম সময়' : 'Velocity vs. time',
          draw: (canvas) => {
            drawLineGraph(canvas, { series: [{ label: `v(t) ${unit('m/s', lang)}`, color: 'var(--accent)', points: vPts }], xLabel: `t (${tUnit})` });
            return null;
          },
        },
        {
          title: lang === 'bn' ? 'সরণ বনাম সময়' : 'Displacement vs. time',
          draw: (canvas) => {
            drawLineGraph(canvas, { series: [{ label: `s(t) ${unit('m', lang)}`, color: 'var(--accent)', points: sPts }], xLabel: `t (${tUnit})` });
            return null;
          },
        },
      ];
    }

    return {
      ok: true,
      primary: { label: VAR[target].label[lang], value: fmt(solved.value), unit: unit(VAR[target].unitKey, lang) },
      table,
      steps,
      canvases,
    };
  },
};
