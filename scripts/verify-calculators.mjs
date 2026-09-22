#!/usr/bin/env node
/**
 * Independent checks for Calqio compound (KO run()) and FIRE (calcFire) logic.
 * Run: node scripts/verify-calculators.mjs
 */
const TOL = 1; // KRW rounding in UI

function compoundRun({ P, M, Y, R, T = 0, timing = "end" }) {
  let bal = P;
  let cumNet = 0;
  for (let i = 1; i <= Y; i++) {
    let gr, net;
    if (timing === "start") {
      bal = bal + M;
      gr = bal * R;
      net = gr > 0 ? gr * (1 - T) : gr;
      bal = bal + net;
    } else {
      gr = bal * R;
      net = gr > 0 ? gr * (1 - T) : gr;
      bal = bal + net + M;
    }
    cumNet += net;
  }
  return { finalBal: bal, cumNet };
}

function fireMonths({ curr, mon, tgt, ret, infl = false }) {
  const monthlyRate = ret / 100 / 12;
  let effRate = monthlyRate;
  if (infl) effRate = (1 + monthlyRate) / (1 + 0.025 / 12) - 1;
  if (tgt > 0 && curr >= tgt) return { months: 0, asset: curr };
  let months = 0;
  let asset = curr;
  while (asset < tgt && months < 1200) {
    asset = asset * (1 + effRate) + mon;
    months++;
  }
  return { months, asset };
}

const cases = [];
let pass = 0;
let fail = 0;

function assert(name, cond, detail) {
  if (cond) {
    pass++;
    cases.push({ name, status: "PASS", detail });
  } else {
    fail++;
    cases.push({ name, status: "FAIL", detail });
  }
}

// Compound: lump sum 10M, 30 periods, 2.5% per period, no tax
{
  const { finalBal } = compoundRun({ P: 10_000_000, M: 0, Y: 30, R: 0.025, T: 0 });
  const expected = 10_000_000 * Math.pow(1.025, 30);
  assert(
    "compound lump 10M×1.025^30",
    Math.abs(finalBal - expected) < TOL,
    `got ${Math.round(finalBal)} expected ${Math.round(expected)}`
  );
}

// Compound: end timing with contribution 1M/month, 12 periods, 1% per period
{
  const { finalBal } = compoundRun({ P: 0, M: 1_000_000, Y: 12, R: 0.01, T: 0, timing: "end" });
  let bal = 0;
  for (let i = 0; i < 12; i++) {
    bal = bal * 1.01 + 1_000_000;
  }
  assert(
    "compound contribute end 12×1M @1%",
    Math.abs(finalBal - bal) < TOL,
    `got ${Math.round(finalBal)} expected ${Math.round(bal)}`
  );
}

// Tax on positive gain only
{
  const { finalBal } = compoundRun({ P: 1_000_000, M: 0, Y: 1, R: 0.1, T: 0.154 });
  const gr = 1_000_000 * 0.1;
  const net = gr * (1 - 0.154);
  const expected = 1_000_000 + net;
  assert(
    "compound tax 15.4% one period",
    Math.abs(finalBal - expected) < TOL,
    `got ${finalBal} expected ${expected}`
  );
}

// FIRE: 0 start, 1M/mo, 100M target, 6% annual
{
  const { months } = fireMonths({ curr: 0, mon: 1_000_000, tgt: 100_000_000, ret: 6 });
  assert("fire 100M @6% 1M/mo months", months === 82, `months=${months} expected 82`);
}

// FIRE: already at target
{
  const { months } = fireMonths({ curr: 200_000_000, mon: 0, tgt: 100_000_000, ret: 6 });
  assert("fire already at target", months === 0, `months=${months}`);
}

// Compound: negative return period (loss), no tax refund
{
  const { finalBal } = compoundRun({ P: 1_000_000, M: 0, Y: 1, R: -0.1, T: 0.154 });
  assert("compound -10% one period", finalBal === 900_000, `got ${finalBal}`);
}

// FIRE: zero return, pure savings
{
  const { months } = fireMonths({ curr: 0, mon: 1_000_000, tgt: 10_000_000, ret: 0 });
  assert("fire 0% return 10M target", months === 10, `months=${months}`);
}

function calcReturn({ bp, sp, q, fPct }) {
  const f = fPct / 100;
  const bt = bp * q;
  const st = sp * q;
  const ft = (bt + st) * f;
  const profit = st - bt - ft;
  return { profit, rate: (profit / bt) * 100, ft };
}

function calcCAnnual({ P, M, y, rPct }) {
  const r = rPct / 100;
  let bal = P;
  let contrib = P;
  for (let i = 1; i <= y; i++) {
    bal = bal * (1 + r) + M * 12;
    contrib += M * 12;
  }
  return { bal, contrib };
}

// Return calculator default (ko/return.html)
{
  const { profit, rate, ft } = calcReturn({ bp: 50_000, sp: 65_000, q: 100, fPct: 0.015 });
  assert(
    "return default 50k→65k x100 fee 0.015%",
    Math.abs(profit - 1_498_275) < 0.01 && Math.abs(rate - 29.9655) < 0.01,
    `profit=${profit} rate=${rate} fee=${ft}`
  );
}

// calcC (en/ja/zh/ar compound): lump 10k, 8%, 20y
{
  const { bal } = calcCAnnual({ P: 10_000, M: 0, y: 20, rPct: 8 });
  assert(
    "calcC 10k @8% 20y",
    Math.abs(bal - 46_609.57) < 0.02,
    `bal=${bal}`
  );
}

// calcC DCA 500/mo, 20y, 8%
{
  const { bal } = calcCAnnual({ P: 0, M: 500, y: 20, rPct: 8 });
  assert(
    "calcC 500/mo @8% 20y",
    Math.abs(bal - 274_571.79) < 1,
    `bal=${bal}`
  );
}

console.log(JSON.stringify({ pass, fail, cases }, null, 2));
process.exit(fail ? 1 : 0);
