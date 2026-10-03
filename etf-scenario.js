/* User-supplied effective annual returns; no historical market data. */
(() => {
  const form=document.getElementById('scenario-form'), out=document.getElementById('scenario-results');
  if(!form)return;
  const ids=['etfAmt','monthly','years','rateQQQ','rateTQQQ','rateSCHD','rateVOO'];
  const q=new URLSearchParams(location.search);
  ids.forEach(id=>{if(q.has(id))document.getElementById(id).value=q.get(id);});
  if(q.has('etfYear'))document.getElementById('legacy-scenario').hidden=false;
  let lastValid=false;
  function calculate(){
    out.replaceChildren();lastValid=false;
    const rules=[['etfAmt',0,1e15],['monthly',0,1e15],['years',1,100,true],...ids.slice(3).map(id=>[id,-100,1000])];
    const values=readInputs(rules,99);if(!values)return;
    const [principal,monthly,years,...rates]=values;
    if(principal===0&&monthly===0){inputIssue('etfAmt',1);return;}
    const formatter=new Intl.NumberFormat(document.documentElement.lang,{maximumFractionDigits:0});
    const names=['QQQ','TQQQ','SCHD','VOO'];
    const rows=rates.map((annual,index)=>{
      const rate=annual===-100?-1:Math.expm1(Math.log1p(annual/100)/12);
      let balance=principal;const history=[];
      for(let month=1;month<=years*12;month++){
        balance=balance*(1+rate)+monthly;
        if(!Number.isFinite(balance)||balance>Number.MAX_SAFE_INTEGER)return null;
        if(month%12===0)history.push(balance);
      }
      return {name:names[index],balance,history};
    });
    if(rows.some(r=>!r)){inputIssue('years',2);return;}
    const tbody=document.createDocumentFragment();
    for(let year=1;year<=years;year++){
      const tr=document.createElement('tr');
      [year,principal+monthly*year*12,...rows.map(r=>r.history[year-1])].forEach(value=>{
        const td=document.createElement('td');td.textContent=formatter.format(value);tr.append(td);
      });tbody.append(tr);
    }
    out.append(tbody);lastValid=true;
  }
  form.addEventListener('input',calculate);
  form.addEventListener('submit',e=>{e.preventDefault();calculate();});
  document.getElementById('scenario-share').addEventListener('click',async()=>{
    calculate();if(!lastValid)return;
    const params=new URLSearchParams({v:'2'});ids.forEach(id=>params.set(id,document.getElementById(id).value));
    const url=location.origin+location.pathname+'?'+params;
    const link=document.getElementById('scenario-link');link.value=url;link.hidden=false;link.select();
    try{await navigator.clipboard.writeText(url);}catch{/* Keep a selectable URL when clipboard permission is unavailable. */}
  });
  calculate();
})();
