/* ═══════════════════════════════════════
   CALQIO — Common JS v2
   ═══════════════════════════════════════ */

// ── Theme ──────────────────────────────
function toggleTheme() {
  const light = document.body.classList.toggle('light-mode');
  try { localStorage.setItem('calqio_theme', light ? 'light' : 'dark'); } catch {}
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
  const page = parts.length > 1 ? parts[parts.length - 1].replace(/\.html$/, '') : '';
  location.href = '/' + lang + (page && page !== 'index' ? '/' + page : '');
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
function liveCalc() {
  var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '') + '.html';
  var map = {
    'compound.html': function(){try{calcC();}catch(e){}},
    'return.html':   function(){try{calcR();}catch(e){}},
    'average-down.html': function(){try{calcD();}catch(e){}},
    'loan.html':     function(){try{calcL();}catch(e){}},
    'dividend.html': function(){try{calcDiv();}catch(e){}},
    'target.html':   function(){try{calcT();}catch(e){}},
    'tax.html':      function(){try{calcTax();}catch(e){}},
    'percent.html':  function(){try{calcP();}catch(e){}},
  };
  var fn = map[page];
  if (fn) fn();
  // DOMContentLoaded 이후에 세팅된 per-page calcFn도 호출
  if (typeof window._calcFn === 'function') window._calcFn();
}

// ── show/hide result ────────────────────
function show(n) {
  const e = document.getElementById('e' + n);
  const r = document.getElementById('r' + n);
  if (e) e.style.display = 'none';
  if (r) r.style.display = 'block';
}
// 오류 발생 시 이전 결과가 새 결과처럼 남지 않도록 되돌린다.
function hide(n) {
  const e = document.getElementById('e' + n);
  const r = document.getElementById('r' + n);
  if (e) e.style.display = '';
  if (r) r.style.display = 'none';
  if (n === 0) { const infl=document.getElementById('inflResult'); if(infl) infl.style.display='none'; window.compoundBalance=null; }
}

const INPUT_MESSAGES = {
  ko: ['유효한 숫자를 입력해주세요.', '허용 범위를 확인해주세요.', '계산 결과가 너무 큽니다. 값을 줄여주세요.'],
  en: ['Enter a valid number.', 'Check the allowed range.', 'Result is too large. Reduce the inputs.'],
  ja: ['有効な数値を入力してください。','入力範囲を確認してください。','結果が大きすぎます。入力値を小さくしてください。'],
  zh: ['请输入有效数字。','请检查允许的范围。','结果过大，请减小输入值。'],
  ar: ['أدخل رقماً صالحاً.','تحقق من النطاق المسموح.','النتيجة كبيرة جداً. قلل القيم.']
};
function inputIssue(id, code=0) {
  const input=document.getElementById(id); if(!input)return;
  input.setAttribute('aria-invalid','true');
  let error=document.getElementById(id+'-validation');
  if(!error){error=document.createElement('p');error.id=id+'-validation';error.className='field-validation';error.setAttribute('role','alert');input.insertAdjacentElement('afterend',error);input.setAttribute('aria-describedby',error.id);}
  error.textContent=(INPUT_MESSAGES[document.documentElement.lang]||INPUT_MESSAGES.en)[code];
}
function readInputs(rules, result) {
  let good=true;const values=[];
  for(const [id,min,max,integer] of rules){
    const el=document.getElementById(id);const raw=el?.value??'';const value=raw.trim()===''?NaN:Number(raw);
    el?.removeAttribute('aria-invalid');document.getElementById(id+'-validation')?.remove();
    if(!Number.isFinite(value)){inputIssue(id,0);good=false;}
    else if(value<min || value>max || (integer&&!Number.isInteger(value))){inputIssue(id,1);good=false;}
    values.push(value);
  }
  if(!good){hide(result);return null;}return values;
}
function finiteResult(values, id, result){
  if(values.every(Number.isFinite))return true;
  inputIssue(id,2);hide(result);return false;
}

// ── Calculators (kept for legacy index) ─
// compound.html(en/ja/zh/ar)이 사용하는 함수. 이 페이지들은 ko/compound.html과 달리
// 회차 단위(일/월/년) 선택이나 세금 옵션 UI가 없는 "연 수익률 + 월 납입×12" 모델을
// 그대로 유지한다 — 여기서는 입력검증·부호표시·오버플로 방지만 고친다.
function calcC() {
  const vals=readInputs([['p',0,1e15],['m',0,1e15],['y',1,2000,true],['r',-100,1e6]],0);if(!vals)return;
  const [P,M,y,rPct]=vals,r=rPct/100;
  if(P===0 && M===0){inputIssue('p',1);hide(0);return;}

  let bal=P, contrib=P, rows=[], overflow=false;
  for(let i=1;i<=y;i++){
    bal=bal*(1+r)+M*12;
    contrib+=M*12;
    if(!Number.isFinite(bal)||bal>Number.MAX_SAFE_INTEGER||contrib>Number.MAX_SAFE_INTEGER){ overflow=true; break; }
    rows.push({y:i,b:bal,p:bal-contrib,r: contrib!==0 ? (bal-contrib)/contrib*100 : 0});
  }
  if(overflow){inputIssue('y',2);hide(0);return;}

  window.compoundBalance=bal;
  const profit = bal-contrib;
  set('v-fa',fmt(bal)); set('v-tp',fmt(contrib)); set('v-pf',fmtSigned(profit));
  set('v-rr',pct(contrib!==0?profit/contrib*100:0));
  set('v-mx', P>0 ? xm(bal/P) : '—');
  const pfEl=document.getElementById('v-pf'); if(pfEl && pfEl.classList){ pfEl.classList.toggle('pos',profit>=0); pfEl.classList.toggle('neg',profit<0); }
  const rrEl=document.getElementById('v-rr'); if(rrEl && rrEl.classList){ rrEl.classList.toggle('pos',profit>=0); rrEl.classList.toggle('neg',profit<0); }
  const tb=document.getElementById('ci-tbody');
  if(tb)tb.innerHTML=rows.map(d=>`<tr><td>${d.y}</td><td>${fmt(d.b)}</td><td style="color:${d.p<0?'var(--neg)':'var(--pos)'}">${fmtSigned(d.p)}</td><td style="color:${d.r<0?'var(--neg)':'var(--pos)'}">${pct(d.r)}</td></tr>`).join('');
  show(0);
}
function calcR() {
  const vals=readInputs([['bp',Number.MIN_VALUE,1e15],['sp',0,1e15],['q',Number.MIN_VALUE,1e12],['f',0,100]],1);if(!vals)return;
  const [b,s,q,fee]=vals,f=fee/100;
  const bt=b*q,st=s*q,ft=(bt+st)*f,profit=st-bt-ft;
  if(!finiteResult([bt,st,ft,profit,profit/bt*100],'bp',1))return;
  const rpEl=document.getElementById('v-rp');
  if(rpEl){rpEl.textContent=fmtSigned(profit);rpEl.className='rv '+(profit>=0?'pos':'neg');}
  set('v-rrate',pct(profit/bt*100)); set('v-bt',fmt(bt)); set('v-st',fmt(st)); set('v-ft',fmt(ft));
  show(1);
}
function calcD() {
  const vals=readInputs([['ab',0,1e15],['aq',Number.MIN_VALUE,1e12],['np',0,1e15],['nq',0,1e12]],2);if(!vals)return;
  const [ab,aq,np,nq]=vals;
  const ti=ab*aq+np*nq,tq=aq+nq,na=ti/tq;
  const lc=window.LC||{};
  set('v-na',fmt(na)); set('v-tq',tq+(lc.sh2||'주')); set('v-ti',fmt(ti)); set('v-dr',ab===0?'—':pct((ab-na)/ab*100));
  show(2);
}
function calcL() {
  const vals=readInputs([['loan',Number.MIN_VALUE,1e15],['lrate',0,100],['lterm',1,100,true]],3);if(!vals)return;
  const [L,annual,years]=vals,ir=annual/100/12,n=years*12;
  const mp=ir===0?L/n:L*ir/(-Math.expm1(-n*Math.log1p(ir)));
  set('v-monthly',fmt(mp)); set('v-totalrep',fmt(mp*n)); set('v-totalint',fmt(mp*n-L));
  show(3);
}
function calcDiv() {
  const vals=readInputs([['dprice',Number.MIN_VALUE,1e15],['ddiv',0,1e15],['dqty',0,1e12],['dtax',0,100]],4);if(!vals)return;
  const [p,d,q,taxRate]=vals,t=taxRate/100;
  const annual=d*q,tax=annual*t;
  if(!finiteResult([annual,tax,d/p*100],'dprice',4))return;
  set('v-dyield',pct(d/p*100)); set('v-dannual',fmt(annual)); set('v-dafter',fmt(annual-tax)); set('v-dmonthly',fmt((annual-tax)/12));
  show(4);
}
function calcT() {
  const vals=readInputs([['tbase',Number.MIN_VALUE,1e15],['tprofit',0,1e6],['tstop',0,100],['tqty',0,1e12]],5);if(!vals)return;
  const [b,profitPct,stopPct,qty]=vals,tp=profitPct/100,sl=stopPct/100;
  const targetP=b*(1+tp),stopP=b*(1-sl);
  set('v-tprice',fmt(targetP)); set('v-sprice',fmt(stopP));
  set('v-tprofit2',fmt((targetP-b)*qty));set('v-sloss',fmt((b-stopP)*qty));
  set('v-rratio',(sl>0?(tp/sl).toFixed(2):'—')+':1');
  show(5);
}
function calcTax() {
  const vals=readInputs([['taxbuy',0,1e15],['taxsell',0,1e15],['taxfee',0,1e15],['taxded',0,1e15]],6);if(!vals)return;
  const [b,s,f,d]=vals;
  const gain=s-b-f,base=Math.max(0,gain-d),tax=base*0.22;
  set('v-taxgain',fmtSigned(gain)); set('v-taxamt',fmt(tax)); set('v-taxincome',fmtSigned(gain-tax));
  for(const id of ['v-taxgain','v-taxincome']){const el=document.getElementById(id);if(el){el.classList.toggle('neg',gain<0);el.classList.toggle('pos',gain>=0);}}
  show(6);
}
let pMode=0;
function selP(i) {
  pMode=i;
  document.querySelectorAll('.pc').forEach((c,idx)=>c.classList.toggle('sel',idx===i));
  for(let j=0;j<4;j++){const pf=document.getElementById('pf'+j);if(pf)pf.style.display=j===i?'block':'none';}
}
function calcP() {
  const vals=readInputs([['pa'+pMode,-1e15,1e15],['pb'+pMode,-1e15,1e15]],7);if(!vals)return;
  const [a,b]=vals;
  if((pMode===0&&b===0)||(pMode===2&&a===0)){inputIssue((pMode===0?'pb':'pa')+pMode,1);hide(7);return;}
  const result=pMode===0?a/b*100:pMode===1?a*b/100:pMode===2?(b-a)/a*100:a*(1+b/100);
  if(!finiteResult([result],'pa'+pMode,7))return;
  let res='';
  if(pMode===0) res=pct(a/b*100);
  else if(pMode===1) res=(a*b/100).toLocaleString(undefined,{maximumFractionDigits:6});
  else if(pMode===2) res=pct((b-a)/a*100);
  else res=(a*(1+b/100)).toLocaleString(undefined,{maximumFractionDigits:6});
  set('v-pans',res); show(7);
}

// ── Utils ───────────────────────────────
function v(id) { const e=document.getElementById(id); return e?e.value:0; }
function set(id,val) { const e=document.getElementById(id); if(e)e.textContent=val; }

// ── FX cache banner (tax pages) ─────────
async function calqioApplyFxBanner(options) {
  const rateEl = document.getElementById('fxRate');
  const timeEl = document.getElementById('fxTime');
  if (!rateEl) return;

  const opts = options || {};
  const suffix = opts.suffix != null ? opts.suffix : (window.LC && window.LC.suf) || '원';
  const naText = opts.naText || '—';
  const updatedPrefix =
    opts.updatedPrefix || '매매기준율 기준, 최종 갱신: ';
  const locale = opts.locale || (document.documentElement.lang || 'ko');

  try {
    const res = await fetch('/fx-rates.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('fx_cache_http_' + res.status);
    const data = await res.json();
    const usd = (data.rates || []).find((r) => r.cur_unit === 'USD');
    if (usd && usd.deal_bas_r != null) {
      rateEl.textContent =
        Math.round(usd.deal_bas_r).toLocaleString(locale) + suffix;
    } else {
      rateEl.textContent = naText;
    }
    if (timeEl) {
      if (data.updatedAt) {
        const d = new Date(data.updatedAt);
        const datePart = d.toLocaleDateString(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const timePart = d.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        timeEl.textContent = updatedPrefix + datePart + ' ' + timePart;
      } else {
        timeEl.textContent = updatedPrefix + '—';
      }
    }
  } catch {
    rateEl.textContent = naText;
    if (timeEl) timeEl.textContent = updatedPrefix + '—';
  }
}

// ── Init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try { if (localStorage.getItem('calqio_theme') === 'light') document.body.classList.add('light-mode'); } catch {}
  updateThemeBtn();
});
