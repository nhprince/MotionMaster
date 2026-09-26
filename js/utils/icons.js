// Small monoline icons, stroke="currentColor" so they inherit text color.
const wrap = (inner, vb = '0 0 20 20') =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const TOPIC_ICONS = {
  kinematics: wrap(
    '<path d="M4 16 L15 5 M15 5 H10 M15 5 V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  projectile: wrap(
    '<path d="M2 16 Q10 2 18 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '<circle cx="18" cy="16" r="1.4" fill="currentColor"/>'
  ),
  circular: wrap(
    '<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.7"/>' +
      '<circle cx="10" cy="3" r="1.6" fill="currentColor"/>'
  ),
  shm: wrap(
    '<path d="M1 10 C3 4 6 4 8 10 C10 16 13 16 15 10 C16.4 6.8 18 6.8 19 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  ),
  energy: wrap(
    '<path d="M11 2 L4.5 12 H9 L8 18 L15.5 8 H11 Z" fill="currentColor"/>'
  ),
  relative: wrap(
    '<path d="M3 6.5 H13 M13 6.5 L10 3.5 M13 6.5 L10 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M17 13.5 H7 M7 13.5 L10 10.5 M7 13.5 L10 16.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  calculus: wrap(
    '<path d="M13 3 C9.5 3 8.5 6 8.5 9 V13 C8.5 16.5 6.5 17 5 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  ),
};

// Icons for "solve for" dropdown items — keyed by the physical *kind* of
// quantity (several variables can share a kind, e.g. u and v are both
// "velocity"). This avoids ever rendering raw variable-name text as an icon.
export const KIND_ICONS = {
  velocity: wrap(
    '<path d="M4 14.5a8 8 0 0 1 12 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M9 14.5 L13 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="9" cy="14.5" r="1.3" fill="currentColor"/>'
  ),
  acceleration: wrap(
    '<path d="M5 13.5 L10 7.5 L15 13.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M5 8.5 L10 2.5 L15 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>'
  ),
  time: wrap(
    '<circle cx="10" cy="10.5" r="7" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M10 6.3v4.2l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  distance: wrap(
    '<path d="M2.5 10h15 M2.5 10l3-3 M2.5 10l3 3 M17.5 10l-3-3 M17.5 10l-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  height: wrap(
    '<path d="M10 17V4 M10 4l-3 3 M10 4l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M4.5 17h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
  ),
  angularVelocity: wrap(
    '<path d="M15.5 10a5.5 5.5 0 1 1-1.8-4.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M15.5 3.8V7.6h-3.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  period: wrap(
    '<path d="M4 9.5a6 6 0 0 1 10.8-3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M15.2 2.8v3.6h-3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M16 10.5a6 6 0 0 1-10.8 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M4.8 17.2v-3.6h3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  frequency: wrap(
    '<path d="M1.5 11c1.4-4.5 2.8-4.5 3.7 0s2.3 4.5 3.7 0 2.3-4.5 3.7 0 2.3 4.5 3.7 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
  ),
  mass: wrap(
    '<path d="M7.3 6.2a2.7 2.7 0 0 1 5.4 0" stroke="currentColor" stroke-width="1.6"/>' +
      '<rect x="4.3" y="6.2" width="11.4" height="9.6" rx="1.6" stroke="currentColor" stroke-width="1.6"/>'
  ),
  force: wrap(
    '<path d="M2.5 10.5h11.5 M10.5 5.5l4.5 5-4.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  centripetalAccel: wrap(
    '<circle cx="10" cy="10.5" r="7" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M10 3.8V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M8.1 8.4 L10 10.3 L11.9 8.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  angle: wrap(
    '<path d="M3 15.5h13.5 M3 15.5L13.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M8 15.5a5.3 5.3 0 0 1 1.3-4.5" stroke="currentColor" stroke-width="1.4" fill="none"/>'
  ),
  energy: wrap('<path d="M11 2 L4.5 12 H9 L8 18 L15.5 8 H11 Z" fill="currentColor"/>'),
  collision: wrap(
    '<circle cx="6.5" cy="10.5" r="4" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="14" cy="10.5" r="3" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M1 10.5h1.5 M14.7 5.8l1-1 M14.7 15.2l1 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
  ),
};

export function chevronIcon() {
  return wrap('<path d="M5 7.5 L10 12.5 L15 7.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>');
}

export function checkIcon() {
  return wrap('<path d="M4 10.5 L8 14.5 L16 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>');
}

// Sidebar collapse/expand toggle — a small "panel" glyph (outer frame with a
// vertical divider), the common convention for a collapsible side rail.
export function sidebarToggleIcon() {
  return wrap(
    '<rect x="2.5" y="3.5" width="15" height="13" rx="2.2" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M7.8 3.8v12.4" stroke="currentColor" stroke-width="1.5"/>'
  );
}

// Brand mark — a small accelerating trajectory with a leading point.
// Used both inline (inside the dark rounded square in the sidebar) and,
// as a standalone file, for the favicon.
export function logoMark() {
  return wrap(
    '<path d="M4 15c2.5-1 4-3 5-5.5S11 5 14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>' +
      '<circle cx="15.2" cy="3.6" r="1.8" fill="currentColor"/>',
    '0 0 20 20'
  );
}
