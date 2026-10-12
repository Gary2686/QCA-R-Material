/* ===========================================================
   重新設計社會科學研究（Ragin, 2008）互動教材 — 共用腳本
   需先載入 ../js/main.js（閱讀進度條、導覽高亮）
   提供：RG.quiz / RG.tabs / RG.done / RG.fz（模糊集運算）/ RG.xy（XY 圖）
   =========================================================== */
window.RG = (function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  /* ---------- 模糊集運算 ---------- */
  const fz = {
    and: (...a) => Math.min(...a),
    or: (...a) => Math.max(...a),
    not: (x) => 1 - x,
    sum: (arr) => arr.reduce((s, v) => s + v, 0),
    // 充分性一致性 Consistency(X ≤ Y) = Σmin(X,Y) / ΣX
    consSuf(X, Y) { const d = fz.sum(X); return d ? fz.sum(X.map((x, i) => Math.min(x, Y[i]))) / d : NaN; },
    // 充分性覆蓋度 Coverage(X ≤ Y) = Σmin(X,Y) / ΣY
    covSuf(X, Y) { const d = fz.sum(Y); return d ? fz.sum(X.map((x, i) => Math.min(x, Y[i]))) / d : NaN; },
    // 必要性一致性 Consistency(Y ≤ X) = Σmin(X,Y) / ΣY
    consNec(X, Y) { return fz.covSuf(X, Y); },
    // 必要性覆蓋度 Coverage(Y ≤ X) = Σmin(X,Y) / ΣX
    covNec(X, Y) { return fz.consSuf(X, Y); },
    // 直接校準法（Ragin 2008, ch.5）：完全隸屬 = log odds +3、交叉點 = 0、完全不隸屬 = −3
    calibrate(x, full, cross, non) {
      const dev = x - cross;
      let lo;
      if (full > non) lo = dev >= 0 ? dev * (3 / (full - cross)) : dev * (-3 / (non - cross));
      else lo = dev <= 0 ? dev * (3 / (full - cross)) : dev * (-3 / (non - cross));
      return Math.exp(lo) / (1 + Math.exp(lo));
    },
    fmt(v, d = 2) { return isFinite(v) ? v.toFixed(d) : '—'; },
  };

  /* ---------- XY 散佈圖（單位正方形，含對角線）---------- */
  // svg: <svg class="plot" viewBox="0 0 400 400">；pts: [{x, y, label?, cls?}]
  function xy(svg, pts, opt = {}) {
    const W = 400, H = 400, m = { l: 48, r: 16, t: 16, b: 44 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const sx = (v) => m.l + v * pw, sy = (v) => m.t + (1 - v) * ph;
    const ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const el = (tag, attrs, text) => {
      const e = document.createElementNS(ns, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (text != null) e.textContent = text;
      svg.appendChild(e);
      return e;
    };
    if (opt.shade === 'suf') el('polygon', { class: 'area-ok', points: `${sx(0)},${sy(0)} ${sx(1)},${sy(1)} ${sx(0)},${sy(1)}` });
    if (opt.shade === 'nec') el('polygon', { class: 'area-ok', points: `${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)}` });
    for (let i = 0; i <= 10; i++) {
      const v = i / 10;
      el('line', { class: 'grid', x1: sx(v), y1: sy(0), x2: sx(v), y2: sy(1) });
      el('line', { class: 'grid', x1: sx(0), y1: sy(v), x2: sx(1), y2: sy(v) });
      if (i % 2 === 0) {
        el('text', { class: 'lbl', x: sx(v), y: sy(0) + 16, 'text-anchor': 'middle' }, v.toFixed(1));
        el('text', { class: 'lbl', x: sx(0) - 8, y: sy(v) + 4, 'text-anchor': 'end' }, v.toFixed(1));
      }
    }
    el('line', { class: 'axis', x1: sx(0), y1: sy(0), x2: sx(1), y2: sy(0) });
    el('line', { class: 'axis', x1: sx(0), y1: sy(0), x2: sx(0), y2: sy(1) });
    if (opt.diag !== false) el('line', { class: 'diag', x1: sx(0), y1: sy(0), x2: sx(1), y2: sy(1) });
    if (opt.cross) {
      el('line', { class: 'grid', x1: sx(.5), y1: sy(0), x2: sx(.5), y2: sy(1), 'stroke-dasharray': '3 3', style: 'stroke:var(--ink-faint)' });
      el('line', { class: 'grid', x1: sx(0), y1: sy(.5), x2: sx(1), y2: sy(.5), 'stroke-dasharray': '3 3', style: 'stroke:var(--ink-faint)' });
    }
    el('text', { class: 'ttl', x: sx(.5), y: H - 8, 'text-anchor': 'middle' }, opt.xlab || 'X');
    const yl = el('text', { class: 'ttl', x: 14, y: sy(.5), 'text-anchor': 'middle', transform: `rotate(-90 14 ${sy(.5)})` }, opt.ylab || 'Y');
    yl.setAttribute('dy', '0');
    if (opt.curve) {
      const d = opt.curve.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
      el('path', { class: 'curve', d });
    }
    pts.forEach((p) => {
      const c = el('circle', { class: 'pt ' + (p.cls || ''), cx: sx(p.x), cy: sy(p.y), r: p.r || 5.5 });
      if (p.label) {
        const t = document.createElementNS(ns, 'title');
        t.textContent = `${p.label}  (X=${p.x.toFixed(2)}, Y=${p.y.toFixed(2)})`;
        c.appendChild(t);
      }
      if (p.tag) el('text', { class: 'lbl', x: sx(p.x) + 7, y: sy(p.y) - 6 }, p.tag);
    });
    return { sx, sy, el };
  }

  /* ---------- 測驗 ----------
     <div class="quiz" data-n="1" data-answer="2">
       <p class="q">題目</p>
       <div class="opts"><button class="opt">A</button>…</div>
       <div class="explain">解析</div>
     </div>                                                         */
  function initQuiz() {
    const quizzes = [...document.querySelectorAll('.quiz')];
    quizzes.forEach((qz, qi) => {
      if (!qz.dataset.n) qz.dataset.n = qi + 1;
      const ans = parseInt(qz.dataset.answer, 10);
      const opts = [...qz.querySelectorAll('.opt')];
      opts.forEach((b, i) => {
        b.type = 'button';
        b.addEventListener('click', () => {
          if (qz.classList.contains('answered')) return;
          qz.classList.add('answered');
          qz.dataset.correct = i === ans ? '1' : '0';
          opts.forEach((o, j) => { o.disabled = true; if (j === ans) o.classList.add('right'); });
          if (i !== ans) b.classList.add('wrong');
          const ex = qz.querySelector('.explain');
          if (ex && !ex.querySelector('.verdict')) {
            const v = document.createElement('span');
            v.className = 'verdict';
            v.style.color = i === ans ? 'var(--ok)' : 'var(--bad)';
            v.textContent = i === ans ? '✔ 答對了！' : '✘ 再想想：';
            ex.prepend(v);
          }
          updateScore();
        });
      });
    });
    const scoreEl = document.querySelector('[data-quiz-score]');
    const resetBtn = document.querySelector('[data-quiz-reset]');
    function updateScore() {
      if (!scoreEl) return;
      const done = quizzes.filter((q) => q.classList.contains('answered'));
      const right = done.filter((q) => q.dataset.correct === '1').length;
      scoreEl.textContent = `已作答 ${done.length} / ${quizzes.length} 題，答對 ${right} 題`;
    }
    if (resetBtn) resetBtn.addEventListener('click', () => {
      quizzes.forEach((qz) => {
        qz.classList.remove('answered'); delete qz.dataset.correct;
        qz.querySelectorAll('.opt').forEach((o) => { o.disabled = false; o.classList.remove('right', 'wrong'); });
        const v = qz.querySelector('.verdict'); if (v) v.remove();
      });
      updateScore();
    });
    updateScore();
  }

  /* ---------- 分頁切換（fsQCA / R）----------
     <div class="sw-tabs"><div class="seg"><button data-tab="a" class="on">…</button>…</div>
       <div class="sw-pane on" data-pane="a">…</div>…</div>           */
  function initTabs() {
    document.querySelectorAll('.sw-tabs').forEach((box) => {
      const btns = box.querySelectorAll(':scope > .seg button');
      btns.forEach((b) => b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.toggle('on', x === b));
        box.querySelectorAll(':scope > .sw-pane').forEach((p) => p.classList.toggle('on', p.dataset.pane === b.dataset.tab));
      }));
    });
  }

  /* ---------- 完成標記（僅存在讀者自己的瀏覽器）---------- */
  function initDone() {
    const box = document.querySelector('.done-box');
    if (box) {
      const key = 'ragin-done-' + box.dataset.ch;
      const btn = box.querySelector('button');
      const msg = box.querySelector('.msg');
      const paint = () => {
        const on = store.get(key) === '1';
        box.classList.toggle('is-done', on);
        btn.classList.toggle('ok', on);
        btn.textContent = on ? '✔ 已完成（再按一次取消）' : '標記本章為已讀';
        if (msg) msg.textContent = on ? '太好了！可以前往下一章。' : '讀完、做完測驗後，幫自己打個勾。';
      };
      btn.addEventListener('click', () => { store.get(key) === '1' ? store.del(key) : store.set(key, '1'); paint(); });
      paint();
    }
    document.querySelectorAll('.chapter-card[data-ch]').forEach((c) => {
      if (store.get('ragin-done-' + c.dataset.ch) === '1') c.classList.add('is-done');
    });
  }

  document.addEventListener('DOMContentLoaded', () => { initQuiz(); initTabs(); initDone(); });

  return { fz, xy, store };
})();
