const {chromium}=require('../../calqio/node_modules/playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:390,height:844}});const base=process.argv[2]||'http://127.0.0.1:4180';await p.route(/googlesyndication|doubleclick|google-analytics/,r=>r.abort());
for(const lang of ['en','ja','zh','ar']){
 await p.goto(base+'/'+lang+'/compound');await p.evaluate(()=>{setMode(2);for(const[id,val]of Object.entries({p:0,m:500,y:20,r:8}))document.getElementById(id).value=val;calcC();});assert.match((await p.locator('#v-fa').textContent()).replace(/\D/g,''),/274572/);
 await p.locator('#inflRate').fill('0');await p.locator('#inflChk').check();assert.match((await p.locator('#inflVal').textContent()).replace(/\D/g,''),/274572/);
 await p.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testShared=text;}}});});
 await p.evaluate(()=>calqioShare());const restored=await p.evaluate(()=>window.testShared);await p.goto(restored);await p.waitForTimeout(200);
 assert.equal(await p.locator('#m').inputValue(),'500');assert.equal(await p.locator('#inflChk').isChecked(),true);assert.equal(await p.locator('#inflRate').inputValue(),'0');
 await p.locator('#y').fill('0');assert.equal(await p.locator('#r0').isVisible(),false);assert.equal(await p.locator('#inflResult').isVisible(),false);
 console.log('PASS',lang,'annual compound and zero inflation, share restoration, stale result removal');
}
for(const lang of ['ko','en','ja','zh','ar']){
 await p.goto(base+'/'+lang+'/fire');await p.locator('#curr').fill('0');await p.locator('#mon').fill('100');await p.locator('#tgt').fill('120000');await p.locator('#ret').fill('0');assert.notEqual(await p.locator('#fireYears').textContent(),'—');await p.locator('#mon').fill('-1');assert.equal(await p.locator('#fireFinal').textContent(),'—');
}
console.log('PASS FIRE 1200-month boundary and negative input in 5 languages');
let payload=JSON.parse(fs.readFileSync('internal/verification/lotto-current.json','utf8').replace(/^\uFEFF/,'')),fail=false;
await p.route('**/api/lotto',r=>r.fulfill({status:fail?503:200,json:fail?{error:'test'}:payload}));
await p.goto(base+'/ko/lotto-generator');await p.waitForFunction(()=>!document.getElementById('gen-btn').disabled);
for(const count of [1,37,100]){await p.locator('#analysis-range').fill(String(count));assert.equal(await p.evaluate(()=>Object.values(freqMap).reduce((a,b)=>a+b,0)),count*6);}
await p.locator('#analysis-range').fill('101');assert.equal(await p.locator('#gen-btn').isDisabled(),true);await p.locator('#analysis-range').fill('37');
const inputs=p.locator('#check-form input');for(let i=0;i<6;i++)await inputs.nth(i).fill(String(payload.draws[0].nums[i]));await p.locator('#check-submit').click();assert.match(await p.locator('#check-result').textContent(),/1등 조건/);
fail=true;await p.evaluate(()=>refreshDraws());assert.equal(await p.locator('#gen-btn').isDisabled(),true);assert.equal(await p.locator('#check-result').textContent(),'');
console.log('PASS lotto official fixture, 1/37/100 ranges, invalid range, rank, API failure clears result');
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
