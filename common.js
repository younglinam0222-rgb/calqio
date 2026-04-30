/* ═══════════════════════════════════════
   CALQIO — Common JS (Calc Functions)
   ═══════════════════════════════════════ */

// ── Theme ──
function toggleTheme() {
  const light = document.body.classList.toggle('light-mode');
  localStorage.setItem('calqio_theme', light ? 'light' : 'dark');
  updateThemeBtn();
}
function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const lc = window.LC || {};
  btn.textContent = document.body.classList.contains('light-mode')
    ? (lc.lightBtn || '☀️ Light')
    : (lc.darkBtn || '🌙 Dark');
}

// ── Language menu ──
function toggleMenu() {
  document.getElementById('lBtn')?.classList.toggle('open');
  document.getElementById('lDrop')?.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.lw')) {
    document.getElementById('lBtn')?.classList.remove('open');
    document.getElementById('lDrop')?.classList.remove('open');
  }
});

// ── Switch language (navigate to same page in another lang folder) ──
function switchLang(lang) {
  const parts = location.pathname.split('/').filter(Boolean);
  const file = parts[parts.length - 1] || 'index.html';
  const page = file.includes('.html') ? file : 'index.html';
  location.href = '/' + lang + '/' + page;
}

// ── Formatting ──
function fmt(n) {
  const lc = window.LC || {};
  return (lc.cur || '') + Math.round(Math.abs(n)).toLocaleString() + (lc.suf || '');
}
function fmtSigned(n) {
  const lc = window.LC || {};
  return (n >= 0 ? '' : '-') + (lc.cur || '') + Math.round(Math.abs(n)).toLocaleString() + (lc.suf || '');
}
function pct(n) { return (isFinite(n) ? n.toFixed(2) : '0.00') + '%'; }
function xm(n) { return (isFinite(n) ? n.toFixed(2) : '0.00') + 'x'; }
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}
function need() { toast((window.LC && window.LC.tf) || 'Please fill in all fields'); }

// ── Calculators ──
function calcC() {
  const elP = document.getElementById('p'); if (!elP) return;
  const P = +elP.value || 0, r = +document.getElementById('r').value / 100 || 0,
        y = +document.getElementById('y').value || 0, m = +document.getElementById('m').value || 0;
  if (!P || !r || !y) { need(); return; }
  let bal = P, contrib = P;
  for (let i = 1; i <= y; i++) { bal = bal * (1 + r) + m * 12; contrib += m * 12; }
  document.getElementById('v-fa').textContent = fmt(bal);
  document.getElementById('v-tp').textContent = fmt(contrib);
  document.getElementById('v-pf').textContent = fmt(bal - contrib);
  document.getElementById('v-rr').textContent = pct((bal - contrib) / contrib * 100);
  document.getElementById('v-mx').textContent = xm(bal / P);
  show(0);
}

function calcR() {
  const elBP = document.getElementById('bp'); if (!elBP) return;
  const b = +elBP.value || 0, s = +document.getElementById('sp').value || 0,
        q = +document.getElementById('q').value || 0, f = +document.getElementById('f').value / 100;
  if (!b || !s || !q) { need(); return; }
  const bt = b * q, st = s * q, ft = (bt + st) * f, profit = st - bt - ft;
  const rpEl = document.getElementById('v-rp');
  rpEl.textContent = fmt(Math.abs(profit));
  rpEl.className = 'rv ' + (profit >= 0 ? 'pos' : 'neg');
  document.getElementById('v-rrate').textContent = pct(profit / bt * 100);
  document.getElementById('v-bt').textContent = fmt(bt);
  document.getElementById('v-st').textContent = fmt(st);
  document.getElementById('v-ft').textContent = fmt(ft);
  show(1);
}

function calcD() {
  const elAB = document.getElementById('ab'); if (!elAB) return;
  const ab = +elAB.value || 0, aq = +document.getElementById('aq').value || 0,
        np = +document.getElementById('np').value || 0, nq = +document.getElementById('nq').value || 0;
  if (!ab || !aq || !np || !nq) { need(); return; }
  const ti = ab * aq + np * nq, tq = aq + nq, na = ti / tq;
  const lc = window.LC || {};
  document.getElementById('v-na').textContent = fmt(na);
  document.getElementById('v-tq').textContent = tq + (lc.sh2 || '');
  document.getElementById('v-ti').textContent = fmt(ti);
  document.getElementById('v-dr').textContent = pct((ab - na) / ab * 100);
  show(2);
}

function calcL() {
  const elLoan = document.getElementById('loan'); if (!elLoan) return;
  const L = +elLoan.value || 0, ir = +document.getElementById('lrate').value / 100 / 12 || 0,
        n = +document.getElementById('lterm').value * 12 || 0;
  if (!L || !ir || !n) { need(); return; }
  const mp = L * ir * Math.pow(1 + ir, n) / (Math.pow(1 + ir, n) - 1);
  document.getElementById('v-monthly').textContent = fmt(mp);
  document.getElementById('v-totalrep').textContent = fmt(mp * n);
  document.getElementById('v-totalint').textContent = fmt(mp * n - L);
  show(3);
}

function calcDiv() {
  const elDp = document.getElementById('dprice'); if (!elDp) return;
  const p = +elDp.value || 0, d = +document.getElementById('ddiv').value || 0,
        q = +document.getElementById('dqty').value || 0, t = +document.getElementById('dtax').value / 100 || 0;
  if (!p || !d) { need(); return; }
  const annual = d * q, tax = annual * t;
  document.getElementById('v-dyield').textContent = pct(d / p * 100);
  document.getElementById('v-dannual').textContent = fmt(annual);
  document.getElementById('v-dafter').textContent = fmt(annual - tax);
  document.getElementById('v-dmonthly').textContent = fmt((annual - tax) / 12);
  show(4);
}

function calcT() {
  const elTb = document.getElementById('tbase'); if (!elTb) return;
  const b = +elTb.value || 0, tp = +document.getElementById('tprofit').value / 100 || 0,
        sl = +document.getElementById('tstop').value / 100 || 0, qty = +document.getElementById('tqty').value || 0;
  if (!b || !tp) { need(); return; }
  const targetP = b * (1 + tp), stopP = b * (1 - sl);
  const lc = window.LC || {};
  document.getElementById('v-tprice').textContent = fmt(targetP);
  document.getElementById('v-sprice').textContent = fmt(stopP);
  if (qty) {
    document.getElementById('v-tprofit2').textContent = fmt((targetP - b) * qty);
    document.getElementById('v-sloss').textContent = fmt((b - stopP) * qty);
  }
  const rr = sl > 0 ? (tp / sl).toFixed(2) : '—';
  document.getElementById('v-rratio').textContent = rr + ':1';
  show(5);
}

function calcTax() {
  const elTb = document.getElementById('taxbuy'); if (!elTb) return;
  const b = +elTb.value || 0, s = +document.getElementById('taxsell').value || 0,
        f = +document.getElementById('taxfee').value || 0, d = +document.getElementById('taxded').value || 0;
  if (!b || !s) { need(); return; }
  const gain = s - b - f, base = Math.max(0, gain - d), tax = base * 0.22;
  document.getElementById('v-taxgain').textContent = fmt(gain);
  document.getElementById('v-taxamt').textContent = fmt(tax);
  document.getElementById('v-taxincome').textContent = fmt(gain - tax);
  show(6);
}

let pMode = 0;
function selP(i) {
  pMode = i;
  document.querySelectorAll('.pc').forEach((c, idx) => c.classList.toggle('sel', idx === i));
  for (let j = 0; j < 4; j++) {
    const pf = document.getElementById('pf' + j);
    if (pf) pf.style.display = j === i ? 'block' : 'none';
  }
}
function calcP() {
  const elA = document.getElementById('pa' + pMode); if (!elA) return;
  const a = +elA.value || 0, b = +document.getElementById('pb' + pMode).value || 0;
  if ((!a && pMode !== 2) || !b) { need(); return; }
  let res = '';
  if (pMode === 0) res = pct(a / b * 100);
  else if (pMode === 1) res = fmt(a * b / 100);
  else if (pMode === 2) res = pct((b - a) / a * 100);
  else res = fmt(a * (1 + b / 100));
  document.getElementById('v-pans').textContent = res;
  show(7);
}

function show(n) {
  const e = document.getElementById('e' + n);
  const r = document.getElementById('r' + n);
  if (e) e.style.display = 'none';
  if (r) r.style.display = 'block';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('calqio_theme') === 'light') document.body.classList.add('light-mode');
  updateThemeBtn();
});
