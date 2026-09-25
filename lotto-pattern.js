/* CALQIO Pattern v1: descriptive statistical ranking, not a probability model. */
(function(root){
'use strict';
const key = a=>a.join('-');
function combinations(a,k){const out=[];function go(start,p){if(p.length===k){out.push(key(p));return;}for(let i=start;i<a.length;i++)go(i+1,[...p,a[i]]);}go(0,[]);return out;}
const inc=(m,k,w=1)=>m[k]=(m[k]||0)+w;
const sum=a=>a.reduce((a,b)=>a+b,0);
const overlap=(a,b)=>a.filter(n=>b.includes(n)).length;
function build(draws){
 if(!draws.length || draws.length>100)throw Error('1–100 draws required');
 const data=draws.map(d=>({...d,nums:[...d.nums].sort((a,b)=>a-b)})).sort((a,b)=>b.round-a.round);
 data.forEach((d,i)=>{if(d.nums.length!==6||new Set(d.nums).size!==6||d.nums.some(n=>!Number.isInteger(n)||n<1||n>45)||!Number.isInteger(d.round)||(i&&data[i-1].round!==d.round+1))throw Error('Invalid history');});
 const m={n:data.length,latest:data[0],freq:{},recent:{},pairs:{},triples:{},sums:[],bins:{},odd:{},zones:{},repeat:{},version:'1.0'};
 for(let n=1;n<=45;n++){m.freq[n]=0;m.recent[n]=0;}
 data.forEach((d,i)=>{
  d.nums.forEach(n=>{m.freq[n]++;m.recent[n]+=Math.pow(0.5,i/10);});
  combinations(d.nums,2).forEach(k=>inc(m.pairs,k));combinations(d.nums,3).forEach(k=>inc(m.triples,k));
  const s=sum(d.nums);m.sums.push(s);inc(m.bins,Math.floor(s/20));
  inc(m.odd,d.nums.filter(n=>n%2).length);inc(m.zones,new Set(d.nums.map(n=>Math.floor((n-1)/10))).size);
  if(i+1<data.length)inc(m.repeat,overlap(d.nums,data[i+1].nums));
 });
 m.sums.sort((a,b)=>a-b);m.q1=m.sums[Math.floor((m.n-1)*.25)];m.q3=m.sums[Math.ceil((m.n-1)*.75)];
 const prior=data.slice(1,11);const priorFreq={};prior.forEach(d=>d.nums.forEach(n=>inc(priorFreq,n)));
 m.returningHot=Object.entries(priorFreq).filter(([n,c])=>c>=2&&m.latest.nums.includes(+n)).sort((a,b)=>b[1]-a[1]).map(([n,count])=>({n:+n,count}));m.priorCount=prior.length;
 return m;
}
function top(map,min=2){return Object.entries(map).filter(([,c])=>c>=min).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5);}
function score(m,nums){
 const a=[...nums].sort((a,b)=>a-b);
 const avg=(map,ks)=>ks.reduce((v,k)=>v+(map[k]||0),0)/ks.length;
 const relative=(map,k)=>(map[k]||0)/Math.max(1,...Object.values(map));
 const pairKeys=combinations(a,2),tripleKeys=combinations(a,3);
 const reliability=m.n/(m.n+30);
 const components={
  frequency:25*avg(m.recent,a)/Math.max(...Object.values(m.recent)),
  pairs:15*reliability*avg(m.pairs,pairKeys)/Math.max(1,...Object.values(m.pairs)),
  triples:10*reliability*avg(m.triples,tripleKeys)/Math.max(1,...Object.values(m.triples)),
  sum:20*relative(m.bins,Math.floor(sum(a)/20)),
  shape:7.5*relative(m.odd,a.filter(n=>n%2).length)+7.5*relative(m.zones,new Set(a.map(n=>Math.floor((n-1)/10))).size),
  repeat:15*relative(m.repeat,overlap(a,m.latest.nums))
 };
 return {total:Math.round(sum(Object.values(components))*10)/10,components,sum:sum(a),odd:a.filter(n=>n%2).length,repeat:overlap(a,m.latest.nums),pairs:pairKeys.filter(k=>m.pairs[k]>=2).map(k=>[k,m.pairs[k]]),triples:tripleKeys.filter(k=>m.triples[k]>=2).map(k=>[k,m.triples[k]])};
}
function random(fixed=[],rng=Math.random){
 if(fixed.length>5||new Set(fixed).size!==fixed.length||fixed.some(n=>!Number.isInteger(n)||n<1||n>45))throw Error('Invalid fixed numbers');
 const a=[...fixed],pool=Array.from({length:45},(_,i)=>i+1).filter(n=>!a.includes(n));
 while(a.length<6)a.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);return a.sort((a,b)=>a-b);
}
function generate(m,fixed=[],rng=Math.random){
 if(m.n<10)return random(fixed,rng);
 const candidates=new Map();
 for(let i=0;i<160;i++){const nums=random(fixed,rng);candidates.set(key(nums),{nums,score:score(m,nums).total});}
 const best=[...candidates.values()].sort((a,b)=>b.score-a.score).slice(0,10);
 return best[Math.floor(rng()*best.length)].nums;
}
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function backtest(draws){
 if(draws.length<30)return {insufficient:true};
 const data=[...draws].sort((a,b)=>b.round-a.round),count=Math.min(20,data.length-20),window=data.length-count;
 const totals={pattern:0,random:0,frequency:0},rows=[];
 // Each target is excluded from its training window. Ten trials per strategy/target.
 for(let i=count-1;i>=0;i--){const history=data.slice(i+1,i+1+window),m=build(history),target=data[i];
  const topSix=Object.entries(m.freq).sort((a,b)=>b[1]-a[1]||+a[0]-+b[0]).slice(0,6).map(([n])=>+n);
  const row={round:target.round,trainingLatest:history[0].round,pattern:0,random:0,frequency:overlap(topSix,target.nums)};
  for(let trial=0;trial<10;trial++){row.pattern+=overlap(generate(m,[],seeded(target.round*100+trial)),target.nums)/10;row.random+=overlap(random([],seeded(target.round*100+trial+50000)),target.nums)/10;}
  for(const k of Object.keys(totals))totals[k]+=row[k];rows.push(row);
 }
 return {count,window,trials:10,averages:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v/count])),rows};
}
const api={build,score,generate,random,top,backtest,seeded,combinations};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LottoPattern=api;
})(globalThis);
