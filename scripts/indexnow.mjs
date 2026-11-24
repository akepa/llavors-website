// Avisa a IndexNow (Bing, Yandex, Seznam…) de las URLs del sitemap tras cada despliegue.
// La clave es pública por diseño: se publica en https://<HOST>/<KEY>.txt (public/<KEY>.txt).
//
// Uso:
//   node scripts/indexnow.mjs --changed dist/sitemap-0.xml
//     Antes de desplegar: compara el sitemap nuevo con el publicado y escribe
//     urls=<JSON> en $GITHUB_OUTPUT (o en stdout) con las URLs nuevas o con lastmod
//     distinto. Si el publicado no se puede leer, todas.
//   node scripts/indexnow.mjs
//     Tras desplegar: envía las URLs de $INDEXNOW_URLS (JSON) o, si no está,
//     todas las del sitemap publicado.
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const KEY = 'f7b6c0e7fb1dc58e2ceafb487e75353a';
export const HOST = 'www.llavorslogopedia.com';
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Valores de <loc> de un sitemap o índice de sitemaps. */
export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * loc y lastmod (si lo hay) de cada <url> de un sitemap.
 * @param {string} xml
 * @returns {{ loc: string, lastmod?: string }[]}
 */
export function extractEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap(([, block]) => {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) return [];
    const lastmod = block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1];
    return [lastmod ? { loc, lastmod } : { loc }];
  });
}

/**
 * URLs de newXml que no están en oldXml o cuyo lastmod difiere o falta en alguno
 * de los dos. Sin sitemap publicado (oldXml null), todas.
 * @param {string | null} oldXml
 * @param {string} newXml
 * @returns {string[]}
 */
export function changedUrls(oldXml, newXml) {
  const entries = extractEntries(newXml);
  if (oldXml === null) return entries.map((e) => e.loc);
  const published = new Map(extractEntries(oldXml).map((e) => [e.loc, e.lastmod]));
  return entries
    .filter(({ loc, lastmod }) => !published.has(loc) || !lastmod || published.get(loc) !== lastmod)
    .map((e) => e.loc);
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

/** XML de todos los sitemaps publicados, concatenados. */
async function publishedSitemaps() {
  const sitemaps = extractLocs(await getText(SITEMAP_INDEX));
  return (await Promise.all(sitemaps.map(getText))).join('\n');
}

/** Modo --changed: URLs nuevas o cambiadas respecto al sitemap publicado → $GITHUB_OUTPUT. */
async function writeChanged(file) {
  const newXml = readFileSync(file, 'utf8');
  let oldXml = null;
  try {
    oldXml = await publishedSitemaps();
  } catch (err) {
    console.warn(`No se pudo leer el sitemap publicado (${err.message}): se enviarán todas las URLs.`);
  }
  const urls = changedUrls(oldXml, newXml);
  const line = `urls=${JSON.stringify(urls)}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line);
  else process.stdout.write(line);
  console.log(`IndexNow: ${urls.length} URLs nuevas o cambiadas.`);
}

async function main() {
  const changedIndex = process.argv.indexOf('--changed');
  if (changedIndex !== -1) {
    const file = process.argv[changedIndex + 1];
    if (!file) throw new Error('Falta la ruta del sitemap tras --changed');
    return writeChanged(file);
  }

  // Lista del job de build (solo lo cambiado); sin ella, todo el sitemap publicado.
  const listed = process.env.INDEXNOW_URLS ? JSON.parse(process.env.INDEXNOW_URLS) : null;
  if (listed !== null && !Array.isArray(listed)) throw new Error('INDEXNOW_URLS no es una lista JSON');
  if (listed?.length === 0) {
    console.log('IndexNow: no hay URLs nuevas ni cambiadas.');
    return;
  }

  await waitForKey();
  const urls = listed ?? extractLocs(await publishedSitemaps());
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
