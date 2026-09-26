import { fmt, deg2rad } from '../utils/math.js';
import { drawTrajectory } from '../utils/plot.js';
import { unit } from '../i18n.js';

const LABEL = {
  u: { en: 'Launch speed (u)', bn: 'নিক্ষেপণ বেগ (u)' },
  angle: { en: 'Launch angle (θ)', bn: 'নিক্ষেপণ কোণ (θ)' },
  h: { en: 'Launch height (h)', bn: 'নিক্ষেপণ উচ্চতা (h)' },
  g: { en: 'Gravity (g)', bn: 'অভিকর্ষজ ত্বরণ (g)' },
  timeOfFlight: { en: 'Time of flight', bn: 'স্থিতিকাল' },
  maxHeight: { en: 'Maximum height', bn: 'সর্বোচ্চ উচ্চতা' },
  range: { en: 'Range', bn: 'পাল্লা' },
  ux: { en: 'Horizontal speed (uₓ)', bn: 'অনুভূমিক বেগ (uₓ)' },
  uy: { en: 'Vertical speed (u_y)', bn: 'উল্লম্ব বেগ (u_y)' },
};

const REQUIRED_MSG = {
  en: 'Launch speed and launch angle are required.',
  bn: 'নিক্ষেপণ বেগ এবং নিক্ষেপণ কোণ আবশ্যক।',
};
const NEVER_LANDS_MSG = {
  en: 'This launch never reaches the ground (check height/angle).',
  bn: 'এই গতিপথ কখনও মাটিতে পৌঁছায় না (উচ্চতা/কোণ পরীক্ষা করুন)।',
};
const INVALID_MSG = {
  en: 'Could not resolve a valid flight time — check your inputs (angle must be between 0° and 180°, speed > 0).',
  bn: 'একটি বৈধ স্থিতিকাল পাওয়া যায়নি — ইনপুট পরীক্ষা করুন (কোণ ০° থেকে ১৮০°-এর মধ্যে হতে হবে, বেগ > ০)।',
};

export const projectileModule = {
  id: 'projectile',
  name: { en: 'Projectile Motion', bn: 'প্রাসের গতি' },
  tagline: {
    en: '2D motion under gravity — launch speed, angle, and height.',
    bn: 'অভিকর্ষের অধীনে দ্বিমাত্রিক গতি — নিক্ষেপণ বেগ, কোণ ও উচ্চতা।',
  },
  fields: [
    { id: 'u', label: LABEL.u, unitKey: 'm/s', placeholder: { en: 'e.g. 25', bn: 'যেমন ২৫' } },
    { id: 'angle', label: LABEL.angle, unitKey: '°', placeholder: { en: 'e.g. 40', bn: 'যেমন ৪০' } },
    { id: 'h', label: LABEL.h, unitKey: 'm', placeholder: { en: 'blank = 0', bn: 'ফাঁকা = ০' } },
    { id: 'g', label: LABEL.g, unitKey: 'm/s²', placeholder: { en: 'blank = 9.8', bn: 'ফাঁকা = ৯.৮' } },
  ],
  solveOptions: [
    { value: 'range', label: LABEL.range, kind: 'distance' },
    { value: 'maxHeight', label: LABEL.maxHeight, kind: 'height' },
    { value: 'timeOfFlight', label: LABEL.timeOfFlight, kind: 'time' },
  ],

  calculate(values, target, lang) {
    const { u, angle } = values;
    if (u == null || angle == null) {
      return { ok: false, message: REQUIRED_MSG[lang] };
    }
    const g = values.g != null ? values.g : 9.8;
    const h = values.h != null ? values.h : 0;
    const theta = deg2rad(angle);
    const ux = u * Math.cos(theta);
    const uy = u * Math.sin(theta);

    let t;
    if (h === 0) {
      t = (2 * uy) / g;
    } else {
      const disc = uy * uy + 2 * g * h;
      if (disc < 0) return { ok: false, message: NEVER_LANDS_MSG[lang] };
      t = (uy + Math.sqrt(disc)) / g;
    }
    if (!Number.isFinite(t) || t <= 0) {
      return { ok: false, message: INVALID_MSG[lang] };
    }

    const maxHeight = h + (uy * uy) / (2 * g);
    const range = ux * t;

    const uMS = unit('m/s', lang), uM = unit('m', lang), uS = unit('s', lang);

    const steps =
      lang === 'bn'
        ? [
            `নিক্ষেপণ বেগ বিভাজন: uₓ = u·cosθ = ${fmt(u)}·cos(${angle}°) = ${fmt(ux)} ${uMS}, u_y = u·sinθ = ${fmt(u)}·sin(${angle}°) = ${fmt(uy)} ${uMS}`,
            h === 0
              ? `স্থিতিকাল (সমতল ভূমি): t = 2u_y/g = 2(${fmt(uy)})/${fmt(g)} = ${fmt(t)} ${uS}`
              : `স্থিতিকাল (উচ্চতা h = ${fmt(h)} ${uM} থেকে): t = [u_y + √(u_y² + 2gh)]/g = ${fmt(t)} ${uS}`,
            `সর্বোচ্চ উচ্চতা: H = h + u_y²/2g = ${fmt(h)} + (${fmt(uy)})²/2(${fmt(g)}) = ${fmt(maxHeight)} ${uM}`,
            `পাল্লা: R = uₓ·t = ${fmt(ux)} × ${fmt(t)} = ${fmt(range)} ${uM}`,
          ]
        : [
            `Split the launch velocity: uₓ = u·cosθ = ${fmt(u)}·cos(${angle}°) = ${fmt(ux)} ${uMS}, u_y = u·sinθ = ${fmt(u)}·sin(${angle}°) = ${fmt(uy)} ${uMS}`,
            h === 0
              ? `Time of flight (level ground): t = 2u_y/g = 2(${fmt(uy)})/${fmt(g)} = ${fmt(t)} ${uS}`
              : `Time of flight (from height h = ${fmt(h)} ${uM}): t = [u_y + √(u_y² + 2gh)]/g = ${fmt(t)} ${uS}`,
            `Maximum height: H = h + u_y²/2g = ${fmt(h)} + (${fmt(uy)})²/2(${fmt(g)}) = ${fmt(maxHeight)} ${uM}`,
            `Range: R = uₓ·t = ${fmt(ux)} × ${fmt(t)} = ${fmt(range)} ${uM}`,
          ];

    const table = [
      { label: LABEL.timeOfFlight[lang], value: fmt(t), unit: uS, highlight: target === 'timeOfFlight' },
      { label: LABEL.maxHeight[lang], value: fmt(maxHeight), unit: uM, highlight: target === 'maxHeight' },
      { label: LABEL.range[lang], value: fmt(range), unit: uM, highlight: target === 'range' },
      { label: LABEL.ux[lang], value: fmt(ux), unit: uMS },
      { label: LABEL.uy[lang], value: fmt(uy), unit: uMS },
    ];

    const primaryMap = {
      range: { label: LABEL.range[lang], value: fmt(range), unit: uM },
      maxHeight: { label: LABEL.maxHeight[lang], value: fmt(maxHeight), unit: uM },
      timeOfFlight: { label: LABEL.timeOfFlight[lang], value: fmt(t), unit: uS },
    };

    const N = 60;
    const points = [];
    for (let i = 0; i <= N; i++) {
      const tau = (t * i) / N;
      points.push({ x: ux * tau, y: h + uy * tau - 0.5 * g * tau * tau });
    }

    const canvases = [
      {
        title: lang === 'bn' ? 'গতিপথ' : 'Trajectory',
        draw: (canvas) => drawTrajectory(canvas, points, { durationMs: 2200 }),
      },
    ];

    return { ok: true, primary: primaryMap[target], table, steps, canvases };
  },
};
