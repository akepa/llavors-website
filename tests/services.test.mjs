import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, listRoutes, jsonLd, readDist, findDirty } from './helpers.mjs';
import { SERVICES } from './fixtures.mjs';

const SITE = 'https://www.llavorslogopedia.com';
const BUSINESS_ID = `${SITE}/#negocio`;
const SERVICES_DIR = fileURLToPath(new URL('../src/data/services', import.meta.url));
const LANGS = ['es', 'ca'];
const other = (lang) => (lang === 'es' ? 'ca' : 'es');

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Texto visible (sin etiquetas, scripts ni estilos), con entidades decodificadas. */
const visibleText = (html) =>
  decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ');

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** href del <link rel="alternate" hreflang="..."> de la página. */
function hreflangHref(html, lang) {
  const tag = html.match(new RegExp(`<link\\b[^>]*hreflang="${lang}"[^>]*>`))?.[0];
  return tag?.match(/href="([^"]*)"/)?.[1];
}

const canonical = (html) => html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
const faqItemCount = (html) => (html.match(/<[a-z][\w-]*\b[^>]*\sdata-faq-item[\s=>]/gi) || []).length;

/** Frontmatter mínimo (translationKey, slug) de cada MDX de la colección services. */
function serviceEntries() {
  const entries = [];
  for (const lang of LANGS) {
    const dir = join(SERVICES_DIR, lang);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => /^[^_].*\.mdx?$/.test(f))) {
      const src = readFileSync(join(dir, file), 'utf8');
      const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      const field = (name) => fm.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+?)['"]?\\s*$`, 'm'))?.[1];
      entries.push({
        file: `${lang}/${file}`,
        lang,
        key: field('translationKey'),
        slug: field('slug'),
      });
    }
  }
  return entries;
}

test('la colección services y SERVICES (fixtures) describen las mismas páginas', () => {
  const entries = serviceEntries();
  assert.ok(entries.length > 0, 'no hay MDX en src/data/services/{ca,es}/');
  for (const e of entries) {
    const expected = `${e.lang === 'es' ? '/es/' : '/'}${e.slug}/`;
    assert.equal(SERVICES[e.key]?.[e.lang], expected, `${e.file}: SERVICES.${e.key}.${e.lang}`);
  }
  for (const [key, routes] of Object.entries(SERVICES)) {
    for (const lang of LANGS) {
      assert.ok(routes[lang], `SERVICES.${key} sin ruta ${lang}`);
      assert.ok(
        entries.some((e) => e.key === key && e.lang === lang),
        `SERVICES.${key}: falta el MDX en src/data/services/${lang}/`,
      );
    }
  }
});

for (const [key, routes] of Object.entries(SERVICES)) {
  for (const lang of LANGS) {
    const route = routes[lang];
    const url = `${SITE}${route}`;

    test(`${key} (${lang}): ${route} existe y tiene un solo <h1>`, () => {
      assert.ok(listRoutes().includes(route), `no existe ${route} en dist/`);
      const n = (readPage(route).match(/<h1[\s>]/g) || []).length;
      assert.equal(n, 1, `${route} tiene ${n} <h1>`);
    });

    test(`${key} (${lang}): JSON-LD con Service y FAQPage igual a las FAQ visibles`, () => {
      const html = readPage(route);
      const blocks = jsonLd(html);
      const service = blocks.find((b) => b['@type'] === 'Service');
      const faq = blocks.find((b) => b['@type'] === 'FAQPage');
      assert.ok(service, `${route}: falta Service`);
      assert.ok(faq, `${route}: falta FAQPage`);
      assert.equal(service.provider?.['@id'], BUSINESS_ID, 'Service.provider @id');
      assert.equal(service.url, url, 'Service.url');
      assert.ok(Array.isArray(service.areaServed) && service.areaServed.length > 0, 'Service.areaServed');

      const items = faqItemCount(html);
      assert.ok(items >= 3, `${route}: ${items} data-faq-item (mínimo 3)`);
      assert.equal(faq.mainEntity?.length, items, 'FAQPage.mainEntity.length ≠ data-faq-item');

      const text = norm(visibleText(html));
      for (const q of faq.mainEntity) {
        assert.ok(text.includes(norm(q.name)), `pregunta no visible: ${q.name}`);
        assert.ok(text.includes(norm(q.acceptedAnswer?.text ?? '')), `respuesta no visible: ${q.name}`);
      }

      const dirty = blocks.flatMap((b, i) => findDirty(b).map((p) => `[${i}] ${p}`));
      assert.deepEqual(dirty, [], `${route}: JSON-LD sucio`);
    });

    test(`${key} (${lang}): canonical, hreflang recíproco y botón de idioma`, () => {
      const html = readPage(route);
      const alt = routes[other(lang)];
      assert.equal(canonical(html), url, 'canonical');
      assert.equal(hreflangHref(html, lang), url, `hreflang="${lang}"`);
      assert.equal(hreflangHref(html, other(lang)), `${SITE}${alt}`, `hreflang="${other(lang)}"`);
      assert.equal(hreflangHref(html, 'x-default'), `${SITE}${routes.ca}`, 'hreflang="x-default"');
      assert.ok(html.includes(`href="${alt}"`), `el botón de idioma no enlaza a ${alt}`);
    });

    test(`${key} (${lang}): botón a la reserva y artículos del blog en su idioma`, () => {
      const html = readPage(route);
      const booking = lang === 'es' ? '/es/#reserva' : '/#reserva';
      assert.ok(html.includes(`href="${booking}"`), `falta el enlace a ${booking}`);

      const articleRe = /href="(\/(?:es\/)?blog\/(?!categoria\/)[^"#?/]+\/?)"/g;
      const articles = [...new Set([...html.matchAll(articleRe)].map((m) => m[1]))];
      assert.ok(articles.length >= 1, `${route}: no enlaza artículos del blog`);
      for (const a of articles) {
        assert.equal(a.startsWith('/es/'), lang === 'es', `${route}: artículo de otro idioma ${a}`);
      }
    });

    test(`${key} (${lang}): sin precios (ni «€» en <main> ni Service.offers)`, () => {
      const html = readPage(route);
      const service = jsonLd(html).find((b) => b['@type'] === 'Service');
      const main = visibleText(html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? '');
      assert.ok(service, `${route}: falta Service`);
      assert.ok(!('offers' in service), `${route}: Service no debe llevar offers`);
      assert.ok(!main.includes('€'), `${route}: muestra «€» en el contenido principal`);
    });
  }

  test(`${key}: las dos URLs están en sitemap-0.xml`, () => {
    const xml = readDist('sitemap-0.xml');
    for (const lang of LANGS) {
      assert.ok(xml.includes(`<loc>${SITE}${routes[lang]}</loc>`), `sitemap sin ${routes[lang]}`);
    }
  });
}
