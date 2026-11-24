import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDist, listRoutes } from './helpers.mjs';
import { SERVICES } from './fixtures.mjs';

const SITE = 'https://www.llavorslogopedia.com';

/** URLs de los enlaces Markdown [texto](url) del llms.txt. */
const links = (txt) => [...txt.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);

test('llms.txt se genera desde src/pages/llms.txt.ts (no hay copia en public/)', () => {
  assert.ok(!existsSync(fileURLToPath(new URL('../public/llms.txt', import.meta.url))), 'sobra public/llms.txt');
  assert.ok(readDist('llms.txt').startsWith('# Llavors Logopèdia\n'));
});

test('llms.txt enlaza las páginas de servicio en los dos idiomas', () => {
  const urls = links(readDist('llms.txt'));
  for (const [key, routes] of Object.entries(SERVICES)) {
    for (const lang of ['es', 'ca']) {
      assert.ok(urls.includes(`${SITE}${routes[lang]}`), `falta ${key} (${lang}): ${routes[lang]}`);
    }
  }
});

test('llms.txt enlaza todos los artículos publicados del blog', () => {
  const urls = links(readDist('llms.txt'));
  const articles = listRoutes().filter((r) => /^\/(es\/)?blog\/(?!categoria\/)[^/]+\/$/.test(r));
  assert.ok(articles.length > 0, 'no hay artículos en dist/');
  for (const route of articles) assert.ok(urls.includes(`${SITE}${route}`), `falta ${route}`);
});

test('todos los enlaces internos de llms.txt existen en dist/', () => {
  const routes = listRoutes();
  const internal = links(readDist('llms.txt')).filter((u) => u.startsWith(SITE));
  for (const url of internal) assert.ok(routes.includes(url.slice(SITE.length)), `ruta inexistente: ${url}`);
});

test('llms.txt toma el contacto de business.ts', () => {
  const txt = readDist('llms.txt');
  for (const value of ['+34 614 33 77 43', 'info@llavorslogopedia.com', 'n.º 46666', 'Calle Chile, 4 · 46021']) {
    assert.ok(txt.includes(value), `falta «${value}»`);
  }
  assert.ok(!/\bundefined\b|\bnull\b/.test(txt), 'interpolación rota (undefined/null)');
});
