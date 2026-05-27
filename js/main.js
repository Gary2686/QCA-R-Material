/* ===========================================================
   QCA with R — shared interactivity
   =========================================================== */

/* ---- Reading progress bar ---- */
(function () {
  const bar = document.getElementById('readbar');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? (h.scrollTop / max) * 100 + '%' : '0';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Active nav highlight ---- */
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav a').forEach((a) => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

/* ===========================================================
   Widget: R set operations (union / intersect / setdiff)
   =========================================================== */
function initSetOps(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const xIn = root.querySelector('[data-x]');
  const yIn = root.querySelector('[data-y]');
  const opSel = root.querySelector('[data-op]');
  const out = root.querySelector('[data-out]');
  const svg = root.querySelector('svg');

  const parse = (s) =>
    s.split(/[,\s]+/).map((t) => t.trim()).filter((t) => t !== '').map(Number).filter((n) => !isNaN(n));

  function compute() {
    const X = parse(xIn.value);
    const Y = parse(yIn.value);
    const sx = new Set(X), sy = new Set(Y);
    const op = opSel.value;
    let res = [], rfn = '';
    if (op === 'union') { res = [...new Set([...X, ...Y])]; rfn = 'union(X, Y)'; }
    else if (op === 'intersect') { res = [...sx].filter((v) => sy.has(v)); rfn = 'intersect(X, Y)'; }
    else if (op === 'setdiff') { res = [...sx].filter((v) => !sy.has(v)); rfn = 'setdiff(X, Y)'; }
    else if (op === 'setequal') {
      const eq = sx.size === sy.size && [...sx].every((v) => sy.has(v));
      out.innerHTML = `<span class="c-out">&gt; setequal(X, Y)</span>\n<span class="hl">[1] ${eq ? 'TRUE' : 'FALSE'}</span>`;
      paintVenn(sx, sy, 'setequal');
      return;
    }
    out.innerHTML = `<span class="c-out">&gt; ${rfn}</span>\n<span class="hl">[1] ${res.length ? res.join(' ') : 'integer(0)'}</span>`;
    paintVenn(sx, sy, op);
  }

  function paintVenn(sx, sy, op) {
    if (!svg) return;
    const cL = svg.querySelector('.venn-L');
    const cR = svg.querySelector('.venn-R');
    const reset = '#cbd5e0';
    [cL, cR].forEach((c) => { c.setAttribute('fill', reset); c.setAttribute('fill-opacity', '.35'); });
    const acc = '#2b6cb0', acc2 = '#2c9c8f';
    if (op === 'union') { cL.setAttribute('fill', acc); cR.setAttribute('fill', acc); [cL, cR].forEach(c=>c.setAttribute('fill-opacity', '.5')); }
    else if (op === 'intersect') { cL.setAttribute('fill', acc2); cR.setAttribute('fill', acc2); [cL, cR].forEach(c=>c.setAttribute('fill-opacity', '.5')); }
    else if (op === 'setdiff') { cL.setAttribute('fill', acc); cL.setAttribute('fill-opacity', '.55'); }
  }

  [xIn, yIn, opSel].forEach((el) => el.addEventListener('input', compute));
  compute();
}

/* ===========================================================
   Widget: fuzzy membership AND / OR / NOT  (pmin / pmax / 1-x)
   =========================================================== */
function initFuzzy(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const sliders = root.querySelectorAll('input[type=range]');
  const opSel = root.querySelector('[data-fop]');
  const out = root.querySelector('[data-fout]');
  const barA = root.querySelector('[data-bar=A]');
  const barB = root.querySelector('[data-bar=B]');
  const barR = root.querySelector('[data-bar=R]');

  function val(name) { return parseFloat(root.querySelector(`input[data-fs=${name}]`).value); }

  function compute() {
    const A = val('A'), B = val('B');
    root.querySelector('[data-ro=A]').textContent = A.toFixed(2);
    root.querySelector('[data-ro=B]').textContent = B.toFixed(2);
    const op = opSel.value;
    let r = 0, expr = '', rfn = '';
    if (op === 'and') { r = Math.min(A, B); expr = 'A · B  (A AND B)'; rfn = 'pmin(A, B)'; }
    else if (op === 'or') { r = Math.max(A, B); expr = 'A + B  (A OR B)'; rfn = 'pmax(A, B)'; }
    else if (op === 'notA') { r = 1 - A; expr = 'a  (NOT A)'; rfn = '1 - A'; }
    else if (op === 'aAndB') { r = Math.min(1 - A, B); expr = 'a · B  (NOT A AND B)'; rfn = 'pmin(1 - A, B)'; }
    out.innerHTML = `<span class="c-out">&gt; ${rfn}</span>\n<span class="c-out"># ${expr}</span>\n<span class="hl">[1] ${r.toFixed(2)}</span>`;
    if (barA) barA.style.width = (A * 100) + '%';
    if (barB) barB.style.width = (B * 100) + '%';
    if (barR) barR.style.width = (r * 100) + '%';
  }
  sliders.forEach((s) => s.addEventListener('input', compute));
  opSel.addEventListener('input', compute);
  compute();
}

/* ===========================================================
   Widget: Truth table builder (3 crisp sets, choose an expression)
   =========================================================== */
function initTruthTable(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const sel = root.querySelector('[data-ttexpr]');
  const tbody = root.querySelector('tbody');
  const note = root.querySelector('[data-ttnote]');

  // expression evaluators on 0/1 values for A,B,C
  const exprs = {
    'aBC':  { fn: (A,B,C) => Math.min(1-A, B, C), label: 'a · B · C', r: 'pmin(1 - A, B, C)' },
    'ABC':  { fn: (A,B,C) => Math.min(A, B, C),   label: 'A · B · C', r: 'pmin(A, B, C)' },
    'A+bc': { fn: (A,B,C) => Math.max(A, Math.min(1-B, 1-C)), label: 'A + b · c', r: 'pmax(A, pmin(1-B, 1-C))' },
    'Ab+Bc':{ fn: (A,B,C) => Math.max(Math.min(A,1-B), Math.min(B,1-C)), label: 'A · b + B · c', r: 'pmax(pmin(A,1-B), pmin(B,1-C))' },
  };

  function build() {
    const e = exprs[sel.value];
    tbody.innerHTML = '';
    let positives = 0;
    for (let i = 0; i < 8; i++) {
      const A = (i >> 2) & 1, B = (i >> 1) & 1, C = i & 1;
      const out = e.fn(A, B, C);
      if (out === 1) positives++;
      const tr = document.createElement('tr');
      tr.innerHTML =
        `<td>${i + 1}</td>` +
        `<td>${A}</td><td>${B}</td><td>${C}</td>` +
        `<td style="font-weight:700;color:${out ? 'var(--accent2)' : 'var(--ink-faint)'}">${out}</td>`;
      if (out === 1) tr.style.background = 'var(--accent2-soft)';
      tbody.appendChild(tr);
    }
    note.innerHTML = `運算式 <code class="inline">${e.label}</code> → R 寫法 <code class="inline">${e.r}</code>。` +
      `共 <strong>${positives}</strong> 個 configuration 的 outcome value 為 1（true）。`;
  }
  sel.addEventListener('input', build);
  build();
}

/* ===========================================================
   Widget: mini R console emulator (whitelisted expressions)
   =========================================================== */
function initMiniR(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const input = root.querySelector('input[type=text]');
  const log = root.querySelector('[data-rlog]');

  function evalLine(src) {
    const s = src.trim();
    try {
      if (/^[0-9+\-*/.()\s^]+$/.test(s)) {
        const js = s.replace(/\^/g, '**');
        const v = Function('"use strict";return (' + js + ')')();
        return '[1] ' + (Number.isInteger(v) ? v : +v.toFixed(6));
      }
      let m;
      if ((m = s.match(/^sqrt\(([-0-9.]+)\)$/))) return '[1] ' + +Math.sqrt(+m[1]).toFixed(6);
      if ((m = s.match(/^prod\(([-0-9.,\s]+)\)$/))) return '[1] ' + m[1].split(',').map(Number).reduce((a,b)=>a*b,1);
      if ((m = s.match(/^sum\(([-0-9.,\s]+)\)$/))) return '[1] ' + m[1].split(',').map(Number).reduce((a,b)=>a+b,0);
      if ((m = s.match(/^seq\((\d+)\)$/))) { const n=+m[1]; return '[1] ' + Array.from({length:n},(_,i)=>i+1).join(' '); }
      if ((m = s.match(/^(\d+):(\d+)$/))) { const a=+m[1],b=+m[2]; const arr=[]; for(let i=a;i<=b;i++)arr.push(i); return '[1] ' + arr.join(' '); }
      if ((m = s.match(/^rep\((\d+),\s*(?:times\s*=\s*)?(\d+)\)$/))) { const v=+m[1],n=+m[2]; return '[1] ' + Array(n).fill(v).join(' '); }
      if (s === 'sin(pi/2)') return '[1] 1';
      if (s === 'pi') return '[1] 3.141593';
      if ((m = s.match(/^(\d+(?:\.\d+)?)\s*==\s*(\d+(?:\.\d+)?)$/))) return '[1] ' + (+m[1] === +m[2] ? 'TRUE' : 'FALSE');
      if ((m = s.match(/^(\d+(?:\.\d+)?)\s*!=\s*(\d+(?:\.\d+)?)$/))) return '[1] ' + (+m[1] !== +m[2] ? 'TRUE' : 'FALSE');
      return 'Error: 此示範主控台僅支援基本算術、sum()、prod()、sqrt()、seq()、rep()、a:b 等運算';
    } catch (e) {
      return 'Error: 無法解析的運算式';
    }
  }

  function run() {
    const src = input.value;
    if (!src.trim()) return;
    const res = evalLine(src);
    const line = document.createElement('div');
    line.innerHTML = `<span class="c-out">&gt; ${escapeHtml(src)}</span>\n<span class="hl">${escapeHtml(res)}</span>`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    input.value = '';
  }
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  root.querySelector('.btn').addEventListener('click', run);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ===========================================================
   Auto-init by data attributes
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-widget=setops]').forEach((el) => initSetOps(el.id));
  document.querySelectorAll('[data-widget=fuzzy]').forEach((el) => initFuzzy(el.id));
  document.querySelectorAll('[data-widget=truthtable]').forEach((el) => initTruthTable(el.id));
  document.querySelectorAll('[data-widget=minir]').forEach((el) => initMiniR(el.id));
});
