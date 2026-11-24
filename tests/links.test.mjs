import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, readDist, listRoutes } from './helpers.mjs';
import { SERVICES } from './fixtures.mjs';

const DIST = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const KEYS = ['neonatal', 'lactancia', 'miofuncional', 'lenguaje', 'domicilio'];
const LANGS = ['es', 'ca'];
const HOME = { es: '/es/', ca: '/' };

const hrefs = (html) => [...html.matchAll(/<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]);

/** URLs que el HTML carga o enlaza: href de <a> y <link>, y src= de cualquier etiqueta. */
const resourceUrls = (html) =>
  [...html.matchAll(/<(?:a|link)\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')|<[a-z][\w-]*\b[^>]*?\ssrc=(?:"([^"]*)"|'([^']*)')/gi)]
    .map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);

/** HTML del primer <footer> de la página. */
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

test('ningún enlace ni recurso interno (href de <a>/<link>, src=) apunta a una ruta inexistente', () => {
  const broken = [];
  for (const route of listRoutes()) {
    for (const raw of resourceUrls(readPage(route))) {
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

const SITE = 'https://www.llavorslogopedia.com';

/** Comprueba que las dos URLs del par se declaran mutuamente como alternate en el sitemap. */
function assertSitemapPair(xml, es, ca) {
  for (const loc of [es, ca]) {
    const block = xml.split('<url>').find((b) => b.startsWith(`<loc>${loc}</loc>`));
    assert.ok(block, `${loc} no está en el sitemap`);
    assert.ok(block.includes(`hreflang="es" href="${es}"`), `${loc} sin alternate es`);
    assert.ok(block.includes(`hreflang="ca" href="${ca}"`), `${loc} sin alternate ca`);
  }
}

test('sitemap: las páginas de servicio con slug distinto declaran su alternate', () => {
  const xml = readDist('sitemap-0.xml');
  for (const key of ['lactancia', 'lenguaje', 'domicilio']) {
    assertSitemapPair(xml, SITE + SERVICES[key].es, SITE + SERVICES[key].ca);
  }
});

/** translationKey → slug de los artículos publicados de src/data/blog/<lang>/. */
function blogSlugs(lang) {
  const dir = fileURLToPath(new URL(`../src/data/blog/${lang}/`, import.meta.url));
  const slugs = new Map();
  for (const file of readdirSync(dir).filter((f) => /^[^_].*\.mdx?$/.test(f))) {
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const field = (name) => fm.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+?)['"]?\\s*$`, 'm'))?.[1];
    if (field('draft') !== 'true') slugs.set(field('translationKey'), field('slug'));
  }
  return slugs;
}

test('sitemap: los artículos del blog con slug distinto declaran su alternate (por translationKey)', () => {
  const xml = readDist('sitemap-0.xml');
  const es = blogSlugs('es');
  const pairs = [...blogSlugs('ca')].filter(([key, ca]) => es.has(key) && es.get(key) !== ca);
  assert.ok(pairs.length > 0, 'no hay artículos traducidos con slug distinto');
  for (const [key, ca] of pairs) {
    assertSitemapPair(xml, `${SITE}/es/blog/${es.get(key)}/`, `${SITE}/blog/${ca}/`);
  }
});
