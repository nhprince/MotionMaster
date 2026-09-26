import { parseVal } from './utils/math.js';
import { TOPIC_ICONS, KIND_ICONS, chevronIcon, checkIcon, sidebarToggleIcon, logoMark } from './utils/icons.js';
import { s, unit, COMING_SOON } from './i18n.js';
import { kinematicsModule } from './modules/kinematics.js';
import { projectileModule } from './modules/projectile.js';
import { circularModule } from './modules/circular.js';
import { shmModule } from './modules/shm.js';
import { energyModule } from './modules/energy.js';
import { relativeModule } from './modules/relative.js';
import { calculusModule } from './modules/calculus.js';

const MODULES = [
  kinematicsModule,
  projectileModule,
  circularModule,
  shmModule,
  energyModule,
  relativeModule,
  calculusModule,
];

const state = {
  moduleId: MODULES[0].id,
  mode: 'quick', // 'quick' | 'learn'
  lang: 'en', // 'en' | 'bn'
  lastValues: null,
  lastTarget: null,
  lastExtra: null,
  lastResult: null,
};

// Value of a module's optional "extra toggle" (e.g. calculus's a/v/x picker).
let extraToggleState = { id: null, value: null };

let activeStops = [];
function stopAnimations() {
  activeStops.forEach((stop) => stop && stop());
  activeStops = [];
}

const el = {
  nav: document.getElementById('topicNav'),
  brandTagline: document.getElementById('brandTagline'),
  title: document.getElementById('moduleTitle'),
  desc: document.getElementById('moduleDesc'),
  extraToggleWrap: document.getElementById('extraToggleWrap'),
  fieldGrid: document.getElementById('fieldGrid'),
  solveLabel: document.getElementById('solveLabel'),
  solveDropdown: document.getElementById('solveDropdown'),
  calcBtn: document.getElementById('calcBtn'),
  resultsPanel: document.getElementById('resultsPanel'),
  readout: document.getElementById('readout'),
  learnExtra: document.getElementById('learnExtra'),
  steps: document.getElementById('steps'),
  visual: document.getElementById('visual'),
  modeBtns: document.querySelectorAll('.mode-btn'),
  langBtns: document.querySelectorAll('.lang-btn'),
  modeHint: document.getElementById('modeHint'),
  rail: document.getElementById('rail'),
  collapseBtn: document.getElementById('collapseBtn'),
  brandMark: document.getElementById('brandMark'),
};

function currentModule() {
  return MODULES.find((m) => m.id === state.moduleId);
}

/* ---------------- Custom dropdown (used for "Solve for") ---------------- */

let solveState = { options: [], value: null, onChange: null, open: false };

function closeDropdown() {
  solveState.open = false;
  el.solveDropdown.classList.remove('open');
}

function renderDropdown() {
  const opts = solveState.options;
  const current = opts.find((o) => o.value === solveState.value) || opts[0];
  const iconFor = (o) => KIND_ICONS[o.kind] || '';

  el.solveDropdown.innerHTML = `
    <button type="button" class="dd-trigger">
      <span class="var-badge">${iconFor(current)}</span>
      <span class="dd-trigger-label">${current.label}</span>
      <span class="dd-chevron">${chevronIcon()}</span>
    </button>
    <div class="dd-panel">
      ${opts
        .map(
          (o) => `
        <button type="button" class="dd-item ${o.value === current.value ? 'selected' : ''}" data-value="${o.value}">
          <span class="var-badge">${iconFor(o)}</span>
          <span class="dd-item-label">${o.label}</span>
          ${o.value === current.value ? `<span class="dd-check">${checkIcon()}</span>` : ''}
        </button>`
        )
        .join('')}
    </div>
  `;

  el.solveDropdown.querySelector('.dd-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    solveState.open = !solveState.open;
    el.solveDropdown.classList.toggle('open', solveState.open);
  });

  el.solveDropdown.querySelectorAll('.dd-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      solveState.value = btn.dataset.value;
      closeDropdown();
      renderDropdown();
      if (solveState.onChange) solveState.onChange(solveState.value);
    });
  });
}

document.addEventListener('click', (e) => {
  if (solveState.open && !el.solveDropdown.contains(e.target)) closeDropdown();
});

function setDropdownOptions(options, initialValue, onChange) {
  solveState.options = options;
  solveState.value = initialValue != null ? initialValue : options[0].value;
  solveState.onChange = onChange || null;
  renderDropdown();
}

function getDropdownValue() {
  return solveState.value;
}

/* ---------------------------- Navigation --------------------------- */

function renderNav() {
  const lang = state.lang;
  el.nav.innerHTML = '';
  MODULES.forEach((m) => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn' + (m.id === state.moduleId ? ' active' : '');
    btn.innerHTML = `<span class="topic-icon">${TOPIC_ICONS[m.id] || ''}</span><span>${m.name[lang]}</span>`;
    btn.addEventListener('click', () => selectModule(m.id));
    el.nav.appendChild(btn);
  });
  COMING_SOON.forEach((m) => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn disabled';
    btn.innerHTML = `<span class="topic-icon">${TOPIC_ICONS[m.id] || ''}</span><span>${m.name[lang]}</span>`;
    btn.title = s('comingSoon', lang);
    btn.disabled = true;
    el.nav.appendChild(btn);
  });
}

function selectModule(id) {
  state.moduleId = id;
  state.lastResult = null;
  state.lastValues = null;
  state.lastTarget = null;
  state.lastExtra = null;
  stopAnimations();
  renderNav();
  renderModule();
}

/* ----------------------------- Module form -------------------------- */

function renderChrome() {
  const lang = state.lang;
  el.brandTagline.textContent = s('brandTagline', lang);
  el.solveLabel.textContent = s('solveFor', lang);
  el.calcBtn.textContent = s('calculate', lang);
  el.modeHint.textContent = s('modeHint', lang);
  el.modeBtns.forEach((b) => {
    b.querySelector('.mode-label').textContent = s(b.dataset.mode === 'quick' ? 'quick' : 'learn', lang);
  });
}

function fieldsFor(mod, target) {
  return mod.fields.filter((f) => !f.appliesTo || f.appliesTo.includes(target));
}

function renderFieldGrid(mod, target) {
  const lang = state.lang;
  el.fieldGrid.innerHTML = '';
  fieldsFor(mod, target).forEach((f) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const type = f.type || 'number';
    const unitLabel = f.unitKey ? `<span class="unit">${unit(f.unitKey, lang)}</span>` : '';
    wrap.innerHTML = `
      <label for="f_${f.id}">${f.label[lang]} ${unitLabel}</label>
      <input type="${type}" ${type === 'number' ? 'step="any"' : ''} id="f_${f.id}" placeholder="${f.placeholder ? f.placeholder[lang] : ''}">
    `;
    el.fieldGrid.appendChild(wrap);
  });
}

function renderExtraToggle(mod) {
  if (!mod.extraToggle) {
    el.extraToggleWrap.hidden = true;
    el.extraToggleWrap.innerHTML = '';
    extraToggleState = { id: null, value: null };
    return;
  }
  const lang = state.lang;
  const t = mod.extraToggle;
  extraToggleState = { id: t.id, value: t.default };
  el.extraToggleWrap.hidden = false;
  el.extraToggleWrap.innerHTML = `
    <div class="mode-toggle">
      ${t.options
        .map(
          (o) =>
            `<button type="button" class="mode-btn ${o.value === t.default ? 'active' : ''}" data-value="${o.value}">${o.label[lang]}</button>`
        )
        .join('')}
    </div>
  `;
  el.extraToggleWrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      extraToggleState.value = btn.dataset.value;
      el.extraToggleWrap.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
}

function renderModule() {
  const lang = state.lang;
  const mod = currentModule();
  el.title.textContent = mod.name[lang];
  el.desc.textContent = mod.tagline[lang];

  renderExtraToggle(mod);

  const options = mod.solveOptions.map((o) => ({ value: o.value, label: o.label[lang], kind: o.kind }));
  setDropdownOptions(options, options[0].value, (newTarget) => {
    renderFieldGrid(mod, newTarget);
  });

  renderFieldGrid(mod, options[0].value);
  el.resultsPanel.hidden = true;
}

function gatherValues(mod, target) {
  const values = {};
  fieldsFor(mod, target).forEach((f) => {
    const raw = document.getElementById(`f_${f.id}`).value;
    values[f.id] = (f.type || 'number') === 'text' ? raw : parseVal(raw);
  });
  return values;
}

function calculate() {
  const mod = currentModule();
  const target = getDropdownValue();
  const values = gatherValues(mod, target);
  const extra = mod.extraToggle ? { [extraToggleState.id]: extraToggleState.value } : null;
  state.lastValues = values;
  state.lastTarget = target;
  state.lastExtra = extra;
  const result = mod.calculate(values, target, state.lang, extra);
  state.lastResult = result;
  renderResults(result);
}

function renderResults(result) {
  stopAnimations();
  el.resultsPanel.hidden = false;
  const lang = state.lang;

  if (!result.ok) {
    el.readout.innerHTML = `<div class="error">${result.message}</div>`;
    el.learnExtra.hidden = true;
    return;
  }

  const rows = (result.table || [])
    .map(
      (r) => `
      <div class="row ${r.highlight ? 'highlight' : ''}">
        <span class="row-label">${r.label}${r.given ? ` <em>(${s('given', lang)})</em>` : ''}</span>
        <span class="row-value">${r.value} <span class="row-unit">${r.unit || ''}</span></span>
      </div>`
    )
    .join('');

  el.readout.innerHTML = `
    <div class="primary">
      <span class="primary-label">${result.primary.label}</span>
      <span class="primary-value">${result.primary.value}<span class="primary-unit">${result.primary.unit}</span></span>
    </div>
    <div class="table">${rows}</div>
  `;

  const learnOn = state.mode === 'learn';
  el.learnExtra.hidden = !learnOn;
  if (!learnOn) return;

  el.steps.innerHTML =
    result.steps && result.steps.length
      ? `<h3>${s('stepByStep', lang)}</h3><ol>${result.steps.map((st) => `<li>${st}</li>`).join('')}</ol>`
      : '';

  el.visual.innerHTML = '';
  if (result.canvases && result.canvases.length) {
    result.canvases.forEach((c) => {
      const box = document.createElement('div');
      box.className = 'canvas-box';
      box.innerHTML = `<h3>${c.title}</h3><canvas></canvas>`;
      el.visual.appendChild(box);
      const canvas = box.querySelector('canvas');
      requestAnimationFrame(() => {
        const stop = c.draw(canvas);
        if (stop) activeStops.push(stop);
      });
    });
  }
}

function setMode(mode) {
  state.mode = mode;
  el.modeBtns.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  if (state.lastResult) renderResults(state.lastResult);
}

function setLang(lang) {
  if (state.lang === lang) return;
  state.lang = lang;
  document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  el.langBtns.forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  renderChrome();
  renderNav();
  renderModule();
  // Recompute with the same inputs so results/steps flip language too.
  if (state.lastValues && state.lastTarget) {
    const mod = currentModule();
    solveState.value = state.lastTarget;
    renderDropdown();
    renderFieldGrid(mod, state.lastTarget);
    if (state.lastExtra && mod.extraToggle) {
      extraToggleState.value = state.lastExtra[mod.extraToggle.id];
      el.extraToggleWrap.querySelectorAll('button').forEach((b) =>
        b.classList.toggle('active', b.dataset.value === extraToggleState.value)
      );
    }
    const result = mod.calculate(state.lastValues, state.lastTarget, lang, state.lastExtra);
    state.lastResult = result;
    renderResults(result);
  }
}

el.calcBtn.addEventListener('click', calculate);
el.modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
el.langBtns.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (state.lastResult && state.lastResult.ok) renderResults(state.lastResult);
  }, 150);
});

el.brandMark.innerHTML = logoMark();
el.collapseBtn.innerHTML = sidebarToggleIcon();

const RAIL_KEY = 'motionmaster-rail-collapsed';
try {
  if (localStorage.getItem(RAIL_KEY) === '1') el.rail.classList.add('collapsed');
} catch (e) { /* ignore */ }
el.collapseBtn.addEventListener('click', () => {
  const collapsed = el.rail.classList.toggle('collapsed');
  try { localStorage.setItem(RAIL_KEY, collapsed ? '1' : '0'); } catch (e) { /* ignore */ }
});

renderChrome();
renderNav();
renderModule();
