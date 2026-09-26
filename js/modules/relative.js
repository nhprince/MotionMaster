import { fmt, deg2rad, rad2deg } from '../utils/math.js';
import { drawVectors } from '../utils/plot.js';
import { unit } from '../i18n.js';

const LABEL = {
  vA: { en: 'Speed of A (vA)', bn: 'A-এর দ্রুতি (vA)' },
  thetaA: { en: 'Direction of A (θA)', bn: 'A-এর দিক (θA)' },
  vB: { en: 'Speed of B (vB)', bn: 'B-এর দ্রুতি (vB)' },
  thetaB: { en: 'Direction of B (θB)', bn: 'B-এর দিক (θB)' },
  relSpeed: { en: 'Relative speed |v_AB|', bn: 'আপেক্ষিক দ্রুতি |v_AB|' },
  relAngle: { en: 'Direction of v_AB', bn: 'v_AB-এর দিক' },
  relX: { en: 'x-component of v_AB', bn: 'v_AB-এর x-উপাংশ' },
  relY: { en: 'y-component of v_AB', bn: 'v_AB-এর y-উপাংশ' },
};

const REQUIRED_MSG = {
  en: 'Enter both speeds and both directions.',
  bn: 'দুটি দ্রুতি এবং দুটি দিক দিন।',
};

export const relativeModule = {
  id: 'relative',
  name: { en: 'Relative Motion', bn: 'আপেক্ষিক গতি' },
  tagline: {
    en: 'Relative velocity of A with respect to B, in two dimensions.',
    bn: 'দ্বিমাত্রিক সমতলে B-এর সাপেক্ষে A-এর আপেক্ষিক বেগ।',
  },
  fields: [
    { id: 'vA', label: LABEL.vA, unitKey: 'm/s', placeholder: { en: 'e.g. 10', bn: 'যেমন ১০' } },
    { id: 'thetaA', label: LABEL.thetaA, unitKey: '°', placeholder: { en: 'e.g. 0', bn: 'যেমন ০' } },
    { id: 'vB', label: LABEL.vB, unitKey: 'm/s', placeholder: { en: 'e.g. 6', bn: 'যেমন ৬' } },
    { id: 'thetaB', label: LABEL.thetaB, unitKey: '°', placeholder: { en: 'e.g. 90', bn: 'যেমন ৯০' } },
  ],
  solveOptions: [
    { value: 'relSpeed', label: LABEL.relSpeed, kind: 'velocity' },
    { value: 'relAngle', label: LABEL.relAngle, kind: 'angle' },
    { value: 'relX', label: LABEL.relX, kind: 'distance' },
    { value: 'relY', label: LABEL.relY, kind: 'distance' },
  ],

  calculate(values, target, lang) {
    const { vA, thetaA, vB, thetaB } = values;
    if ([vA, thetaA, vB, thetaB].some((x) => x == null)) {
      return { ok: false, message: REQUIRED_MSG[lang] };
    }
    const U = (k) => unit(k, lang);
    const Ax = vA * Math.cos(deg2rad(thetaA));
    const Ay = vA * Math.sin(deg2rad(thetaA));
    const Bx = vB * Math.cos(deg2rad(thetaB));
    const By = vB * Math.sin(deg2rad(thetaB));
    const relX = Ax - Bx;
    const relY = Ay - By;
    const relSpeed = Math.sqrt(relX * relX + relY * relY);
    let relAngle = rad2deg(Math.atan2(relY, relX));
    if (relAngle < 0) relAngle += 360;

    const steps =
      lang === 'bn'
        ? [
            `Aₓ = vA·cosθA = ${fmt(vA)}·cos(${fmt(thetaA)}°) = ${fmt(Ax)} ${U('m/s')}, A_y = vA·sinθA = ${fmt(Ay)} ${U('m/s')}`,
            `Bₓ = vB·cosθB = ${fmt(vB)}·cos(${fmt(thetaB)}°) = ${fmt(Bx)} ${U('m/s')}, B_y = vB·sinθB = ${fmt(By)} ${U('m/s')}`,
            `v_AB = v_A − v_B → উপাংশ: (${fmt(relX)}, ${fmt(relY)}) ${U('m/s')}`,
            `|v_AB| = √(x² + y²) = ${fmt(relSpeed)} ${U('m/s')}, দিক = atan2(y, x) = ${fmt(relAngle)}${U('°')}`,
          ]
        : [
            `Aₓ = vA·cosθA = ${fmt(vA)}·cos(${fmt(thetaA)}°) = ${fmt(Ax)} ${U('m/s')}, A_y = vA·sinθA = ${fmt(Ay)} ${U('m/s')}`,
            `Bₓ = vB·cosθB = ${fmt(vB)}·cos(${fmt(thetaB)}°) = ${fmt(Bx)} ${U('m/s')}, B_y = vB·sinθB = ${fmt(By)} ${U('m/s')}`,
            `v_AB = v_A − v_B → components: (${fmt(relX)}, ${fmt(relY)}) ${U('m/s')}`,
            `|v_AB| = √(x² + y²) = ${fmt(relSpeed)} ${U('m/s')}, direction = atan2(y, x) = ${fmt(relAngle)}${U('°')}`,
          ];

    const table = [
      { label: LABEL.relSpeed[lang], value: fmt(relSpeed), unit: U('m/s'), highlight: target === 'relSpeed' },
      { label: LABEL.relAngle[lang], value: fmt(relAngle), unit: U('°'), highlight: target === 'relAngle' },
      { label: LABEL.relX[lang], value: fmt(relX), unit: U('m/s'), highlight: target === 'relX' },
      { label: LABEL.relY[lang], value: fmt(relY), unit: U('m/s'), highlight: target === 'relY' },
    ];

    const primaryMap = {
      relSpeed: { label: LABEL.relSpeed[lang], value: fmt(relSpeed), unit: U('m/s') },
      relAngle: { label: LABEL.relAngle[lang], value: fmt(relAngle), unit: U('°') },
      relX: { label: LABEL.relX[lang], value: fmt(relX), unit: U('m/s') },
      relY: { label: LABEL.relY[lang], value: fmt(relY), unit: U('m/s') },
    };

    const canvases = [
      {
        title: lang === 'bn' ? 'ভেক্টর চিত্র' : 'Vector diagram',
        draw: (canvas) =>
          drawVectors(canvas, [
            { label: 'A', angleDeg: thetaA, magnitude: vA, color: 'var(--text-dim)' },
            { label: 'B', angleDeg: thetaB, magnitude: vB, color: 'var(--text-dim)' },
            { label: 'v_AB', angleDeg: relAngle, magnitude: relSpeed, color: 'var(--accent)' },
          ]),
      },
    ];

    return { ok: true, primary: primaryMap[target], table, steps, canvases };
  },
};
