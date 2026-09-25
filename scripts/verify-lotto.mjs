import assert from 'node:assert/strict';
import {expectedRound,normalize,default as handler} from '../api/lotto.js';
assert.equal(expectedRound(Date.parse('2026-09-26T20:59:59+09:00')),1242);
assert.equal(expectedRound(Date.parse('2026-09-26T21:00:00+09:00')),1243);
const row={ltEpsd:1242,ltRflYmd:'20260919',tm1WnNo:2,tm2WnNo:4,tm3WnNo:10,tm4WnNo:16,tm5WnNo:31,tm6WnNo:41,bnsWnNo:9};
assert.equal(normalize(row).date,'2026-09-19');
assert.throws(()=>normalize({...row,bnsWnNo:2}));
assert.throws(()=>normalize({...row,tm1WnNo:46}));
assert.throws(()=>normalize({...row,ltRflYmd:'20260425'}));
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(d){this.data=d;return this}};}
let r=response();await handler({query:{round:'no'}},r);assert.equal(r.code,400);
const original=globalThis.fetch;
globalThis.fetch=async()=>({ok:true,text:async()=>'<html>Service unavailable</html>'});
r=response();await handler({query:{}},r);assert.equal(r.code,503);assert.equal(r.data.draws,undefined);assert.equal(r.headers['Cache-Control'],'no-store');
globalThis.fetch=original;
console.log('PASS: KST boundary, valid draw, duplicate/out-of-range/date rejection, invalid query, upstream failure, no stale success');
