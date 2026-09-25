const ORIGIN = 'https://www.dhlottery.co.kr';
const WEEK = 7 * 86400000;
let cached;
let pending;
export function expectedRound(now = Date.now()) {
  return Math.max(0, Math.floor((now - Date.parse('2002-12-07T21:00:00+09:00')) / WEEK) + 1);
}
export function normalize(row) {
  const round = Number(row.ltEpsd);
  const nums = Array.from({length:6}, (_, i) => Number(row[`tm${i+1}WnNo`]));
  const bonus = Number(row.bnsWnNo);
  const raw = String(row.ltRflYmd);
  const date = raw.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  if (!Number.isInteger(round) || round < 1 || new Set([...nums,bonus]).size !== 7 ||
      [...nums,bonus].some(n => !Number.isInteger(n) || n < 1 || n > 45) ||
      date !== new Date(Date.parse('2002-12-07T00:00:00Z') + (round-1)*WEEK).toISOString().slice(0,10)) {
    throw new Error('Invalid official draw');
  }
  return {round,nums:nums.sort((a,b)=>a-b),bonus,date};
}
async function official(path, json = true) {
  for (let attempt=0; attempt<2; attempt++) {
    try {
      const response = await fetch(ORIGIN + path, {signal:AbortSignal.timeout(5000), headers:{Accept:json?'application/json':'text/html'}});
      if (!response.ok) throw new Error('Official source unavailable');
      return json ? await response.json() : await response.text();
    } catch (error) { if (attempt === 1) throw error; }
  }
}
async function refresh() {
  const html = await official('/lt645/result', false);
  const section = html.match(/id="ltEpsdDiv"[^>]*>([\s\S]*?)<\/ul>/)?.[1];
  const latest = Math.max(...Array.from((section || '').matchAll(/data-value="(\d+)"/g), m=>Number(m[1])));
  if (!Number.isInteger(latest) || latest < 1 || latest > expectedRound()+1) throw new Error('Latest round unavailable');
  if (cached?.draws[0].round === latest) {
    cached = {...cached,checkedAt:new Date().toISOString()};
    return cached;
  }
  const batch = params => official('/lt645/selectPstLt645InfoNew.do?' + new URLSearchParams(params)).then(r=>{
    if (!Array.isArray(r.data?.list) || !r.data.list.length) throw new Error('Missing draw history');
    return r.data.list.map(normalize);
  });
  const draws = await batch({srchDir:'center',srchLtEpsd:latest});
  const oldest = Math.min(...draws.map(d=>d.round));
  // Official pagination: older returns the ten rounds preceding the supplied cursor.
  for (let offset=0; offset<90; offset+=30) {
    const pages = await Promise.all([0,10,20].map(n=>batch({srchDir:'older',srchCursorLtEpsd:oldest-offset-n})));
    draws.push(...pages.flat());
  }
  const ordered = [...new Map(draws.map(d=>[d.round,d])).values()].sort((a,b)=>b.round-a.round).slice(0,100);
  if (ordered.length !== 100 || ordered.some((d,i)=>d.round !== latest-i)) throw new Error('Incomplete draw history');
  cached = {draws:ordered,checkedAt:new Date().toISOString(),source:ORIGIN+'/lt645/result'};
  return cached;
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method && req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const round = req.query?.round;
  if (round !== undefined && !/^\d{1,5}$/.test(String(round))) return res.status(400).json({error:'Invalid round'});
  try {
    if (!cached || Date.now()-Date.parse(cached.checkedAt)>60000) {
      if (!pending) pending = refresh().finally(()=>{pending=undefined;});
      await pending;
    }
    const fresh = cached.draws[0].round >= expectedRound();
    if (round !== undefined) {
      const d=cached.draws.find(d=>d.round===Number(round));
      if (!d) return res.status(404).json({returnValue:'fail'});
      return res.status(200).json({returnValue:'success',drwNo:d.round,drwNoDate:d.date,bnusNo:d.bonus,...Object.fromEntries(d.nums.map((n,i)=>[`drwtNo${i+1}`,n]))});
    }
    return res.status(200).json({...cached,fresh});
  } catch {
    return res.status(503).json({error:'공식 당첨번호를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.'});
  }
}
