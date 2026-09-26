import { fmt } from '../utils/math.js';
import { drawLineGraph } from '../utils/plot.js';
import { unit } from '../i18n.js';
import {
  compileExpression,
  centralDiff,
  secondDiff,
  cumulativeIntegral,
  cumulativeTrapezoidFromSamples,
} from '../utils/calc.js';

const N = 400;
const DIFF_H = 1e-4;

const TARGET_LABEL = {
  position: { en: 'Position x(t)', bn: 'অবস্থান x(t)' },
  velocity: { en: 'Velocity v(t)', bn: 'বেগ v(t)' },
  acceleration: { en: 'Acceleration a(t)', bn: 'ত্বরণ a(t)' },
};

const KIND_LABEL = {
  acceleration: { en: 'a(t)', bn: 'a(t)' },
  velocity: { en: 'v(t)', bn: 'v(t)' },
  position: { en: 'x(t)', bn: 'x(t)' },
};

const PARSE_ERROR = {
  en: (msg) => `Couldn't understand that function (${msg}). Use t, + - * / ^, parentheses, and sin/cos/tan/sqrt/exp/ln.`,
  bn: (msg) => `ফাংশনটি বোঝা যায়নি (${msg})। t, + - * / ^, বন্ধনী এবং sin/cos/tan/sqrt/exp/ln ব্যবহার করুন।`,
};
const NEED_EXPR = { en: 'Enter a function of t.', bn: 't-এর একটি ফাংশন লিখুন।' };
const NEED_T = { en: 'Enter a time (t) to evaluate at.', bn: 'মান নির্ণয়ের জন্য একটি সময় (t) দিন।' };
const UNDEFINED_RESULT = {
  en: 'The result is undefined (e.g. a division by zero or a negative root) at this time.',
  bn: 'এই সময়ে ফলাফল সংজ্ঞায়িত নয় (যেমন শূন্য দিয়ে ভাগ বা ঋণাত্মক মূল)।',
};

export const calculusModule = {
  id: 'calculus',
  name: { en: 'Variable Acceleration', bn: 'পরিবর্তনশীল ত্বরণ' },
  tagline: {
    en: 'Non-constant motion — give a(t), v(t), or x(t) and let calculus find the rest.',
    bn: 'অসম গতি — a(t), v(t), অথবা x(t) দিন, ক্যালকুলাস দিয়ে বাকিগুলো বের করুন।',
  },
  extraToggle: {
    id: 'kind',
    default: 'acceleration',
    options: [
      { value: 'acceleration', label: KIND_LABEL.acceleration },
      { value: 'velocity', label: KIND_LABEL.velocity },
      { value: 'position', label: KIND_LABEL.position },
    ],
  },
  fields: [
    { id: 'expr', label: { en: 'Function of t', bn: 't-এর ফাংশন' }, type: 'text', unitKey: '', placeholder: { en: 'e.g. 3*t^2 + 2*t', bn: 'যেমন 3*t^2 + 2*t' } },
    { id: 't', label: { en: 'Evaluate at time (t)', bn: 'যে সময়ে মান নির্ণয় (t)' }, unitKey: 's', placeholder: { en: 'e.g. 2', bn: 'যেমন ২' } },
    { id: 'v0', label: { en: 'Initial velocity (v₀)', bn: 'আদিবেগ (v₀)' }, unitKey: 'm/s', placeholder: { en: 'blank = 0 — used if function is a(t)', bn: 'ফাঁকা = ০ — a(t) হলে প্রযোজ্য' } },
    { id: 'x0', label: { en: 'Initial position (x₀)', bn: 'আদি অবস্থান (x₀)' }, unitKey: 'm', placeholder: { en: 'blank = 0 — used when integrating', bn: 'ফাঁকা = ০ — সমাকলনের সময় প্রযোজ্য' } },
  ],
  solveOptions: [
    { value: 'position', label: TARGET_LABEL.position, kind: 'distance' },
    { value: 'velocity', label: TARGET_LABEL.velocity, kind: 'velocity' },
    { value: 'acceleration', label: TARGET_LABEL.acceleration, kind: 'acceleration' },
  ],

  calculate(values, target, lang, extra) {
    const kind = (extra && extra.kind) || 'acceleration';
    const exprSrc = (values.expr || '').trim();
    if (!exprSrc) return { ok: false, message: NEED_EXPR[lang] };
    const t = values.t;
    if (t == null) return { ok: false, message: NEED_T[lang] };
    const v0 = values.v0 != null ? values.v0 : 0;
    const x0 = values.x0 != null ? values.x0 : 0;

    let fn;
    try {
      fn = compileExpression(exprSrc);
    } catch (e) {
      return { ok: false, message: PARSE_ERROR[lang](e.message) };
    }

    let nodes, xVals, vVals, aVals;
    try {
      if (kind === 'acceleration') {
        const { nodes: n2, values: a2, cumulative: cumA } = cumulativeIntegral(fn, t, N);
        nodes = n2; aVals = a2;
        vVals = cumA.map((c) => v0 + c);
        const cumV = cumulativeTrapezoidFromSamples(nodes, vVals);
        xVals = cumV.map((c) => x0 + c);
      } else if (kind === 'velocity') {
        const { nodes: n2, values: v2, cumulative: cumV } = cumulativeIntegral(fn, t, N);
        nodes = n2; vVals = v2;
        xVals = cumV.map((c) => x0 + c);
        aVals = nodes.map((tau) => centralDiff(fn, tau, DIFF_H));
      } else {
        nodes = []; xVals = []; vVals = []; aVals = [];
        const h = t / N;
        for (let i = 0; i <= N; i++) {
          const tau = h * i;
          nodes.push(tau);
          xVals.push(fn(tau));
          vVals.push(centralDiff(fn, tau, DIFF_H));
          aVals.push(secondDiff(fn, tau, 1e-3));
        }
      }
    } catch (e) {
      return { ok: false, message: PARSE_ERROR[lang](e.message) };
    }

    const last = nodes.length - 1;
    const valueMap = { position: xVals[last], velocity: vVals[last], acceleration: aVals[last] };
    const value = valueMap[target];
    if (!Number.isFinite(value)) return { ok: false, message: UNDEFINED_RESULT[lang] };

    const U = (k) => unit(k, lang);
    const unitMap = { position: 'm', velocity: 'm/s', acceleration: 'm/s²' };
    const primary = { label: TARGET_LABEL[target][lang], value: fmt(value), unit: U(unitMap[target]) };

    const table = [
      { label: TARGET_LABEL.position[lang], value: fmt(xVals[last]), unit: U('m'), highlight: target === 'position' },
      { label: TARGET_LABEL.velocity[lang], value: fmt(vVals[last]), unit: U('m/s'), highlight: target === 'velocity' },
      { label: TARGET_LABEL.acceleration[lang], value: fmt(aVals[last]), unit: U('m/s²'), highlight: target === 'acceleration' },
    ];

    let steps;
    if (kind === 'acceleration') {
      steps =
        lang === 'bn'
          ? [
              `a(t) = ${exprSrc}`,
              `v(t) = v₀ + ∫₀ᵗ a(τ) dτ  (সাংখ্যিক সমাকলন) → v(${fmt(t)}) = ${fmt(vVals[last])} ${U('m/s')}`,
              `x(t) = x₀ + ∫₀ᵗ v(τ) dτ  (সাংখ্যিক সমাকলন) → x(${fmt(t)}) = ${fmt(xVals[last])} ${U('m')}`,
            ]
          : [
              `a(t) = ${exprSrc}`,
              `v(t) = v₀ + ∫₀ᵗ a(τ) dτ  (numerical integration) → v(${fmt(t)}) = ${fmt(vVals[last])} ${U('m/s')}`,
              `x(t) = x₀ + ∫₀ᵗ v(τ) dτ  (numerical integration) → x(${fmt(t)}) = ${fmt(xVals[last])} ${U('m')}`,
            ];
    } else if (kind === 'velocity') {
      steps =
        lang === 'bn'
          ? [
              `v(t) = ${exprSrc}`,
              `x(t) = x₀ + ∫₀ᵗ v(τ) dτ → x(${fmt(t)}) = ${fmt(xVals[last])} ${U('m')}`,
              `a(t) = dv/dt (সাংখ্যিক অবকলন) → a(${fmt(t)}) = ${fmt(aVals[last])} ${U('m/s²')}`,
            ]
          : [
              `v(t) = ${exprSrc}`,
              `x(t) = x₀ + ∫₀ᵗ v(τ) dτ → x(${fmt(t)}) = ${fmt(xVals[last])} ${U('m')}`,
              `a(t) = dv/dt (numerical derivative) → a(${fmt(t)}) = ${fmt(aVals[last])} ${U('m/s²')}`,
            ];
    } else {
      steps =
        lang === 'bn'
          ? [
              `x(t) = ${exprSrc}`,
              `v(t) = dx/dt → v(${fmt(t)}) = ${fmt(vVals[last])} ${U('m/s')}`,
              `a(t) = d²x/dt² → a(${fmt(t)}) = ${fmt(aVals[last])} ${U('m/s²')}`,
            ]
          : [
              `x(t) = ${exprSrc}`,
              `v(t) = dx/dt → v(${fmt(t)}) = ${fmt(vVals[last])} ${U('m/s')}`,
              `a(t) = d²x/dt² → a(${fmt(t)}) = ${fmt(aVals[last])} ${U('m/s²')}`,
            ];
    }

    let canvases = null;
    if (t !== 0) {
      const xPts = nodes.map((tau, i) => ({ x: tau, y: xVals[i] }));
      const vPts = nodes.map((tau, i) => ({ x: tau, y: vVals[i] }));
      const aPts = nodes.map((tau, i) => ({ x: tau, y: aVals[i] }));
      const tUnit = U('s');
      canvases = [
        { title: lang === 'bn' ? 'অবস্থান বনাম সময়' : 'Position vs. time',
          draw: (c) => { drawLineGraph(c, { series: [{ label: `x(t) ${U('m')}`, color: 'var(--accent)', points: xPts }], xLabel: `t (${tUnit})` }); return null; } },
        { title: lang === 'bn' ? 'বেগ বনাম সময়' : 'Velocity vs. time',
          draw: (c) => { drawLineGraph(c, { series: [{ label: `v(t) ${U('m/s')}`, color: 'var(--accent)', points: vPts }], xLabel: `t (${tUnit})` }); return null; } },
        { title: lang === 'bn' ? 'ত্বরণ বনাম সময়' : 'Acceleration vs. time',
          draw: (c) => { drawLineGraph(c, { series: [{ label: `a(t) ${U('m/s²')}`, color: 'var(--accent)', points: aPts }], xLabel: `t (${tUnit})` }); return null; } },
      ];
    }

    return { ok: true, primary, table, steps, canvases };
  },
};
