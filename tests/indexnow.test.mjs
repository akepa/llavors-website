import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readDist } from './helpers.mjs';
import { KEY, HOST, extractLocs, buildPayload } from '../scripts/indexnow.mjs';

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
  assert.match(job, /needs: deploy/);
  assert.match(job, /actions\/checkout@v4/);
  assert.match(job, /actions\/setup-node@v4/);
  assert.match(job, /node scripts\/indexnow\.mjs/);
});
