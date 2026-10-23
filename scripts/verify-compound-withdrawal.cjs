// Browser checks run the actual page calculator, not a duplicated implementation.
const { chromium } = require('../../calqio/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:4180';
const numeric = text => Number(text.replace(/[^\d.-]/g, ''));
(async () => {
  const browser = await chromium.launch({channel:'chrome'});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  await page.route(/googlesyndication|doubleclick|google-analytics/,r=>r.abort());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/ko/compound');
  await page.waitForFunction(()=>typeof Chart !== 'undefined');
  async function calculate(overrides={}) {
    return page.evaluate(values=>{
      const defaults={p:1000000,m:0,y:2,r:10,unit:'y',tax:'0',timing:'end',withdrawal:'1',withdrawRate:'50',inflRate:'0'};
      setMode(values.mode??0);
      for(const [id,value] of Object.entries({...defaults,...values})){
        const el=document.getElementById(id);if(el)el.value=String(value);
      }
      document.getElementById('inflChk').checked=!!values.inflation;
      onUnitChange();
      return {valid:lastRunOk,summary:Object.fromEntries(['vf','vw','va','vc','vp','inflVal','inflBalance','inflCash'].map(id=>[id,document.getElementById(id).textContent])),chart:ci?.data.datasets.map(d=>({label:d.label,values:d.data})),rows:[...document.querySelectorAll('#tb tr')].map(tr=>[...tr.children].map(td=>td.textContent))};
    },overrides);
  }
  const result=await calculate();assert.equal(result.valid,true);
  for(const [id,expected]of Object.entries({vf:1102500,vw:102500,va:1205000,vc:1000000,vp:205000}))assert.equal(numeric(result.summary[id]),expected,id);
  assert.deepEqual(result.rows.map(r=>[numeric(r[4]),numeric(r[5]),numeric(r[1]),numeric(r[7])]),[[50000,50000,1050000,1100000],[52500,102500,1102500,1205000]]);
  assert.deepEqual(result.rows.map(r=>numeric(r[2])),[1000000,1050000]);
  assert.deepEqual(result.rows.map(r=>numeric(r[6])),[1000000,1000000]);
  const daily=await calculate({p:10000000,r:2.5,y:9,unit:'d',withdrawal:'0'});
  assert.deepEqual(daily.rows.slice(0,2).map(r=>numeric(r[1])),[10250000,10506250]);
  assert.equal(numeric(daily.rows[3][3]),269223);
  assert.equal(numeric(daily.rows[3][2]),10768906);
  assert.equal(numeric(daily.rows[3][1]),11038129);
  for(const timing of ['start','end']){
    const r=await calculate({mode:2,m:100000,timing});
    assert.equal(numeric(r.rows[0][2]),timing==='start'?1100000:1000000);
  }
  assert.deepEqual(result.chart[0].values,[1050000,1102500]);assert.deepEqual(result.chart[1].values,[50000,102500]);assert.deepEqual(result.chart[2].values,[1100000,1205000]);
  console.log('PASS 50% withdrawal: summary, table and chart agree on 1,102,500 + 102,500 = 1,205,000');
  for(const [values,final,cash]of [
    [{withdrawRate:0},1210000,0], [{withdrawal:'0'},1210000,0], [{withdrawRate:100},1000000,200000],
    [{r:0},1000000,0], [{r:-10},810000,0], [{r:-100},0,0],
    [{mode:1,p:0,m:100000,timing:'end'},205000,5000],
    [{mode:1,p:0,m:100000,timing:'start'},215250,15250],
    [{mode:2,p:1000000,m:100000,timing:'end'},1307500,107500],
    [{mode:2,p:1000000,m:100000,timing:'start'},1317750,117750],
    [{tax:'0.154',y:1},1042300,42300], [{tax:'0.154',y:2},1086389,86389],
    [{tax:'0.154',r:-10},810000,0], [{mode:1,p:0,m:100000,r:0,y:12},1200000,0]
  ]) {const r=await calculate(values);assert.equal(r.valid,true,JSON.stringify(values));assert.equal(numeric(r.summary.vf),final,JSON.stringify(values));assert.equal(numeric(r.summary.vw),cash,JSON.stringify(values));}
  console.log('PASS 0/100%, zero/loss/-100%, 3 modes, 2 contribution timings and positive-profit-only tax');
  for(const [values,expected]of [
    [{},1210000], [{mode:1,p:0,m:100000,r:0,y:12},1200000],
    [{r:0,y:12},1000000], [{r:-10},810000],
    [{mode:1,p:0,m:100000,timing:'end'},210000], [{mode:1,p:0,m:100000,timing:'start'},231000]
  ])assert.equal(numeric((await calculate({...values,withdrawal:'0'})).summary.vf),expected);
  console.log('PASS original A-F cases with withdrawals disabled');
  for(const unit of ['y','mo','d']){
    const r=await calculate({unit,inflation:true,inflRate:10});
    const years=unit==='y'?2:unit==='mo'?2/12:2/365,discount=1.1**years;
    assert.equal(numeric(r.summary.inflVal),Math.round(1205000/discount));
    assert.equal(numeric(r.summary.inflBalance),Math.round(1102500/discount));
    assert.equal(numeric(r.summary.inflCash),Math.round(102500/discount));
  }
  assert.equal(numeric((await calculate({inflation:true,inflRate:0})).summary.inflVal),1205000);
  for(const withdrawRate of ['',-1,100.1,'Infinity','NaN']){
    const r=await calculate({withdrawRate});assert.equal(r.valid,false,String(withdrawRate));
    assert.equal(await page.locator('#rb').isVisible(),false);assert.equal(await page.locator('#withdrawRate-validation').isVisible(),true);assert.equal(await page.evaluate(()=>ci),null);
  }
  assert.equal((await calculate({withdrawal:'0',withdrawRate:''})).valid,true);
  assert.equal((await calculate({y:2000,r:100000})).valid,false);
  console.log('PASS real values for years/months/days; blank/range/non-finite/overflow validation and stale-result clearing');
  await calculate({mode:2,m:100000,timing:'start',unit:'mo',tax:'0.154',inflation:true,inflRate:2.5,withdrawRate:37.5});
  await page.evaluate(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.sharedText=text;}}});
  });
  await page.evaluate(()=>calqioShare());const shared=await page.evaluate(()=>window.sharedText);
  assert.equal(new URL(shared).searchParams.get('we'),'1');assert.equal(new URL(shared).searchParams.get('wr'),'37.5');
  await page.goto(shared);
  for(const [id,expected]of Object.entries({withdrawal:'1',withdrawRate:'37.5',p:'1000000',m:'100000',unit:'mo',timing:'start',tax:'0.154',inflRate:'2.5'}))assert.equal(await page.locator('#'+id).inputValue(),expected);
  assert.equal(await page.locator('#inflChk').isChecked(),true);assert.equal(await page.evaluate(()=>currentMode),2);
  for(const suffix of ['we=1&wr=101','we=1&wr=-1','we=1&wr=','we=1&wr=foo','we=invalid&wr=50','we=1']){
    await page.goto(base+'/ko/compound?p=1000000&m=0&y=2&r=10&'+suffix);assert.equal(await page.locator('#rb').isVisible(),false,suffix);
  }
  await page.goto(base+'/ko/compound?p=1000000&m=0&y=2&r=10');
  assert.equal(await page.locator('#withdrawal').inputValue(),'0');assert.equal(numeric(await page.locator('#vf').textContent()),1210000);
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calqio.com/ko/compound');
  console.log('PASS share restoration (including mode/tax/inflation), invalid URLs and legacy no-withdrawal default');
  fs.mkdirSync('internal/verification',{recursive:true});
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.evaluate(t=>document.body.classList.toggle('light-mode',t==='light'),theme);
    await calculate();await page.waitForTimeout(350);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.locator('#withdrawal').scrollIntoViewIfNeeded();await page.screenshot({path:`internal/verification/withdrawal-input-${width}-${theme}.png`});
    await page.locator('#rb').scrollIntoViewIfNeeded();await page.screenshot({path:`internal/verification/withdrawal-result-${width}-${theme}.png`});
  }
  assert.deepEqual(errors,[]);console.log('PASS mobile/desktop light/dark layouts and no page errors');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
