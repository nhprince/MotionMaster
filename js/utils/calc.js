// A small, safe parser for single-variable math expressions in `t`.
// Supports + - * / ^, unary minus, parentheses, implicit multiplication
// (e.g. "2t", "3(t+1)"), and sin/cos/tan/sqrt/exp/ln/log/abs plus pi and e.
// No eval() / new Function() — everything is hand-parsed into closures.

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, abs: Math.abs,
};

function tokenize(src) {
  const raw = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      raw.push({ type: 'num', value: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z]/.test(src[j])) j++;
      raw.push({ type: 'ident', value: src.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*/^(),'.includes(c)) { raw.push({ type: c }); i++; continue; }
    throw new Error(`unexpected character "${c}"`);
  }

  // Insert implicit multiplication: NUM|)|IDENT  followed by  NUM|(|IDENT
  // — except when it's a function name immediately followed by its own '('.
  const tokens = [];
  for (const tok of raw) {
    const prev = tokens[tokens.length - 1];
    if (prev) {
      const prevCloses = prev.type === 'num' || prev.type === ')' || prev.type === 'ident';
      const curOpens = tok.type === 'num' || tok.type === '(' || tok.type === 'ident';
      const isFuncCall = prev.type === 'ident' && FUNCS[prev.value] && tok.type === '(';
      if (prevCloses && curOpens && !isFuncCall) tokens.push({ type: '*' });
    }
    tokens.push(tok);
  }
  return tokens;
}

function buildEvaluator(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (type) => {
    const t = next();
    if (!t || t.type !== type) throw new Error(`expected "${type}"`);
    return t;
  };

  function parseExpression() {
    let node = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = next().type;
      const rhs = parseTerm();
      const lhs = node;
      node = op === '+' ? (t) => lhs(t) + rhs(t) : (t) => lhs(t) - rhs(t);
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = next().type;
      const rhs = parseUnary();
      const lhs = node;
      node = op === '*' ? (t) => lhs(t) * rhs(t) : (t) => lhs(t) / rhs(t);
    }
    return node;
  }

  function parseUnary() {
    if (peek() && peek().type === '-') { next(); const o = parseUnary(); return (t) => -o(t); }
    if (peek() && peek().type === '+') { next(); return parseUnary(); }
    return parsePower();
  }

  function parsePower() {
    const base = parseAtom();
    if (peek() && peek().type === '^') {
      next();
      const exp = parseUnary();
      return (t) => Math.pow(base(t), exp(t));
    }
    return base;
  }

  function parseAtom() {
    const tok = peek();
    if (!tok) throw new Error('unexpected end of expression');
    if (tok.type === 'num') { next(); return () => tok.value; }
    if (tok.type === '(') {
      next();
      const inner = parseExpression();
      expect(')');
      return inner;
    }
    if (tok.type === 'ident') {
      next();
      const name = tok.value;
      if (peek() && peek().type === '(') {
        next();
        const arg = parseExpression();
        expect(')');
        const fn = FUNCS[name];
        if (!fn) throw new Error(`unknown function "${name}"`);
        return (t) => fn(arg(t));
      }
      if (name === 't') return (t) => t;
      if (name === 'pi') return () => Math.PI;
      if (name === 'e') return () => Math.E;
      throw new Error(`unknown identifier "${name}"`);
    }
    throw new Error('unexpected token');
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error('unexpected trailing input');
  return result;
}

/** Compile a string like "3*t^2 + 2t" into a function (t) => number. */
export function compileExpression(src) {
  const tokens = tokenize(src);
  const fn = buildEvaluator(tokens);
  const probe = fn(0);
  if (typeof probe !== 'number') throw new Error('did not evaluate to a number');
  return fn;
}

export function centralDiff(fn, t, h = 1e-4) {
  return (fn(t + h) - fn(t - h)) / (2 * h);
}

export function secondDiff(fn, t, h = 1e-3) {
  return (fn(t + h) - 2 * fn(t) + fn(t - h)) / (h * h);
}

/** Cumulative trapezoidal integral from nodes[0] up to each nodes[i]. */
export function cumulativeTrapezoidFromSamples(nodes, values) {
  const cum = new Array(nodes.length);
  cum[0] = 0;
  for (let i = 1; i < nodes.length; i++) {
    const h = nodes[i] - nodes[i - 1];
    cum[i] = cum[i - 1] + (h * (values[i] + values[i - 1])) / 2;
  }
  return cum;
}

/** Sample fn at n+1 evenly-spaced nodes over [0, t] and cumulatively integrate. */
export function cumulativeIntegral(fn, t, n = 400) {
  const h = t / n;
  const nodes = new Array(n + 1);
  const values = new Array(n + 1);
  for (let i = 0; i <= n; i++) {
    nodes[i] = h * i;
    values[i] = fn(nodes[i]);
  }
  return { nodes, values, cumulative: cumulativeTrapezoidFromSamples(nodes, values) };
}
