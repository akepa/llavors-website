import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDist } from './helpers.mjs';
import { buildLastmodMap } from '../src/data/lastmod.mjs';

const SITE = 'https://www.llavorslogopedia.com';
const DIST_SITEMAP = fileURLToPath(new URL('../dist/sitemap-0.xml', import.meta.url));
const BLOG_DIR = fileURLToPath(new URL('../src/data/blog/', import.meta.url));

/** loc → lastmod (o undefined) de cada <url> del sitemap generado. */
function sitemapEntries() {
  const entries = new Map();
  for (const [, block] of readDist('sitemap-0.xml').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    entries.set(loc, block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]);
  }
  return entries;
}

/** Carpeta temporal con la forma de src/ (sin repo git) para probar buildLastmodMap. */
function fixtureRoot(files) {
  const root = mkdtempSync(join(tmpdir(), 'llavors-lastmod-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const article = ({ slug, category = 'funcions-orals', publishedAt, updatedAt, draft = false }) =>
  [
    '---',
    `translationKey: ${slug}`,
    `title: "${slug}"`,
    `slug: ${slug}`,
    `category: ${category}`,
    `publishedAt: ${publishedAt}`,
    ...(updatedAt ? [`updatedAt: ${updatedAt}`] : []),
    `draft: ${draft}`,
    '---',
    '',
    '<p>Text.</p>',
    '',
  ].join('\n');

test('el lastmod de un artículo es su updatedAt', () => {
  const lastmod = sitemapEntries().get(`${SITE}/es/blog/por-que-mi-hijo-babea/`);
  assert.ok(lastmod?.startsWith('2026-11-20'), `lastmod: ${lastmod}`);
});

test('el lastmod de un artículo sin updatedAt es su publishedAt', () => {
  const sinUpdated = ['ca', 'es'].flatMap((lang) =>
    readdirSync(join(BLOG_DIR, lang))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => ({ lang, fm: readFileSync(join(BLOG_DIR, lang, f), 'utf8').split(/\r?\n---/)[0] }))
      .filter(({ fm }) => !/^updatedAt:/m.test(fm) && !/^draft:\s*true/m.test(fm)),
  );
  if (sinUpdated.length > 0) {
    const { lang, fm } = sinUpdated[0];
    const slug = fm.match(/^slug:\s*(\S+)/m)[1];
    const publishedAt = fm.match(/^publishedAt:\s*(\S+)/m)[1];
    const url = `${SITE}${lang === 'es' ? '/es' : ''}/blog/${slug}/`;
    assert.ok(sitemapEntries().get(url)?.startsWith(publishedAt), url);
    return;
  }
  const root = fixtureRoot({
    'src/data/blog/es/a.mdx': article({ slug: 'sin-updated', publishedAt: '2026-03-05' }),
  });
  try {
    assert.equal(buildLastmodMap(SITE, root).get(`${SITE}/es/blog/sin-updated/`), '2026-03-05T00:00:00.000Z');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('el sitemap coincide con buildLastmodMap', () => {
  const map = buildLastmodMap(SITE);
  const entries = sitemapEntries();
  assert.ok(map.size > 0, 'el mapa está vacío');
  for (const [loc, lastmod] of entries) {
    if (lastmod !== undefined) assert.equal(lastmod, map.get(loc), `lastmod de ${loc}`);
  }
  for (const [url, date] of map) {
    assert.ok(entries.has(url), `falta en el sitemap: ${url}`);
    assert.equal(entries.get(url), date, `lastmod de ${url}`);
  }
});

test('ningún lastmod es la fecha del build', () => {
  const builtAt = statSync(DIST_SITEMAP).mtime.getTime();
  const map = buildLastmodMap(SITE);
  for (const [loc, lastmod] of sitemapEntries()) {
    if (lastmod === undefined || map.get(loc) === lastmod) continue;
    assert.ok(Math.abs(new Date(lastmod).getTime() - builtAt) > 10 * 60_000, `${loc} usa la fecha del build: ${lastmod}`);
  }
});

test('un borrador no cuenta para la fecha de su índice', () => {
  const root = fixtureRoot({
    'src/data/blog/ca/a.mdx': article({ slug: 'publicat', publishedAt: '2026-04-01', updatedAt: '2026-06-10' }),
    'src/data/blog/ca/b.mdx': article({ slug: 'esborrany', publishedAt: '2026-10-01', draft: true }),
  });
  try {
    const map = buildLastmodMap(SITE, root);
    assert.equal(map.get(`${SITE}/blog/publicat/`), '2026-06-10T00:00:00.000Z');
    assert.equal(map.has(`${SITE}/blog/esborrany/`), false, 'el borrador está en el mapa');
    assert.equal(map.get(`${SITE}/blog/`), '2026-06-10T00:00:00.000Z');
    assert.equal(map.get(`${SITE}/blog/categoria/funcions-orals/`), '2026-06-10T00:00:00.000Z');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('sin git las URLs de git no tienen fecha', () => {
  const root = fixtureRoot({
    'src/data/blog/es/a.mdx': article({ slug: 'articulo', publishedAt: '2026-04-01' }),
    'src/data/services/es/servicio.mdx': '---\ntranslationKey: x\nslug: servicio-valencia\n---\n',
    'src/pages/index.astro': '---\n---\n',
    'src/pages/es/index.astro': '---\n---\n',
    'src/i18n/ca.ts': '',
    'src/i18n/es.ts': '',
    'src/components/X.astro': '',
  });
  try {
    const map = buildLastmodMap(SITE, root);
    assert.equal(map.get(`${SITE}/es/blog/articulo/`), '2026-04-01T00:00:00.000Z');
    assert.equal(map.has(`${SITE}/es/servicio-valencia/`), false, 'servicio con fecha sin git');
    assert.equal(map.has(`${SITE}/`), false, 'portada ca con fecha sin git');
    assert.equal(map.has(`${SITE}/es/`), false, 'portada es con fecha sin git');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('servicios y portadas tienen la fecha de su último commit', () => {
  const map = buildLastmodMap(SITE);
  for (const url of [`${SITE}/`, `${SITE}/es/`, `${SITE}/logopeda-neonatal-valencia/`, `${SITE}/es/asesora-lactancia-valencia/`]) {
    assert.match(map.get(url) ?? '', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/, url);
  }
});
