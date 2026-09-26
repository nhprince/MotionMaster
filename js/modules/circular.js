import { fmt } from '../utils/math.js';
import { drawOrbit } from '../utils/plot.js';
import { unit } from '../i18n.js';

const TWO_PI = Math.PI * 2;

const LABEL = {
  r: { en: 'Radius (r)', bn: 'ব্যাসার্ধ (r)' },
  v: { en: 'Linear speed (v)', bn: 'রৈখিক বেগ (v)' },
  w: { en: 'Angular velocity (ω)', bn: 'কৌণিক বেগ (ω)' },
  T: { en: 'Period (T)', bn: 'পর্যায়কাল (T)' },
  f: { en: 'Frequency (f)', bn: 'কম্পাঙ্ক (f)' },
  m: { en: 'Mass (m)', bn: 'ভর (m)' },
  ac: { en: 'Centripetal acceleration', bn: 'কেন্দ্রমুখী ত্বরণ' },
  F: { en: 'Centripetal force', bn: 'কেন্দ্রমুখী বল' },
};

const NOT_ENOUGH = {
  en: 'Not enough information. Provide radius plus one of: linear speed, angular velocity, period, or frequency.',
  bn: 'পর্যাপ্ত তথ্য নেই। ব্যাসার্ধের সাথে এগুলোর যেকোনো একটি দিন: রৈখিক বেগ, কৌণিক বেগ, পর্যায়কাল বা কম্পাঙ্ক।',
};

export const circularModule = {
  id: 'circular',
  name: { en: 'Circular Motion', bn: 'বৃত্তাকার গতি' },
  tagline: {
    en: 'Uniform circular motion — provide any consistent subset of these.',
    bn: 'সুষম বৃত্তাকার গতি — এখান থেকে যেকোনো সংগত উপসেট দিন।',
  },
  fields: [
    { id: 'r', label: LABEL.r, unitKey: 'm', placeholder: { en: 'e.g. 2', bn: 'যেমন ২' } },
    { id: 'v', label: LABEL.v, unitKey: 'm/s', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'w', label: LABEL.w, unitKey: 'rad/s', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'T', label: LABEL.T, unitKey: 's', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'f', label: LABEL.f, unitKey: 'Hz', placeholder: { en: 'optional', bn: 'ঐচ্ছিক' } },
    { id: 'm', label: LABEL.m, unitKey: 'kg', placeholder: { en: 'optional — for force', bn: 'ঐচ্ছিক — বলের জন্য' } },
  ],
  solveOptions: [
    { value: 'w', label: LABEL.w, kind: 'angularVelocity' },
    { value: 'v', label: LABEL.v, kind: 'velocity' },
    { value: 'T', label: LABEL.T, kind: 'period' },
    { value: 'f', label: LABEL.f, kind: 'frequency' },
    { value: 'ac', label: LABEL.ac, kind: 'centripetalAccel' },
    { value: 'F', label: LABEL.F, kind: 'force' },
  ],

  calculate(values, target, lang) {
    const known = { ...values };
    const steps = [];
    const U = (k) => unit(k, lang);

    if (known.w == null) {
      if (known.T != null) {
        known.w = TWO_PI / known.T;
        steps.push(`ω = 2π/T = 2π/${fmt(known.T)} = ${fmt(known.w)} ${U('rad/s')}`);
      } else if (known.f != null) {
        known.w = TWO_PI * known.f;
        steps.push(`ω = 2πf = 2π(${fmt(known.f)}) = ${fmt(known.w)} ${U('rad/s')}`);
      } else if (known.v != null && known.r != null) {
        known.w = known.v / known.r;
        steps.push(`ω = v/r = ${fmt(known.v)}/${fmt(known.r)} = ${fmt(known.w)} ${U('rad/s')}`);
      }
    }

    if (known.w != null) {
      if (known.v == null && known.r != null) {
        known.v = known.w * known.r;
        steps.push(`v = ωr = ${fmt(known.w)} × ${fmt(known.r)} = ${fmt(known.v)} ${U('m/s')}`);
      }
      if (known.T == null) {
        known.T = TWO_PI / known.w;
        steps.push(`T = 2π/ω = 2π/${fmt(known.w)} = ${fmt(known.T)} ${U('s')}`);
      }
      if (known.f == null) {
        known.f = known.w / TWO_PI;
        steps.push(`f = ω/2π = ${fmt(known.w)}/2π = ${fmt(known.f)} ${U('Hz')}`);
      }
    }

    let ac = null;
    if (known.v != null && known.r != null) {
      ac = (known.v * known.v) / known.r;
      steps.push(`a_c = v²/r = ${fmt(known.v)}²/${fmt(known.r)} = ${fmt(ac)} ${U('m/s²')}`);
    } else if (known.w != null && known.r != null) {
      ac = known.w * known.w * known.r;
      steps.push(`a_c = ω²r = ${fmt(known.w)}²×${fmt(known.r)} = ${fmt(ac)} ${U('m/s²')}`);
    }

    let F = null;
    if (ac != null && known.m != null) {
      F = known.m * ac;
      steps.push(`F_c = m·a_c = ${fmt(known.m)} × ${fmt(ac)} = ${fmt(F)} ${U('N')}`);
    }

    if (known.w == null && ac == null) {
      return { ok: false, message: NOT_ENOUGH[lang] };
    }

    const resultMap = {
      w: known.w != null ? { label: LABEL.w[lang], value: fmt(known.w), unit: U('rad/s') } : null,
      v: known.v != null ? { label: LABEL.v[lang], value: fmt(known.v), unit: U('m/s') } : null,
      T: known.T != null ? { label: LABEL.T[lang], value: fmt(known.T), unit: U('s') } : null,
      f: known.f != null ? { label: LABEL.f[lang], value: fmt(known.f), unit: U('Hz') } : null,
      ac: ac != null ? { label: LABEL.ac[lang], value: fmt(ac), unit: U('m/s²') } : null,
      F: F != null ? { label: LABEL.F[lang], value: fmt(F), unit: U('N') } : null,
    };

    const needMassMsg = { en: 'need mass', bn: 'ভর প্রয়োজন' };
    const primary = resultMap[target] || {
      label: target === 'F' ? LABEL.F[lang] : LABEL[target] ? LABEL[target][lang] : '',
      value: target === 'F' && F == null ? needMassMsg[lang] : '—',
      unit: '',
    };

    const table = [
      resultMap.w && { ...resultMap.w, highlight: target === 'w' },
      resultMap.v && { ...resultMap.v, highlight: target === 'v' },
      resultMap.T && { ...resultMap.T, highlight: target === 'T' },
      resultMap.f && { ...resultMap.f, highlight: target === 'f' },
      resultMap.ac && { ...resultMap.ac, highlight: target === 'ac' },
      resultMap.F && { ...resultMap.F, highlight: target === 'F' },
    ].filter(Boolean);

    const canvases =
      known.w != null
        ? [
            {
              title: lang === 'bn' ? 'কক্ষপথ' : 'Orbit',
              draw: (canvas) => drawOrbit(canvas, { periodMs: 2600 }),
            },
          ]
        : null;

    return { ok: true, primary, table, steps, canvases };
  },
};
