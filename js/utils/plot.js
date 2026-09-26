// Lightweight canvas plotting — no charting library, styled to match the app.

function css(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/** Make a canvas crisp on high-DPI screens, sized to its CSS box. */
function primeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

/**
 * Plot one or more line series on shared axes.
 * series: [{ label, color, points: [{x,y}] }]
 */
export function drawLineGraph(canvas, { series, xLabel = '', yLabel = '' }) {
  const { ctx, w, h } = primeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);

  const padL = 46, padR = 16, padT = 16, padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const allPts = series.flatMap((s) => s.points);
  if (allPts.length === 0) return;

  let xMin = Math.min(0, ...allPts.map((p) => p.x));
  let xMax = Math.max(...allPts.map((p) => p.x));
  let yMin = Math.min(0, ...allPts.map((p) => p.y));
  let yMax = Math.max(...allPts.map((p) => p.y));
  if (xMax === xMin) xMax = xMin + 1;
  if (yMax === yMin) yMax = yMin + 1;
  const yPad = (yMax - yMin) * 0.1;
  yMin -= yPad; yMax += yPad;

  const sx = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y) => padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // grid
  ctx.strokeStyle = css('--grid-line') || 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = css('--text-dim') || '#6e7178';
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const gy = padT + (plotH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padL, gy);
    ctx.lineTo(padL + plotW, gy);
    ctx.stroke();
    const val = yMax - ((yMax - yMin) / gridLines) * i;
    ctx.fillText(val.toFixed(1), 4, gy + 3);
  }
  for (let i = 0; i <= gridLines; i++) {
    const gx = padL + (plotW / gridLines) * i;
    const val = xMin + ((xMax - xMin) / gridLines) * i;
    ctx.fillText(val.toFixed(1), gx - 8, h - 12);
  }

  // zero axes, emphasized
  ctx.strokeStyle = css('--grid-line-strong') || 'rgba(0,0,0,0.2)';
  if (yMin < 0 && yMax > 0) {
    ctx.beginPath(); ctx.moveTo(padL, sy(0)); ctx.lineTo(padL + plotW, sy(0)); ctx.stroke();
  }
  if (xMin < 0 && xMax > 0) {
    ctx.beginPath(); ctx.moveTo(sx(0), padT); ctx.lineTo(sx(0), padT + plotH); ctx.stroke();
  }

  // series
  series.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    s.points.forEach((p, i) => {
      const X = sx(p.x), Y = sy(p.y);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    });
    ctx.stroke();
  });

  // legend
  let lx = padL + 8;
  series.forEach((s) => {
    ctx.fillStyle = s.color;
    ctx.fillRect(lx, padT + 4, 10, 10);
    ctx.fillStyle = css('--text') || '#111113';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(s.label, lx + 16, padT + 13);
    lx += ctx.measureText(s.label).width + 40;
  });

  ctx.fillStyle = css('--text-dim') || '#6e7178';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText(xLabel, padL + plotW - ctx.measureText(xLabel).width, h - 2);
}

/**
 * Draw a projectile trajectory and animate a marker along it.
 * points: [{x,y}] in physical units (y = height above ground).
 * Returns a stop() function to cancel the animation.
 */
export function drawTrajectory(canvas, points, { durationMs = 2200 } = {}) {
  const { ctx, w, h } = primeCanvas(canvas);
  const padL = 46, padR = 20, padT = 20, padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xMax = Math.max(...points.map((p) => p.x), 1);
  const yMax = Math.max(...points.map((p) => p.y), 1);

  const sx = (x) => padL + (x / xMax) * plotW;
  const sy = (y) => padT + plotH - (y / yMax) * plotH;

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = css('--grid-line') || 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = css('--text-dim') || '#6e7178';
    for (let i = 0; i <= 4; i++) {
      const gy = padT + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
      ctx.fillText((yMax - (yMax / 4) * i).toFixed(1), 4, gy + 3);
    }
    // ground
    ctx.strokeStyle = css('--grid-line-strong') || 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, sy(0)); ctx.lineTo(padL + plotW, sy(0)); ctx.stroke();

    // path
    ctx.strokeStyle = css('--text-dim') || '#6e7178';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      const X = sx(p.x), Y = sy(p.y);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    });
    ctx.stroke();
  }

  drawStatic();

  let raf;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const idx = Math.min(points.length - 1, Math.floor(t * (points.length - 1)));
    drawStatic();
    const p = points[idx];
    ctx.fillStyle = css('--accent') || '#2563eb';
    ctx.beginPath();
    ctx.arc(sx(p.x), sy(p.y), 5, 0, Math.PI * 2);
    ctx.fill();
    if (t < 1) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

/**
 * Animate a point orbiting a circle at a visually-normalized angular speed.
 * Physical scale is irrelevant here — this illustrates direction and relative speed only.
 * Returns a stop() function.
 */
export function drawOrbit(canvas, { periodMs = 2600 } = {}) {
  const { ctx, w, h } = primeCanvas(canvas);
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 24;

  let raf;
  const start = performance.now();
  function frame(now) {
    const t = ((now - start) % periodMs) / periodMs;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = css('--grid-line') || 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = css('--text-dim') || '#6e7178';
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);

    ctx.strokeStyle = css('--accent-2') || '#6e7178';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

    ctx.fillStyle = css('--accent') || '#2563eb';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

/**
 * Animate a point oscillating back and forth along a horizontal line
 * (visualizes SHM). Speed is normalized for legibility, like drawOrbit.
 * Returns a stop() function.
 */
export function drawOscillation(canvas, { periodMs = 2400 } = {}) {
  const { ctx, w, h } = primeCanvas(canvas);
  const cy = h / 2;
  const amp = w / 2 - 28;
  const cx = w / 2;

  let raf;
  const start = performance.now();
  function frame(now) {
    const t = ((now - start) % periodMs) / periodMs;
    const x = amp * Math.sin(t * Math.PI * 2);
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = css('--grid-line-strong') || 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - amp, cy); ctx.lineTo(cx + amp, cy); ctx.stroke();

    ctx.strokeStyle = css('--grid-line') || 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke();

    ctx.fillStyle = css('--accent') || '#2563eb';
    ctx.beginPath(); ctx.arc(cx + x, cy, 7, 0, Math.PI * 2); ctx.fill();

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

/**
 * Draw a static 2D vector diagram: each vector as an arrow from the origin,
 * scaled to fit the canvas, with a label near its tip.
 * vectors: [{ label, angleDeg, magnitude, color }]
 */
export function drawVectors(canvas, vectors) {
  const { ctx, w, h } = primeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) / 2 - 26;
  const maxMag = Math.max(...vectors.map((v) => Math.abs(v.magnitude)), 1e-9);
  const scale = maxR / maxMag;

  ctx.strokeStyle = css('--grid-line') || 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(6, cy); ctx.lineTo(w - 6, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 6); ctx.lineTo(cx, h - 6); ctx.stroke();

  ctx.font = '11px Inter, sans-serif';

  vectors.forEach((v) => {
    const rad = (v.angleDeg * Math.PI) / 180;
    const r = Math.abs(v.magnitude) * scale;
    const tipX = cx + r * Math.cos(rad);
    const tipY = cy - r * Math.sin(rad);

    ctx.strokeStyle = v.color;
    ctx.fillStyle = v.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tipX, tipY); ctx.stroke();

    const headLen = 8;
    const headAngle = Math.PI / 8;
    const backAngle = Math.atan2(cy - tipY, tipX - cx) + Math.PI;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + headLen * Math.cos(backAngle + headAngle), tipY - headLen * Math.sin(backAngle + headAngle));
    ctx.lineTo(tipX + headLen * Math.cos(backAngle - headAngle), tipY - headLen * Math.sin(backAngle - headAngle));
    ctx.closePath();
    ctx.fill();

    const labelX = tipX + (tipX >= cx ? 6 : -6 - ctx.measureText(v.label).width);
    const labelY = tipY + (tipY >= cy ? 14 : -6);
    ctx.fillText(v.label, labelX, labelY);
  });
}
