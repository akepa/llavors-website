// Avisa a IndexNow (Bing, Yandex, Seznam…) de las URLs del sitemap tras cada despliegue.
// La clave es pública por diseño: se publica en https://<HOST>/<KEY>.txt (public/<KEY>.txt).
import { pathToFileURL } from 'node:url';

export const KEY = 'f7b6c0e7fb1dc58e2ceafb487e75353a';
export const HOST = 'www.llavorslogopedia.com';
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Valores de <loc> de un sitemap o índice de sitemaps. */
export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/** Cuerpo JSON que espera api.indexnow.org. */
export function buildPayload(urls) {
  return { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls };
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

/** Espera a que la clave esté publicada: sin ella IndexNow responde 403. */
async function waitForKey(tries = 6, delayMs = 10_000) {
  const url = buildPayload([]).keyLocation;
  for (let i = 1; i <= tries; i++) {
    try {
      if ((await getText(url)).trim() === KEY) return;
    } catch {}
    if (i < tries) await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`La clave no está publicada en ${url}`);
}

async function main() {
  await waitForKey();
  const sitemaps = extractLocs(await getText(SITEMAP_INDEX));
  const urls = (await Promise.all(sitemaps.map(async (s) => extractLocs(await getText(s))))).flat();
  if (urls.length === 0) throw new Error('El sitemap no tiene URLs');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(buildPayload(urls)),
  });
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow respondió ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow: ${urls.length} URLs enviadas (${res.status}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
