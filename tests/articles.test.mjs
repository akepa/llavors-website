import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPage, jsonLd } from './helpers.mjs';
import { SERVICES } from './fixtures.mjs';

// Artículos revisados (tarea 11). Cada PR añade su entrada.
const UPDATED_ARTICLES = [
  {
    key: 'anquiloglosia',
    es: '/es/blog/anquiloglosia-frenillo-lingual-corto-bebes/',
    ca: '/blog/anquiloglossia-fre-lingual-curt-nadons/',
    relatedService: 'lactancia',
  },
  {
    key: 'solidos',
    es: '/es/blog/introduccion-solidos-5-senales/',
    ca: '/blog/introduccio-solids-5-senyals/',
    relatedService: 'lactancia',
  },
  {
    key: 'babea',
    es: '/es/blog/por-que-mi-hijo-babea/',
    ca: '/blog/per-que-el-meu-fill-bava/',
    relatedService: 'miofuncional',
  },
];

const SOURCES_H2 = { es: 'Fuentes', ca: 'Fonts' };
const hrefs = (html) => [...html.matchAll(/<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]);

for (const art of UPDATED_ARTICLES) {
  for (const lang of ['es', 'ca']) {
    const route = art[lang];
    const label = `${art.key} (${lang})`;

    test(`${label}: caja de autora con colegiada 46666`, () => {
      const html = readPage(route);
      const box = html.match(/<aside[^>]*data-author-box[^>]*>[\s\S]*?<\/aside>/i)?.[0];
      assert.ok(box, 'falta data-author-box');
      assert.ok(box.includes('46666'), 'la caja no contiene 46666');
    });

    test(`${label}: enlaza a la página del servicio ${art.relatedService}`, () => {
      assert.ok(hrefs(readPage(route)).includes(SERVICES[art.relatedService][lang]));
    });

    test(`${label}: H2 de fuentes con al menos 2 enlaces externos`, () => {
      const html = readPage(route);
      const re = new RegExp(`<h2[^>]*>\\s*${SOURCES_H2[lang]}\\s*</h2>\\s*<ul[^>]*>([\\s\\S]*?)</ul>`, 'i');
      const list = html.match(re)?.[1];
      assert.ok(list, `falta <h2>${SOURCES_H2[lang]}</h2> seguido de una lista`);
      const external = hrefs(list).filter((h) => /^https?:\/\//.test(h));
      assert.ok(external.length >= 2, `solo ${external.length} enlaces externos`);
    });

    test(`${label}: JSON-LD Article con dateModified posterior a datePublished`, () => {
      const article = jsonLd(readPage(route)).find((b) => b['@type'] === 'Article');
      assert.ok(article, 'falta JSON-LD Article');
      assert.ok(new Date(article.dateModified) > new Date(article.datePublished));
    });
  }
}
