<h1 align="center">🚀 Motion Master</h1>

<p align="center">
  <b>An advanced motion physics calculator — from SSC-level SUVAT to college-level mechanics.</b>
</p>

---

## What's here

All seven planned topics are built, each with the same English/Bengali toggle and Quick/Learn modes:

- **Kinematics (SUVAT)** — no longer assumes blank fields are `0`. Tries every valid formula combination for the variable you're solving for, then back-solves the rest of the system. v–t and s–t graphs.
- **Projectile Motion** (প্রাসের গতি) — full 2D breakdown, launch height support, animated trajectory.
- **Circular Motion** — give any consistent subset of radius/speed/angular velocity/period/frequency/mass; derives the rest with a shown reasoning chain. Orbit animation.
- **SHM & Oscillations** (সরল ছন্দিত গতি) — solve from ω, T, f, a spring's (k, m), or a pendulum's (L, g); evaluate displacement/velocity/acceleration at any instant. Displacement/velocity graphs plus a live oscillation animation.
- **Work, Energy & Momentum** — work, kinetic/potential energy, momentum, power, *and* 1D elastic/inelastic collisions (shows momentum and kinetic-energy conservation checks so you can see elastic vs. inelastic play out numerically).
- **Relative Motion** — relative velocity of A with respect to B in 2D, with a vector diagram.
- **Variable Acceleration** — the advanced one: type an actual function of `t` (e.g. `3*t^2 + 2*t`, `10*sin(2*t)`) as acceleration, velocity, *or* position, and it numerically integrates/differentiates to get the other two, with graphs. Runs on a small hand-written expression parser (no `eval`, no dependencies) plus trapezoidal integration and central-difference derivatives.
- **Quick vs. Learn mode** — Quick shows just the number; Learn shows the derivation, graphs, and any animation.
- **English ⇄ Bengali toggle** — every label, unit, and step-by-step explanation switches language. Terms were checked against Bengali-medium physics sources rather than translated literally (e.g. প্রাস for projectile, ভরবেগের নিত্যতা for momentum conservation, স্থিতিস্থাপক/অস্থিতিস্থাপক সংঘর্ষ for elastic/inelastic collisions).
- **Collapsible sidebar** with icon-only mode, a proper brand mark + favicon, and icon-based (not letter-badge) dropdowns throughout.
- **Design** — light, minimal, mostly monochrome; one blue accent reserved for "this is the answer" — the primary result, the highlighted row, the solved-for graph line, and any moving marker.

## Project structure

```
index.html
style.css
js/
  app.js               # navigation, mode/language toggle, dynamic fields, custom dropdown
  i18n.js              # static UI strings, unit translations
  utils/
    math.js            # parsing, formatting, quadratic solver
    plot.js            # canvas graphs, trajectory/orbit/oscillation animation, vector diagrams
    icons.js           # inline SVG icon set
    calc.js            # safe expression parser + numerical integration/differentiation
  modules/
    kinematics.js
    projectile.js
    circular.js
    shm.js
    energy.js
    relative.js
    calculus.js
```

Zero build step, zero npm dependencies, only two Google Fonts loaded over HTTPS. Adding a new topic later just means dropping a new file in `js/modules/` with a `calculate()` function and registering it in `app.js`.

## Run locally

Because the app uses ES modules (`<script type="module">`), opening `index.html` directly via `file://` will fail (browsers block module imports over `file://`). Serve it locally instead:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy — Cloudflare Pages (free, fast, static)

1. Push this repo to GitHub (keep using your existing `MotionMaster` repo).
2. Go to the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select the `MotionMaster` repo.
4. Build settings: **Framework preset: None**, **Build command: (leave blank)**, **Build output directory: `/`**.
5. Deploy. Cloudflare gives you a `*.pages.dev` URL immediately, and you can attach a custom domain for free under the project's **Custom domains** tab.

Every future `git push` redeploys automatically. GitHub Pages can stay live in parallel if you want — nothing here is Pages-specific.

---

<p align="center">Developed with ❤️ by <b>NH Prince Pradhan</b></p>
