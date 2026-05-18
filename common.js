/* ═══════════════════════════════════════
   CALQIO — Common JS v2
   ═══════════════════════════════════════ */

// ── Theme ──────────────────────────────
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
    : (lc.darkBtn  || '🌙 Dark');
}

// ── Language menu ───────────────────────
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
function switchLang(lang) {
  const parts = location.pathname.split('/').filter(Boolean);
  const file  = parts[parts.length - 1] || 'index.html';
  const page  = file.includes('.html') ? file : 'index.html';
  location.href = '/' + lang + '/' + page;
}

// ── Formatting ──────────────────────────
function fmt(n) {
  const lc = window.LC || {};
  return (lc.cur || '') + Math.round(Math.abs(n)).toLocaleString() + (lc.suf || '');
}
function fmtSigned(n) {
  const lc = window.LC || {};
  return (n >= 0 ? '' : '-') + (lc.cur || '') + Math.round(Math.abs(n)).toLocaleString() + (lc.suf || '');
}
function pct(n)  { return (isFinite(n) ? n.toFixed(2) : '0.00') + '%'; }
function xm(n)   { return (isFinite(n) ? n.toFixed(2) : '0.00') + 'x'; }
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}
function need() { toast((window.LC && window.LC.tf) || 'Please fill in all fields'); }
function copyLink() {
  navigator.clipboard.writeText(location.href)
    .then(() => toast((window.LC && window.LC.tc) || '링크 복사됨 🔗'));
}

// ── Quick-adjust helpers ─────────────────
function addVal(id, v) { const e=document.getElementById(id); if(e){ e.value=Math.max(0,(+e.value||0)+v); liveCalc(); } }
function addPct(id, v) { const e=document.getElementById(id); if(e){ e.value=Math.max(0,(+e.value||0)+v).toFixed(1); liveCalc(); } }
function addInt(id, v) { const e=document.getElementById(id); if(e){ e.value=Math.max(1,+e.value+v); liveCalc(); } }
function liveCalc() { /* overridden per page */ }

// ── show/hide result ────────────────────
function show(n) {
  const e = document.getElementById('e' + n);
  const r = document.getElementById('r' + n);
  if (e) e.style.display = 'none';
  if (r) r.style.display = 'block';
}

// ── Calculators (kept for legacy index) ─
function calcC() {
  const P=+v('p')||0, r=+v('r')/100||0, y=+v('y')||0, m=+v('m')||0;
  if(!P||!r||!y){need();return;}
  let bal=P,contrib=P,rows=[];
  for(let i=1;i<=y;i++){bal=bal*(1+r)+m*12;contrib+=m*12;rows.push({y:i,b:bal,p:bal-contrib,r:(bal-contrib)/contrib*100});}
  set('v-fa',fmt(bal)); set('v-tp',fmt(contrib)); set('v-pf',fmt(bal-contrib));
  set('v-rr',pct((bal-contrib)/contrib*100)); set('v-mx',xm(bal/P));
  const tb=document.getElementById('ci-tbody');
  if(tb)tb.innerHTML=rows.map(d=>`<tr><td>${d.y}년</td><td>${fmt(d.b)}</td><td style="color:var(--pos)">${fmt(d.p)}</td><td style="color:var(--pos)">${pct(d.r)}</td></tr>`).join('');
  show(0);
}
function calcR() {
  const b=+v('bp')||0,s=+v('sp')||0,q=+v('q')||0,f=+v('f')/100;
  if(!b||!s||!q){need();return;}
  const bt=b*q,st=s*q,ft=(bt+st)*f,profit=st-bt-ft;
  const rpEl=document.getElementById('v-rp');
  if(rpEl){rpEl.textContent=fmt(Math.abs(profit));rpEl.className='rv '+(profit>=0?'pos':'neg');}
  set('v-rrate',pct(profit/bt*100)); set('v-bt',fmt(bt)); set('v-st',fmt(st)); set('v-ft',fmt(ft));
  show(1);
}
function calcD() {
  const ab=+v('ab')||0,aq=+v('aq')||0,np=+v('np')||0,nq=+v('nq')||0;
  if(!ab||!aq||!np||!nq){need();return;}
  const ti=ab*aq+np*nq,tq=aq+nq,na=ti/tq;
  const lc=window.LC||{};
  set('v-na',fmt(na)); set('v-tq',tq+(lc.sh2||'주')); set('v-ti',fmt(ti)); set('v-dr',pct((ab-na)/ab*100));
  show(2);
}
function calcL() {
  const L=+v('loan')||0,ir=+v('lrate')/100/12||0,n=+v('lterm')*12||0;
  if(!L||!ir||!n){need();return;}
  const mp=L*ir*Math.pow(1+ir,n)/(Math.pow(1+ir,n)-1);
  set('v-monthly',fmt(mp)); set('v-totalrep',fmt(mp*n)); set('v-totalint',fmt(mp*n-L));
  show(3);
}
function calcDiv() {
  const p=+v('dprice')||0,d=+v('ddiv')||0,q=+v('dqty')||0,t=+v('dtax')/100||0;
  if(!p||!d){need();return;}
  const annual=d*q,tax=annual*t;
  set('v-dyield',pct(d/p*100)); set('v-dannual',fmt(annual)); set('v-dafter',fmt(annual-tax)); set('v-dmonthly',fmt((annual-tax)/12));
  show(4);
}
function calcT() {
  const b=+v('tbase')||0,tp=+v('tprofit')/100||0,sl=+v('tstop')/100||0,qty=+v('tqty')||0;
  if(!b||!tp){need();return;}
  const targetP=b*(1+tp),stopP=b*(1-sl);
  set('v-tprice',fmt(targetP)); set('v-sprice',fmt(stopP));
  if(qty){set('v-tprofit2',fmt((targetP-b)*qty));set('v-sloss',fmt((b-stopP)*qty));}
  set('v-rratio',(sl>0?(tp/sl).toFixed(2):'—')+':1');
  show(5);
}
function calcTax() {
  const b=+v('taxbuy')||0,s=+v('taxsell')||0,f=+v('taxfee')||0,d=+v('taxded')||0;
  if(!b||!s){need();return;}
  const gain=s-b-f,base=Math.max(0,gain-d),tax=base*0.22;
  set('v-taxgain',fmt(gain)); set('v-taxamt',fmt(tax)); set('v-taxincome',fmt(gain-tax));
  show(6);
}
let pMode=0;
function selP(i) {
  pMode=i;
  document.querySelectorAll('.pc').forEach((c,idx)=>c.classList.toggle('sel',idx===i));
  for(let j=0;j<4;j++){const pf=document.getElementById('pf'+j);if(pf)pf.style.display=j===i?'block':'none';}
}
function calcP() {
  const a=+v('pa'+pMode)||0,b=+v('pb'+pMode)||0;
  if((!a&&pMode!==2)||!b){need();return;}
  let res='';
  if(pMode===0) res=pct(a/b*100);
  else if(pMode===1) res=fmt(a*b/100);
  else if(pMode===2) res=pct((b-a)/a*100);
  else res=fmt(a*(1+b/100));
  set('v-pans',res); show(7);
}

// ── Utils ───────────────────────────────
function v(id) { const e=document.getElementById(id); return e?e.value:0; }
function set(id,val) { const e=document.getElementById(id); if(e)e.textContent=val; }

// ── Init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('calqio_theme') === 'light') document.body.classList.add('light-mode');
  updateThemeBtn();
});
