import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, listRoutes } from './helpers.mjs';

const DIST = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const MAX_BYTES = 300 * 1024;

const imgTags = (html) => [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
const attr = (tag, name) => tag.match(new RegExp(String.raw`\s${name}=(?:"([^"]*)"|'([^']*)')`, 'i'))?.slice(1).find((v) => v !== undefined);

for (const route of ['/es/', '/']) {
  test(`${route}: toda <img> tiene width y height`, () => {
    const tags = imgTags(readPage(route));
    assert.ok(tags.length > 0);
    for (const tag of tags) {
      assert.ok(attr(tag, 'width'), `sin width: ${tag}`);
      assert.ok(attr(tag, 'height'), `sin height: ${tag}`);
    }
  });

  test(`${route}: la imagen del hero sale de /_astro/ con fetchpriority="high"`, () => {
    const hero = imgTags(readPage(route)).find((t) => /hero-photo/.test(attr(t, 'class') ?? ''));
    assert.ok(hero, 'no hay <img> del hero');
    assert.match(attr(hero, 'src') ?? '', /\/_astro\//);
    assert.equal(attr(hero, 'fetchpriority'), 'high');
  });

  test(`${route}: ninguna imagen de /_astro/ enlazada pesa más de 300 KB`, () => {
    const urls = new Set();
    for (const tag of imgTags(readPage(route))) {
      const src = attr(tag, 'src');
      if (src) urls.add(src);
      for (const part of (attr(tag, 'srcset') ?? '').split(',')) {
        const u = part.trim().split(/\s+/)[0];
        if (u) urls.add(u);
      }
    }
    const astro = [...urls].filter((u) => u.includes('/_astro/'));
    assert.ok(astro.length > 0, 'no hay imágenes en /_astro/');
    for (const u of astro) {
      const file = join(DIST, u.split('?')[0].replace(/^\/+/, ''));
      assert.ok(statSync(file).size <= MAX_BYTES, `${u} pesa ${statSync(file).size} B`);
    }
  });
}

test('ninguna ruta contiene /images/angela-', () => {
  for (const route of listRoutes()) {
    assert.ok(!readPage(route).includes('/images/angela-'), `${route} referencia /images/angela-`);
  }
});
