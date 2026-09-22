import { readFxCache, writeFxCache } from './fx-blob.js';

const EXIM_URL =
  'https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?data=AP01';

const RESULT_MSG = {
  1: 'success',
  2: 'data code error',
  3: 'auth key error',
  4: 'daily limit exceeded',
};

function parseDealRate(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalizeRows(rows, fetchedAt) {
  const rates = rows
    .filter((row) => row && row.cur_unit)
    .map((row) => ({
      cur_unit: row.cur_unit,
      cur_nm: row.cur_nm || null,
      deal_bas_r: parseDealRate(row.deal_bas_r),
      queryDate: row.search_date || row.apl_ymd || null,
    }))
    .filter((row) => row.deal_bas_r != null);

  const queryDate =
    rates.find((r) => r.queryDate)?.queryDate ||
    fetchedAt.toISOString().slice(0, 10).replace(/-/g, '');

  return {
    source: 'koreaexim',
    updatedAt: fetchedAt.toISOString(),
    queryDate,
    rates,
  };
}

export default async function handler(req, res) {
  const authkey = process.env.EXIM_API_KEY;
  if (!authkey) {
    return res.status(500).json({
      ok: false,
      error: 'EXIM_API_KEY is not configured',
    });
  }

  const previous = await readFxCache();

  try {
    const url = `${EXIM_URL}&authkey=${encodeURIComponent(authkey)}`;
    const response = await fetch(url);
    const text = (await response.text()).trim();

    if (!text || text === 'null') {
      return res.status(200).json({
        ok: true,
        action: 'unchanged',
        reason: 'empty_or_null_response',
        cache: previous,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'invalid_json_from_exim',
        bodyPreview: text.slice(0, 200),
      });
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(200).json({
        ok: true,
        action: 'unchanged',
        reason: 'empty_array',
        cache: previous,
      });
    }

    const headResult = Number(parsed[0]?.result);
    if (headResult && headResult !== 1) {
      const msg = RESULT_MSG[headResult] || `result_${headResult}`;
      return res.status(headResult === 4 ? 429 : 502).json({
        ok: false,
        result: headResult,
        error: msg,
        cache: previous,
      });
    }

    const payload = normalizeRows(parsed, new Date());
    if (payload.rates.length === 0) {
      return res.status(200).json({
        ok: true,
        action: 'unchanged',
        reason: 'no_usable_rates',
        cache: previous,
      });
    }

    const stored = await writeFxCache(payload);
    return res.status(200).json({
      ok: true,
      action: 'updated',
      count: payload.rates.length,
      updatedAt: payload.updatedAt,
      queryDate: payload.queryDate,
      storage: stored.storage,
      blobUrl: stored.url || undefined,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'fx_update_failed',
      cache: previous,
    });
  }
}
