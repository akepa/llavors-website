import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listRoutes, readPage, readDist } from './helpers.mjs';

const LEGAL = ['/privacidad/', '/aviso-legal/', '/cookies/', '/es/privacidad/', '/es/aviso-legal/', '/es/cookies/'];

test('ninguna ruta contiene Doctorialia', () => {
  for (const route of listRoutes()) {
    assert.ok(!readPage(route).includes('Doctorialia'), `Doctorialia en ${route}`);
  }
});

test("'/' y '/es/' contienen el © del año actual", () => {
  for (const route of ['/', '/es/']) {
    assert.ok(readPage(route).includes(`© ${new Date().getFullYear()}`), `falta © año en ${route}`);
  }
});

test('todo hreflang de todas las rutas es ca, es o x-default', () => {
  const allowed = ['ca', 'es', 'x-default'];
  for (const route of listRoutes()) {
    for (const m of readPage(route).matchAll(/hreflang="([^"]*)"/g)) {
      assert.ok(allowed.includes(m[1]), `hreflang="${m[1]}" en ${route}`);
    }
  }
});

test('las 6 rutas legales llevan noindex, follow', () => {
  for (const route of LEGAL) {
    assert.ok(
      readPage(route).includes('<meta name="robots" content="noindex, follow">'),
      `falta noindex en ${route}`,
    );
  }
});

test('el sitemap excluye las páginas legales y cada url tiene lastmod', () => {
  const xml = readDist('sitemap-0.xml');
  for (const word of ['privacidad', 'aviso-legal', 'cookies']) {
    assert.ok(!xml.includes(word), `sitemap contiene ${word}`);
  }
  const urls = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => m[0]);
  assert.ok(urls.length > 0, 'sitemap sin urls');
  for (const u of urls) assert.match(u, /<lastmod>[^<]+<\/lastmod>/, `sin lastmod: ${u.slice(0, 120)}`);
});

test('llms.txt existe y enlaza a /es/', () => {
  assert.ok(readDist('llms.txt').includes('https://www.llavorslogopedia.com/es/'));
});
