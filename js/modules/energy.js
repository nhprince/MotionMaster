import { fmt, deg2rad } from '../utils/math.js';
import { unit } from '../i18n.js';

const SINGLE = ['work', 'kineticEnergy', 'potentialEnergy', 'momentum', 'power'];
const COLLISION = ['collisionElastic', 'collisionInelastic'];

const LABEL = {
  F: { en: 'Force (F)', bn: 'বল (F)' },
  d: { en: 'Displacement (d)', bn: 'সরণ (d)' },
  theta: { en: 'Angle between F and d (θ)', bn: 'F ও d-এর মধ্যবর্তী কোণ (θ)' },
  m: { en: 'Mass (m)', bn: 'ভর (m)' },
  v: { en: 'Velocity (v)', bn: 'বেগ (v)' },
  h: { en: 'Height (h)', bn: 'উচ্চতা (h)' },
  g: { en: 'Gravity (g)', bn: 'অভিকর্ষজ ত্বরণ (g)' },
  t: { en: 'Time (t)', bn: 'সময় (t)' },
  m1: { en: 'Mass 1 (m₁)', bn: 'ভর ১ (m₁)' },
  u1: { en: 'Velocity 1 before (u₁)', bn: 'বেগ ১, সংঘর্ষের আগে (u₁)' },
  m2: { en: 'Mass 2 (m₂)', bn: 'ভর ২ (m₂)' },
  u2: { en: 'Velocity 2 before (u₂)', bn: 'বেগ ২, সংঘর্ষের আগে (u₂)' },
  work: { en: 'Work (W)', bn: 'কাজ (W)' },
  kineticEnergy: { en: 'Kinetic energy (KE)', bn: 'গতিশক্তি (KE)' },
  potentialEnergy: { en: 'Potential energy (PE)', bn: 'স্থিতিশক্তি (PE)' },
  momentum: { en: 'Momentum (p)', bn: 'ভরবেগ (p)' },
  power: { en: 'Power (P)', bn: 'ক্ষমতা (P)' },
  collisionElastic: { en: 'Final velocities (elastic)', bn: 'চূড়ান্ত বেগ (স্থিতিস্থাপক সংঘর্ষ)' },
  collisionInelastic: { en: 'Common final velocity (inelastic)', bn: 'সমন্বিত চূড়ান্ত বেগ (অস্থিতিস্থাপক সংঘর্ষ)' },
  momentumBefore: { en: 'Momentum before', bn: 'সংঘর্ষের আগে ভরবেগ' },
  momentumAfter: { en: 'Momentum after', bn: 'সংঘর্ষের পরে ভরবেগ' },
  keBefore: { en: 'KE before', bn: 'সংঘর্ষের আগে গতিশক্তি' },
  keAfter: { en: 'KE after', bn: 'সংঘর্ষের পরে গতিশক্তি' },
};

const MSG = {
  work: { en: 'Need force (F) and displacement (d).', bn: 'বল (F) এবং সরণ (d) প্রয়োজন।' },
  kineticEnergy: { en: 'Need mass (m) and velocity (v).', bn: 'ভর (m) এবং বেগ (v) প্রয়োজন।' },
  potentialEnergy: { en: 'Need mass (m) and height (h).', bn: 'ভর (m) এবং উচ্চতা (h) প্রয়োজন।' },
  momentum: { en: 'Need mass (m) and velocity (v).', bn: 'ভর (m) এবং বেগ (v) প্রয়োজন।' },
  power: { en: 'Need either (force and velocity) or (force, displacement, and time).', bn: 'হয় (বল ও বেগ), অথবা (বল, সরণ ও সময়) প্রয়োজন।' },
  collision: { en: 'Need both masses and both initial velocities (m₁, u₁, m₂, u₂).', bn: 'দুটি ভর এবং দুটি আদিবেগ প্রয়োজন (m₁, u₁, m₂, u₂)।' },
};

export const energyModule = {
  id: 'energy',
  name: { en: 'Work, Energy & Momentum', bn: 'কাজ, শক্তি ও ভরবেগ' },
  tagline: {
    en: 'Work, energy, power, momentum — plus elastic and inelastic collisions.',
    bn: 'কাজ, শক্তি, ক্ষমতা, ভরবেগ — এবং স্থিতিস্থাপক ও অস্থিতিস্থাপক সংঘর্ষ।',
  },
  fields: [
    { id: 'F', label: LABEL.F, unitKey: 'N', appliesTo: SINGLE, placeholder: { en: 'e.g. 20', bn: 'যেমন ২০' } },
    { id: 'd', label: LABEL.d, unitKey: 'm', appliesTo: SINGLE, placeholder: { en: 'e.g. 5', bn: 'যেমন ৫' } },
    { id: 'theta', label: LABEL.theta, unitKey: '°', appliesTo: SINGLE, placeholder: { en: 'blank = 0', bn: 'ফাঁকা = ০' } },
    { id: 'm', label: LABEL.m, unitKey: 'kg', appliesTo: SINGLE, placeholder: { en: 'e.g. 2', bn: 'যেমন ২' } },
    { id: 'v', label: LABEL.v, unitKey: 'm/s', appliesTo: SINGLE, placeholder: { en: 'e.g. 10', bn: 'যেমন ১০' } },
    { id: 'h', label: LABEL.h, unitKey: 'm', appliesTo: SINGLE, placeholder: { en: 'e.g. 3', bn: 'যেমন ৩' } },
    { id: 'g', label: LABEL.g, unitKey: 'm/s²', appliesTo: SINGLE, placeholder: { en: 'blank = 9.8', bn: 'ফাঁকা = ৯.৮' } },
    { id: 't', label: LABEL.t, unitKey: 's', appliesTo: SINGLE, placeholder: { en: 'optional — for power', bn: 'ঐচ্ছিক — ক্ষমতার জন্য' } },
    { id: 'm1', label: LABEL.m1, unitKey: 'kg', appliesTo: COLLISION, placeholder: { en: 'e.g. 2', bn: 'যেমন ২' } },
    { id: 'u1', label: LABEL.u1, unitKey: 'm/s', appliesTo: COLLISION, placeholder: { en: 'e.g. 5', bn: 'যেমন ৫' } },
    { id: 'm2', label: LABEL.m2, unitKey: 'kg', appliesTo: COLLISION, placeholder: { en: 'e.g. 3', bn: 'যেমন ৩' } },
    { id: 'u2', label: LABEL.u2, unitKey: 'm/s', appliesTo: COLLISION, placeholder: { en: 'e.g. -1', bn: 'যেমন -১' } },
  ],
  solveOptions: [
    { value: 'work', label: LABEL.work, kind: 'force' },
    { value: 'kineticEnergy', label: LABEL.kineticEnergy, kind: 'energy' },
    { value: 'potentialEnergy', label: LABEL.potentialEnergy, kind: 'energy' },
    { value: 'momentum', label: LABEL.momentum, kind: 'velocity' },
    { value: 'power', label: LABEL.power, kind: 'time' },
    { value: 'collisionElastic', label: LABEL.collisionElastic, kind: 'collision' },
    { value: 'collisionInelastic', label: LABEL.collisionInelastic, kind: 'collision' },
  ],

  calculate(values, target, lang) {
    const U = (k) => unit(k, lang);
    const g = values.g != null ? values.g : 9.8;

    if (COLLISION.includes(target)) {
      const { m1, u1, m2, u2 } = values;
      if ([m1, u1, m2, u2].some((x) => x == null)) {
        return { ok: false, message: MSG.collision[lang] };
      }
      const pBefore = m1 * u1 + m2 * u2;
      const keBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
      const steps = [];

      if (target === 'collisionElastic') {
        const v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
        const v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);
        const pAfter = m1 * v1 + m2 * v2;
        const keAfter = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
        steps.push(`v₁' = [(m₁−m₂)u₁ + 2m₂u₂]/(m₁+m₂) = ${fmt(v1)} ${U('m/s')}`);
        steps.push(`v₂' = [(m₂−m₁)u₂ + 2m₁u₁]/(m₁+m₂) = ${fmt(v2)} ${U('m/s')}`);
        steps.push(
          lang === 'bn'
            ? `ভরবেগ যাচাই: pᵢ = ${fmt(pBefore)} ${U('kg')}·${U('m/s')} = p_f = ${fmt(pAfter)} (সংরক্ষিত)`
            : `Momentum check: pᵢ = ${fmt(pBefore)} = p_f = ${fmt(pAfter)} ${U('kg')}·${U('m/s')} (conserved)`
        );
        steps.push(
          lang === 'bn'
            ? `গতিশক্তি যাচাই: KEᵢ = ${fmt(keBefore)} J = KE_f = ${fmt(keAfter)} J (সংরক্ষিত, স্থিতিস্থাপক)`
            : `KE check: KEᵢ = ${fmt(keBefore)} J = KE_f = ${fmt(keAfter)} J (conserved — elastic)`
        );
        const table = [
          { label: lang === 'bn' ? "v₁'" : "v₁'", value: fmt(v1), unit: U('m/s'), highlight: true },
          { label: lang === 'bn' ? "v₂'" : "v₂'", value: fmt(v2), unit: U('m/s'), highlight: true },
          { label: LABEL.momentumBefore[lang], value: fmt(pBefore), unit: `${U('kg')}·${U('m/s')}` },
          { label: LABEL.momentumAfter[lang], value: fmt(pAfter), unit: `${U('kg')}·${U('m/s')}` },
          { label: LABEL.keBefore[lang], value: fmt(keBefore), unit: 'J' },
          { label: LABEL.keAfter[lang], value: fmt(keAfter), unit: 'J' },
        ];
        return {
          ok: true,
          primary: { label: LABEL.collisionElastic[lang], value: `${fmt(v1)}, ${fmt(v2)}`, unit: U('m/s') },
          table,
          steps,
          canvases: null,
        };
      }

      // perfectly inelastic
      const vCommon = (m1 * u1 + m2 * u2) / (m1 + m2);
      const pAfter = (m1 + m2) * vCommon;
      const keAfter = 0.5 * (m1 + m2) * vCommon * vCommon;
      steps.push(`v' = (m₁u₁ + m₂u₂)/(m₁+m₂) = ${fmt(vCommon)} ${U('m/s')}`);
      steps.push(
        lang === 'bn'
          ? `ভরবেগ যাচাই: pᵢ = ${fmt(pBefore)} = p_f = ${fmt(pAfter)} ${U('kg')}·${U('m/s')} (সংরক্ষিত)`
          : `Momentum check: pᵢ = ${fmt(pBefore)} = p_f = ${fmt(pAfter)} ${U('kg')}·${U('m/s')} (conserved)`
      );
      steps.push(
        lang === 'bn'
          ? `গতিশক্তি: KEᵢ = ${fmt(keBefore)} J, KE_f = ${fmt(keAfter)} J (শক্তি ক্ষয় = ${fmt(keBefore - keAfter)} J)`
          : `KE: KEᵢ = ${fmt(keBefore)} J, KE_f = ${fmt(keAfter)} J (energy lost = ${fmt(keBefore - keAfter)} J)`
      );
      const table = [
        { label: lang === 'bn' ? "v'" : "v'", value: fmt(vCommon), unit: U('m/s'), highlight: true },
        { label: LABEL.momentumBefore[lang], value: fmt(pBefore), unit: `${U('kg')}·${U('m/s')}` },
        { label: LABEL.momentumAfter[lang], value: fmt(pAfter), unit: `${U('kg')}·${U('m/s')}` },
        { label: LABEL.keBefore[lang], value: fmt(keBefore), unit: 'J' },
        { label: LABEL.keAfter[lang], value: fmt(keAfter), unit: 'J' },
      ];
      return {
        ok: true,
        primary: { label: LABEL.collisionInelastic[lang], value: fmt(vCommon), unit: U('m/s') },
        table,
        steps,
        canvases: null,
      };
    }

    // single-body work / energy / momentum / power
    const { F, d, m, v, h } = values;
    const theta = values.theta != null ? values.theta : 0;
    const t = values.t;

    if (target === 'work') {
      if (F == null || d == null) return { ok: false, message: MSG.work[lang] };
      const W = F * d * Math.cos(deg2rad(theta));
      const steps = [`W = Fd cosθ = ${fmt(F)} × ${fmt(d)} × cos(${fmt(theta)}°) = ${fmt(W)} J`];
      return { ok: true, primary: { label: LABEL.work[lang], value: fmt(W), unit: 'J' }, table: [{ label: LABEL.work[lang], value: fmt(W), unit: 'J', highlight: true }], steps, canvases: null };
    }
    if (target === 'kineticEnergy') {
      if (m == null || v == null) return { ok: false, message: MSG.kineticEnergy[lang] };
      const KE = 0.5 * m * v * v;
      const steps = [`KE = ½mv² = ½ × ${fmt(m)} × ${fmt(v)}² = ${fmt(KE)} J`];
      return { ok: true, primary: { label: LABEL.kineticEnergy[lang], value: fmt(KE), unit: 'J' }, table: [{ label: LABEL.kineticEnergy[lang], value: fmt(KE), unit: 'J', highlight: true }], steps, canvases: null };
    }
    if (target === 'potentialEnergy') {
      if (m == null || h == null) return { ok: false, message: MSG.potentialEnergy[lang] };
      const PE = m * g * h;
      const steps = [`PE = mgh = ${fmt(m)} × ${fmt(g)} × ${fmt(h)} = ${fmt(PE)} J`];
      return { ok: true, primary: { label: LABEL.potentialEnergy[lang], value: fmt(PE), unit: 'J' }, table: [{ label: LABEL.potentialEnergy[lang], value: fmt(PE), unit: 'J', highlight: true }], steps, canvases: null };
    }
    if (target === 'momentum') {
      if (m == null || v == null) return { ok: false, message: MSG.momentum[lang] };
      const p = m * v;
      const steps = [`p = mv = ${fmt(m)} × ${fmt(v)} = ${fmt(p)} ${U('kg')}·${U('m/s')}`];
      return { ok: true, primary: { label: LABEL.momentum[lang], value: fmt(p), unit: `${U('kg')}·${U('m/s')}` }, table: [{ label: LABEL.momentum[lang], value: fmt(p), unit: `${U('kg')}·${U('m/s')}`, highlight: true }], steps, canvases: null };
    }
    if (target === 'power') {
      let P, steps;
      if (F != null && v != null) {
        P = F * v;
        steps = [`P = Fv = ${fmt(F)} × ${fmt(v)} = ${fmt(P)} W`];
      } else if (F != null && d != null && t != null) {
        const W = F * d * Math.cos(deg2rad(theta));
        P = W / t;
        steps = [`W = Fd cosθ = ${fmt(W)} J`, `P = W/t = ${fmt(W)}/${fmt(t)} = ${fmt(P)} W`];
      } else {
        return { ok: false, message: MSG.power[lang] };
      }
      return { ok: true, primary: { label: LABEL.power[lang], value: fmt(P), unit: 'W' }, table: [{ label: LABEL.power[lang], value: fmt(P), unit: 'W', highlight: true }], steps, canvases: null };
    }

    return { ok: false, message: lang === 'bn' ? 'অজানা লক্ষ্য।' : 'Unknown target.' };
  },
};
