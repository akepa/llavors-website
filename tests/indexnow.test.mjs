import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readDist } from './helpers.mjs';
import { KEY, HOST, extractLocs, extractEntries, changedUrls, buildPayload } from '../scripts/indexnow.mjs';

test('la clave de IndexNow son 32 caracteres hexadecimales', () => {
  assert.match(KEY, /^[0-9a-f]{32}$/);
});

test('dist/<clave>.txt existe y contiene la propia clave', () => {
  assert.equal(readDist(`${KEY}.txt`).trim(), KEY);
});

test('extractLocs lee las URLs del índice y del sitemap generados', () => {
  const sitemaps = extractLocs(readDist('sitemap-index.xml'));
  assert.deepEqual(sitemaps, [`https://${HOST}/sitemap-0.xml`]);

  const urls = extractLocs(readDist('sitemap-0.xml'));
  assert.ok(urls.length > 10, `pocas URLs: ${urls.length}`);
  assert.ok(urls.every((u) => u.startsWith(`https://${HOST}/`)), 'URL fuera del host');
  assert.ok(urls.includes(`https://${HOST}/`), 'falta la home');
});

test('buildPayload arma el cuerpo que pide api.indexnow.org', () => {
  const urls = [`https://${HOST}/`, `https://${HOST}/es/`];
  assert.deepEqual(buildPayload(urls), {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  });
});

/** Texto de un workflow de .github/workflows. */
const workflow = (name) => readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8');

test('ci.yml y el build de deploy.yml clonan el historial completo (fechas de git del sitemap)', () => {
  const build = workflow('deploy.yml').split(/\r?\n {2}build:\r?\n/)[1]?.split(/\r?\n {2}\w+:\r?\n/)[0];
  assert.ok(build, 'falta el job build');
  for (const [name, yml] of [['ci.yml', workflow('ci.yml')], ['deploy.yml (build)', build]]) {
    assert.match(yml, /actions\/checkout@v4\r?\n\s+with:\r?\n\s+fetch-depth: 0/, `${name} sin fetch-depth: 0`);
  }
});

test('deploy.yml lanza el job indexnow después de desplegar', () => {
  const yml = workflow('deploy.yml');
  const job = yml.split(/\r?\n {2}indexnow:\r?\n/)[1];
  assert.ok(job, 'falta el job indexnow');
  assert.match(job, /needs: \[build, deploy\]/);
  assert.match(job, /actions\/checkout@v4/);
  assert.match(job, /actions\/setup-node@v4/);
  assert.match(job, /node scripts\/indexnow\.mjs/);
});

test('deploy.yml pasa a indexnow solo las URLs cambiadas', () => {
  const [build, rest] = workflow('deploy.yml').split(/\r?\n {2}build:\r?\n/)[1].split(/\r?\n {2}deploy:\r?\n/);
  const indexnow = rest.split(/\r?\n {2}indexnow:\r?\n/)[1];
  assert.match(build, /changed_urls: \$\{\{ steps\.changed\.outputs\.urls \}\}/, 'build no expone changed_urls');
  assert.match(build, /id: changed[\s\S]*node scripts\/indexnow\.mjs --changed dist\/sitemap-0\.xml/);
  assert.ok(
    build.indexOf('--changed') > build.indexOf('npm run build') &&
      build.indexOf('--changed') < build.indexOf('upload-pages-artifact'),
    '--changed tiene que ir tras el build y antes de subir el artefacto',
  );
  // En un push se salta sin cambios y envía solo los cambios; a mano (workflow_dispatch), todo.
  assert.match(
    indexnow,
    /if: github\.event_name == 'workflow_dispatch' \|\| needs\.build\.outputs\.changed_urls != '\[\]'/,
  );
  assert.match(
    indexnow,
    /INDEXNOW_URLS: \$\{\{ github\.event_name != 'workflow_dispatch' && needs\.build\.outputs\.changed_urls \|\| '' \}\}/,
  );
});

const sitemap = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .map(([loc, lastmod]) => `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
    .join('')}</urlset>`;
const A = `https://${HOST}/`;
const B = `https://${HOST}/es/`;
const D1 = '2026-11-20T00:00:00.000Z';
const D2 = '2026-11-24T10:00:00.000Z';

test('extractEntries lee loc y lastmod del sitemap generado', () => {
  const entries = extractEntries(readDist('sitemap-0.xml'));
  assert.deepEqual(entries.map((e) => e.loc), extractLocs(readDist('sitemap-0.xml')));
  assert.deepEqual(extractEntries(sitemap([[A, D1], [B]])), [{ loc: A, lastmod: D1 }, { loc: B }]);
});

test('changedUrls incluye una URL nueva', () => {
  assert.deepEqual(changedUrls(sitemap([[A, D1]]), sitemap([[A, D1], [B, D1]])), [B]);
});

test('changedUrls excluye una URL con el mismo lastmod', () => {
  assert.deepEqual(changedUrls(sitemap([[A, D1], [B, D1]]), sitemap([[A, D1], [B, D1]])), []);
});

test('changedUrls incluye una URL con lastmod distinto', () => {
  assert.deepEqual(changedUrls(sitemap([[A, D1], [B, D1]]), sitemap([[A, D2], [B, D1]])), [A]);
});

test('changedUrls sin sitemap publicado devuelve todas', () => {
  assert.deepEqual(changedUrls(null, sitemap([[A, D1], [B]])), [A, B]);
});

test('changedUrls incluye las entradas sin lastmod en cualquiera de los dos', () => {
  assert.deepEqual(changedUrls(sitemap([[A, D1], [B]]), sitemap([[A], [B]])), [A, B]);
  assert.deepEqual(changedUrls(sitemap([[A], [B]]), sitemap([[A, D1], [B]])), [A, B]);
});
