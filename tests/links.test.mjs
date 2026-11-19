import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, readDist, listRoutes } from './helpers.mjs';
import { SERVICES } from './fixtures.mjs';

const DIST = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const KEYS = ['neonatal', 'lactancia', 'miofuncional', 'lenguaje', 'domicilio'];
const LANGS = ['es', 'ca'];
const HOME = { es: '/es/', ca: '/' };

const hrefs = (html) => [...html.matchAll(/<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]);

/** Enlaces <a> dentro del primer bloque `<tag ...>...</tag>` del HTML. */
const footerHtml = (html) => html.match(/<footer[\s\S]*?<\/footer>/i)?.[0] ?? '';

for (const lang of LANGS) {
  test(`pie de ${HOME[lang]}: 5 enlaces a las páginas de servicio y ninguno a #serveis`, () => {
    const links = hrefs(footerHtml(readPage(HOME[lang])));
    for (const key of KEYS) {
      assert.ok(links.includes(SERVICES[key][lang]), `falta ${SERVICES[key][lang]} en el pie`);
    }
    const toServices = links.filter((h) => Object.values(SERVICES).some((s) => s[lang] === h));
    assert.equal(toServices.length, 5);
    assert.deepEqual(links.filter((h) => h.endsWith('#serveis')), []);
  });

  test(`${HOME[lang]} conserva id="serveis" (enlaces antiguos)`, () => {
    assert.match(readPage(HOME[lang]), /id="serveis"/);
  });

  test(`tarjetas de servicio de ${HOME[lang]} enlazan a su página`, () => {
    const html = readPage(HOME[lang]);
    const section = html.match(/<section[^>]*id="serveis"[\s\S]*?<\/section>/)?.[0] ?? '';
    const links = hrefs(section);
    for (const key of ['neonatal', 'miofuncional', 'lenguaje']) {
      assert.ok(links.includes(SERVICES[key][lang]), `falta enlace a ${SERVICES[key][lang]} en las tarjetas`);
    }
  });
}

test('ningún enlace interno apunta a una ruta inexistente', () => {
  const broken = [];
  for (const route of listRoutes()) {
    for (const raw of hrefs(readPage(route))) {
      if (!raw.startsWith('/') || raw.startsWith('//')) continue;
      const path = raw.split('#')[0].split('?')[0];
      if (!path) continue;
      const clean = decodeURI(path).replace(/^\/+/, '');
      const candidates = [join(DIST, clean, 'index.html'), join(DIST, clean)];
      const ok = candidates.some((c) => existsSync(c) && statSync(c).isFile());
      if (!ok) broken.push(`${route} -> ${raw}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('sitemap: las páginas de servicio con slug distinto declaran su alternate', () => {
  const xml = readDist('sitemap-0.xml');
  const SITE = 'https://www.llavorslogopedia.com';
  for (const key of ['lactancia', 'lenguaje', 'domicilio']) {
    const es = SITE + SERVICES[key].es;
    const ca = SITE + SERVICES[key].ca;
    for (const loc of [es, ca]) {
      const block = xml.split('<url>').find((b) => b.startsWith(`<loc>${loc}</loc>`)) ?? '';
      assert.ok(block.includes(`hreflang="es" href="${es}"`), `${loc} sin alternate es`);
      assert.ok(block.includes(`hreflang="ca" href="${ca}"`), `${loc} sin alternate ca`);
    }
  }
});
