import { fmt } from '../utils/math.js';
import { drawLineGraph, drawOscillation } from '../utils/plot.js';
import { unit } from '../i18n.js';

const TWO_PI = Math.PI * 2;

const LABEL = {
  A: { en: 'Amplitude (A)', bn: 'বিস্তার (A)' },
  w: { en: 'Angular frequency (ω)', bn: 'কৌণিক কম্পাঙ্ক (ω)' },
  T: { en: 'Period (T)', bn: 'পর্যায়কাল (T)' },
  f: { en: 'Frequency (f)', bn: 'কম্পাঙ্ক (f)' },
  phi: { en: 'Phase constant (φ)', bn: 'দশা ধ্রুবক (φ)' },
  t: { en: 'Time (t)', bn: 'সময় (t)' },
  k: { en: 'Spring constant (k)', bn: 'স্প্রিং ধ্রুবক (k)' },
  m: { en: 'Mass (m)', bn: 'ভর (m)' },
  L: { en: 'Pendulum length (L)', bn: 'দোলকের দৈর্ঘ্য (L)' },
  g: { en: 'Gravity (g)', bn: 'অভিকর্ষজ ত্বরণ (g)' },
  vMax: { en: 'Maximum velocity', bn: 'সর্বোচ্চ বেগ' },
  aMax: { en: 'Maximum acceleration', bn: 'সর্বোচ্চ ত্বরণ' },
  x: { en: 'Displacement x(t)', bn: 'সরণ x(t)' },
  v: { en: 'Velocity v(t)', bn: 'বেগ v(t)' },
  a: { en: 'Acceleration a(t)', bn: 'ত্বরণ a(t)' },
};

const NOT_ENOUGH_W = {
  en: 'Not enough information for ω. Provide one of: ω, T, f, (k and m), or (L, with g).',
  bn: 'ω নির্ণয়ের জন্য পর্যাপ্ত তথ্য নেই। এগুলোর একটি দিন: ω, T, f, (k ও m), অথবা (L, সাথে g)।',
};
const NEED_A_T_W = {
  en: 'Need amplitude (A), angular frequency (ω or a way to derive it), and time (t).',
  bn: 'বিস্তার (A), কৌণিক কম্পাঙ্ক (ω বা তা বের করার উপায়), এবং সময় (t) প্রয়োজন।',
};
const NEED_A_W = {
  en: 'Need amplitude (A) and angular frequency (ω or a way to derive it).',
  bn: 'বিস্তার (A) এবং কৌণিক কম্পাঙ্ক (ω বা তা বের করার উপায়) প্রয়োজন।',
};

export const shmModule = {
  id: 'shm',
  name: { en: 'SHM & Oscillations', bn: 'সরল ছন্দিত গতি' },
  tagline: {
    en: 'Simple harmonic motion — amplitude, frequency, and motion at any instant.',
    bn: 'সরল ছন্দিত গতি — বিস্তার, কম্পাঙ্ক, এবং যেকোনো মুহূর্তের গতি।',
  },
  fields: [
    { id: 'A', label: LABEL.A, unitKey: 'm', placeholder: { en: 'e.g. 0.5', bn: 'যেমন ০.৫' } },
    { id: 'w', label: LABEL.w, unitKey: 'rad/s', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'T', label: LABEL.T, unitKey: 's', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'f', label: LABEL.f, unitKey: 'Hz', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 't', label: LABEL.t, unitKey: 's', placeholder: { en: 'needed for x, v, a', bn: 'x, v, a-এর জন্য প্রয়োজন' } },
    { id: 'phi', label: LABEL.phi, unitKey: 'rad', placeholder: { en: 'blank = 0', bn: 'ফাঁকা = ০' } },
    { id: 'k', label: LABEL.k, unitKey: 'N/m', placeholder: { en: 'spring: k & m instead of ω', bn: 'স্প্রিং: ω-এর বদলে k ও m' } },
    { id: 'm', label: LABEL.m, unitKey: 'kg', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'L', label: LABEL.L, unitKey: 'm', placeholder: { en: 'pendulum: L (with g)', bn: 'দোলক: L (g সহ)' } },
    { id: 'g', label: LABEL.g, unitKey: 'm/s²', placeholder: { en: 'blank = 9.8', bn: 'ফাঁকা = ৯.৮' } },
  ],
  solveOptions: [
    { value: 'w', label: LABEL.w, kind: 'angularVelocity' },
    { value: 'T', label: LABEL.T, kind: 'period' },
    { value: 'f', label: LABEL.f, kind: 'frequency' },
    { value: 'vMax', label: LABEL.vMax, kind: 'velocity' },
    { value: 'aMax', label: LABEL.aMax, kind: 'acceleration' },
    { value: 'x', label: LABEL.x, kind: 'distance' },
    { value: 'v', label: LABEL.v, kind: 'velocity' },
    { value: 'a', label: LABEL.a, kind: 'acceleration' },
  ],

  calculate(values, target, lang) {
    const known = { ...values };
    const steps = [];
    const U = (k) => unit(k, lang);
    const g = known.g != null ? known.g : 9.8;

    if (known.w == null) {
      if (known.T != null) {
        known.w = TWO_PI / known.T;
        steps.push(`ω = 2π/T = 2π/${fmt(known.T)} = ${fmt(known.w)} ${U('rad/s')}`);
      } else if (known.f != null) {
        known.w = TWO_PI * known.f;
        steps.push(`ω = 2πf = 2π(${fmt(known.f)}) = ${fmt(known.w)} ${U('rad/s')}`);
      } else if (known.k != null && known.m != null) {
        known.w = Math.sqrt(known.k / known.m);
        steps.push(`ω = √(k/m) = √(${fmt(known.k)}/${fmt(known.m)}) = ${fmt(known.w)} ${U('rad/s')}`);
      } else if (known.L != null) {
        known.w = Math.sqrt(g / known.L);
        steps.push(`ω = √(g/L) = √(${fmt(g)}/${fmt(known.L)}) = ${fmt(known.w)} ${U('rad/s')}`);
      }
    }

    if (known.w != null) {
      if (known.T == null) { known.T = TWO_PI / known.w; steps.push(`T = 2π/ω = ${fmt(known.T)} ${U('s')}`); }
      if (known.f == null) { known.f = known.w / TWO_PI; steps.push(`f = ω/2π = ${fmt(known.f)} ${U('Hz')}`); }
    }

    const needsW = ['w', 'T', 'f'].includes(target);
    if (needsW && known.w == null) return { ok: false, message: NOT_ENOUGH_W[lang] };

    let vMax = null, aMax = null;
    if (known.A != null && known.w != null) {
      vMax = known.A * known.w;
      aMax = known.A * known.w * known.w;
    }
    if (['vMax', 'aMax'].includes(target) && (vMax == null)) {
      return { ok: false, message: NEED_A_W[lang] };
    }
    if (vMax != null) steps.push(`v_max = Aω = ${fmt(known.A)} × ${fmt(known.w)} = ${fmt(vMax)} ${U('m/s')}`);
    if (aMax != null) steps.push(`a_max = Aω² = ${fmt(known.A)} × ${fmt(known.w)}² = ${fmt(aMax)} ${U('m/s²')}`);

    let x = null, v = null, a = null;
    const needsInstant = ['x', 'v', 'a'].includes(target);
    if (needsInstant) {
      if (known.A == null || known.w == null || known.t == null) {
        return { ok: false, message: NEED_A_T_W[lang] };
      }
      const phi = known.phi != null ? known.phi : 0;
      const phase = known.w * known.t + phi;
      x = known.A * Math.sin(phase);
      v = known.A * known.w * Math.cos(phase);
      a = -known.A * known.w * known.w * Math.sin(phase);
      steps.push(`x(t) = A sin(ωt + φ) = ${fmt(known.A)} sin(${fmt(known.w)}×${fmt(known.t)} + ${fmt(phi)}) = ${fmt(x)} ${U('m')}`);
      steps.push(`v(t) = Aω cos(ωt + φ) = ${fmt(v)} ${U('m/s')}`);
      steps.push(`a(t) = −Aω² sin(ωt + φ) = −ω²x = ${fmt(a)} ${U('m/s²')}`);
    }

    const resultMap = {
      w: known.w != null ? { label: LABEL.w[lang], value: fmt(known.w), unit: U('rad/s') } : null,
      T: known.T != null ? { label: LABEL.T[lang], value: fmt(known.T), unit: U('s') } : null,
      f: known.f != null ? { label: LABEL.f[lang], value: fmt(known.f), unit: U('Hz') } : null,
      vMax: vMax != null ? { label: LABEL.vMax[lang], value: fmt(vMax), unit: U('m/s') } : null,
      aMax: aMax != null ? { label: LABEL.aMax[lang], value: fmt(aMax), unit: U('m/s²') } : null,
      x: x != null ? { label: LABEL.x[lang], value: fmt(x), unit: U('m') } : null,
      v: v != null ? { label: LABEL.v[lang], value: fmt(v), unit: U('m/s') } : null,
      a: a != null ? { label: LABEL.a[lang], value: fmt(a), unit: U('m/s²') } : null,
    };

    const primary = resultMap[target];
    const table = Object.keys(resultMap)
      .filter((k) => resultMap[k])
      .map((k) => ({ ...resultMap[k], highlight: k === target }));

    let canvases = null;
    if (known.A != null && known.w != null) {
      const domain = known.T != null ? known.T * 2 : TWO_PI / known.w * 2;
      const phi = known.phi != null ? known.phi : 0;
      const N = 80;
      const xPts = [], vPts = [];
      for (let i = 0; i <= N; i++) {
        const tau = (domain * i) / N;
        const phase = known.w * tau + phi;
        xPts.push({ x: tau, y: known.A * Math.sin(phase) });
        vPts.push({ x: tau, y: known.A * known.w * Math.cos(phase) });
      }
      const tUnit = U('s');
      canvases = [
        {
          title: lang === 'bn' ? 'সরণ বনাম সময়' : 'Displacement vs. time',
          draw: (canvas) => { drawLineGraph(canvas, { series: [{ label: `x(t) ${U('m')}`, color: 'var(--accent)', points: xPts }], xLabel: `t (${tUnit})` }); return null; },
        },
        {
          title: lang === 'bn' ? 'বেগ বনাম সময়' : 'Velocity vs. time',
          draw: (canvas) => { drawLineGraph(canvas, { series: [{ label: `v(t) ${U('m/s')}`, color: 'var(--accent)', points: vPts }], xLabel: `t (${tUnit})` }); return null; },
        },
        {
          title: lang === 'bn' ? 'দোলন' : 'Oscillation',
          draw: (canvas) => drawOscillation(canvas, { periodMs: 2400 }),
        },
      ];
    }

    return { ok: true, primary, table, steps, canvases };
  },
};
