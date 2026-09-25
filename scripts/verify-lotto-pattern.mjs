import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), P=require('../lotto-pattern.js');
const draws=[{round:3,nums:[1,2,3,4,5,6],bonus:45},{round:2,nums:[1,2,3,7,8,9]},{round:1,nums:[1,2,10,11,12,13]}];
const m=P.build(draws);assert.equal(m.pairs['1-2'],3);assert.equal(m.triples['1-2-3'],2);assert.equal(m.freq[45],0);assert.equal(m.repeat[3],1);assert.equal(m.repeat[2],1);assert.equal(m.q1,21);assert.equal(m.q3,49);
assert.deepEqual(P.build([...draws].reverse()).pairs,m.pairs);
assert.throws(()=>P.build([{round:1,nums:[1,1,2,3,4,5]}]));
for(const count of [1,9,10,30,100]){
 const history=Array.from({length:count},(_,i)=>({round:count-i,nums:P.random([],P.seeded(i+10))}));
 const model=P.build(history);
 for(const fixed of [[],[1],[1,2,3,4,5]]){const nums=P.generate(model,fixed,P.seeded(22));assert.equal(new Set(nums).size,6);assert.ok(fixed.every(n=>nums.includes(n)));const s=P.score(model,nums);assert.ok(Number.isFinite(s.total)&&s.total>=0&&s.total<=100);}
}
assert.deepEqual(P.generate(m,[],P.seeded(42)),P.random([],P.seeded(42)));
assert.equal(P.backtest(draws).insufficient,true);
const history=Array.from({length:30},(_,i)=>({round:30-i,nums:P.random([],P.seeded(i+900))}));
const result=P.backtest(history);assert.equal(result.count,10);assert.equal(result.window,20);assert.ok(result.rows.every(r=>r.trainingLatest===r.round-1));
const altered=structuredClone(history);altered[0].nums=[1,2,3,4,5,6];
assert.deepEqual(P.build(history.slice(1)),P.build(altered.slice(1)));
assert.deepEqual(P.backtest(history),result);
console.log('PASS pair/triple counts, no bonus, sums, overlap, sparse fallback, fixed numbers, score bounds, deterministic rolling evaluation without target leakage');
