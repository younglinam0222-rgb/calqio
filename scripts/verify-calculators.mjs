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

console.log(JSON.stringify({ pass, fail, cases }, null, 2));
process.exit(fail ? 1 : 0);
