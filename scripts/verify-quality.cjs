const {chromium}=require('../../calqio/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:4180';
const num=s=>Number(s.replace(/[^\d.-]/g,''));
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.route(/googlesyndication|doubleclick|google-analytics/,r=>r.abort());
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/ko/compound');
 async function c(values){return p.evaluate(values=>{setMode(values.md??0);for(const [id,value]of Object.entries(values)){if(id!=='md')document.getElementById(id).value=String(value);}document.getElementById('inflChk').checked=false;run();return {final:document.getElementById('vf').textContent,principal:document.getElementById('vc').textContent,rows:document.querySelectorAll('#tb tr').length,visible:document.getElementById('rb').style.display!=='none'};},values);}
 for(const [name,values,expected]of [
 ['A',{p:1e6,m:0,y:2,r:10,tax:0,timing:'end'},1210000],
 ['B',{md:1,p:0,m:1e5,y:12,r:0},1200000],
 ['C',{md:0,p:1e6,m:0,y:12,r:0},1000000],
 ['D',{p:1e6,y:2,r:-10},810000],
 ['E',{md:1,p:0,m:1e5,y:2,r:10,timing:'end'},210000],
 ['F',{md:1,p:0,m:1e5,y:2,r:10,timing:'start'},231000]]){const r=await c(values);assert.equal(r.visible,true,name);assert.equal(num(r.final),expected,name);console.log('PASS compound',name,expected);}
 for(const values of [{md:2,p:'',m:100},{md:0,p:-1},{md:0,p:1e6,r:-101},{r:0,y:0},{y:1.5},{y:2001},{y:2000,r:1e200}]){assert.equal((await c(values)).visible,false,JSON.stringify(values));}
 await c({md:2,p:1e6,m:1e5,y:12,r:0,timing:'end',tax:0,unit:'mo'});
 await p.locator('#inflRate').fill('0');await p.locator('#inflChk').check();assert.equal(num(await p.locator('#inflVal').textContent()),2200000);
 await p.locator('#inflRate').fill('-100');assert.equal(await p.locator('#rb').isVisible(),false);
 await p.locator('#inflRate').fill('2.5');
 const shared=await p.evaluate(()=>currentShareUrl());await p.goto(shared);
 assert.equal(await p.locator('#m').inputValue(),'100000');assert.equal(await p.locator('#timing').inputValue(),'end');assert.equal(await p.locator('#inflChk').isChecked(),true);
 for(const query of ['p=1000000&m=0&y=2&r=10&u=bad','p=1000000&m=0&y=2&r=10&t=oops','p=1000000&m=0&y=2&r=10&tm=oops','p=1000000&m=0&y=2&r=10&md=99']){await p.goto(base+'/ko/compound?'+query);assert.equal(await p.locator('#rb').isVisible(),false,query);}
 console.log('PASS compound invalid inputs, inflation zero, URL restore and invalid URL');
 await p.goto(base+'/ko/loan');await p.locator('#loan').fill('1200000');await p.locator('#lterm').fill('1');await p.locator('#lrate').fill('0');assert.match(await p.locator('#rcVal').textContent(),/10만원/);await p.locator('#lrate').fill('');assert.equal(await p.locator('#rcVal').textContent(),'—');
 await p.goto(base+'/ko/percent');await p.locator('#pa0').fill('0');await p.locator('#pb0').fill('100');assert.equal(await p.locator('#v-pans').textContent(),'0.00%');await p.locator('#pb0').fill('0');assert.equal(await p.locator('#r7').isVisible(),false);
 await p.goto(base+'/ko/return');await p.locator('#bp').fill('10000');await p.locator('#sp').fill('0');assert.ok((await p.locator('#v-rp').textContent()).startsWith('-'));
 await p.goto(base+'/ko/tax');await p.locator('#taxbuy').fill('1000000');await p.locator('#taxsell').fill('0');assert.ok((await p.locator('#v-taxgain').textContent()).startsWith('-'));assert.equal(num(await p.locator('#v-taxamt').textContent()),0);
 console.log('PASS loan zero, percent zero/division, return and tax loss signs');
 for(const lang of ['ko','en','ja','zh','ar']){
   await p.goto(base+'/'+lang+'/etf-comparison');await p.locator('#years').fill('2');await p.locator('#rateQQQ').fill('10');
   assert.equal(num(await p.locator('#scenario-results tr').last().locator('td').nth(2).textContent()),1210000);
   await p.locator('#scenario-share').click();const link=await p.locator('#scenario-link').inputValue();await p.goto(link);assert.equal(await p.locator('#rateQQQ').inputValue(),'10');
   await p.locator('#etfAmt').fill('-1');assert.equal(await p.locator('#scenario-results tr').count(),0);
   console.log('PASS',lang,'ETF example, sharing, validation');
 }
 const audit=JSON.parse(fs.readFileSync('internal/site-audit.json'));
 for(const page of audit.pages.filter(x=>x.file!=='index.html')){
   const res=await p.goto(base+new URL(page.url).pathname,{waitUntil:'domcontentloaded'});assert.equal(res.status(),200,page.url);
   assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),page.url);
   await p.waitForTimeout(80);
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,page.file+' horizontal overflow');
 }
 console.log('BROWSER_ERRORS',JSON.stringify([...new Set(errors)]));
 assert.deepEqual(errors,[]);
 fs.mkdirSync('internal/verification',{recursive:true});
 for(const width of [390,1280])for(const theme of ['light','dark']){
   await p.setViewportSize({width,height:900});await p.addInitScript(t=>localStorage.setItem('calqio_theme',t),theme);
   for(const slug of ['ai-investment','etf-comparison','compound']){
     await p.goto(base+'/ko/'+slug);await p.waitForTimeout(350);
     assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,slug);
     await p.screenshot({path:`internal/verification/${slug}-${width}-${theme}.png`,fullPage:slug==='etf-comparison'});
   }
 }
 console.log('PASS all page HTTP/canonical inventory and key mobile/desktop layouts');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
