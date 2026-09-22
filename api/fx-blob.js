import fs from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

export const FX_BLOB_PATHNAME = 'fx-rates.json';

const LOCAL_CACHE_FILE = path.join(process.cwd(), 'public', 'fx-rates.json');

export const EMPTY_FX_CACHE = {
  source: 'koreaexim',
  updatedAt: null,
  queryDate: null,
  rates: [],
};

function readLocalCache() {
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_CACHE_FILE, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return { ...EMPTY_FX_CACHE };
}

export async function readFxCache() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({
        prefix: FX_BLOB_PATHNAME,
        limit: 1,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      const hit = blobs.find((b) => b.pathname === FX_BLOB_PATHNAME) || blobs[0];
      if (hit?.url) {
        const res = await fetch(hit.url, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
        }
      }
    } catch {
      /* fall through */
    }
  }
  return readLocalCache();
}

export async function writeFxCache(payload) {
  const body = JSON.stringify(payload, null, 2) + '\n';

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    fs.mkdirSync(path.dirname(LOCAL_CACHE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_CACHE_FILE, body, 'utf8');
    return { storage: 'local', path: LOCAL_CACHE_FILE };
  }

  const blob = await put(FX_BLOB_PATHNAME, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { storage: 'blob', url: blob.url, pathname: blob.pathname };
}
