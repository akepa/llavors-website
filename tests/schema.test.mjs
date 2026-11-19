import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, listRoutes, jsonLd, findDirty } from './helpers.mjs';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

const SITE = 'https://www.llavorslogopedia.com';
const BUSINESS_ID = `${SITE}/#negocio`;
const PERSON_ID = `${SITE}/#angela`;
const DOCTORALIA = 'https://www.doctoralia.es/angela-alonso-millet/logopeda/valencia';

// Si business.address es null, el JSON-LD no lleva address y el bloque de
// dirección del pie debe decir «a domicilio» / «a domicili».
const ADDRESS_LABEL = { '/es/': 'Dirección', '/': 'Adreça' };

// Literales que solo pueden estar en src/data/business.ts.
const SINGLE_SOURCE = ['614337743', '614 33 77 43', 'Calle Chile', 'info@llavorslogopedia'];
const HOURS = {
  '/es/': ['Lun 11:00–19:00', 'Mar 11:00–14:00', 'Mié 9:30–14:00', 'Jue 11:00–19:30', 'Vie 9:30–14:00'],
  '/': ['Dl 11:00–19:00', 'Dt 11:00–14:00', 'Dc 9:30–14:00', 'Dj 11:00–19:30', 'Dv 9:30–14:00'],
};

/** Texto visible (sin etiquetas, scripts ni estilos) con espacios colapsados. */
function visibleText(html) {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function footerHtml(html) {
  const m = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i);
  assert.ok(m, 'falta <footer>');
  return m[0];
}

/** Texto del bloque que sigue al rótulo de dirección del pie (y solo ese bloque). */
function footerAddressText(footer, label) {
  const re = new RegExp(`<span class="footer-info-label"[^>]*>${label}</span>\\s*<span[^>]*>([\\s\\S]*?)</span>`);
  const m = footer.match(re);
  assert.ok(m, `falta el bloque «${label}» en el pie`);
  return visibleText(m[1]).trim();
}

test('findDirty devuelve las rutas JSON de undefined, null y cadenas vacías', () => {
  assert.deepEqual(findDirty({ a: 1, b: 'x', c: [true, 0], d: {} }), []);
  assert.deepEqual(
    findDirty({ a: null, b: '', c: undefined, founder: { sameAs: ['ok', 'ok', ''] }, img: 'https://x/undefined' }),
    ['$.a', '$.b', '$.c', '$.founder.sameAs[2]', '$.img'],
  );
});

test("en '/es/' el MedicalBusiness enlaza el negocio, la fundadora y los perfiles", () => {
  const biz = jsonLd(readPage('/es/')).find((b) => b['@type'] === 'MedicalBusiness');
  assert.ok(biz, 'falta MedicalBusiness');
  assert.equal(biz['@id'], BUSINESS_ID);
  assert.equal(biz.founder?.['@id'], PERSON_ID);
  assert.ok(biz.sameAs?.includes(DOCTORALIA), `sameAs sin Doctoralia: ${JSON.stringify(biz.sameAs)}`);
  assert.ok(Array.isArray(biz.areaServed), 'areaServed debe ser una lista');
  assert.ok(!biz.areaServed.includes('España'), 'areaServed no debe incluir España');
  assert.deepEqual(biz.founder.sameAs, [DOCTORALIA], 'founder.sameAs solo con perfiles de la persona');
});

for (const route of ['/es/', '/']) {
  test(`'${route}' muestra en el pie la dirección y cada tramo de horario, y la colegiada 46666`, () => {
    const html = readPage(route);
    const footer = visibleText(footerHtml(html));
    const address = footerAddressText(footerHtml(html), ADDRESS_LABEL[route]);
    const biz = jsonLd(html).find((b) => b['@type'] === 'MedicalBusiness');
    if (biz?.address) {
      const { streetAddress, postalCode, addressLocality } = biz.address;
      assert.equal(address, `${streetAddress} · ${postalCode} ${addressLocality}`);
    } else {
      assert.match(address, /^a domicilio?$/i);
    }
    for (const slot of HOURS[route]) {
      assert.ok(footer.includes(slot), `falta el tramo «${slot}» en el pie: ${footer}`);
    }
    assert.ok(visibleText(html).includes('46666'), 'no se muestra el n.º de colegiada 46666');
  });
}

test('cada artículo del blog tiene un Article con author @id #angela', () => {
  const articles = listRoutes().filter((r) => /^\/(es\/)?blog\/(?!categoria\/)(?!\d+\/)[^/]+\/$/.test(r));
  assert.ok(articles.length >= 2, `pocas rutas de artículo: ${articles}`);
  for (const route of articles) {
    const article = jsonLd(readPage(route)).find((b) => b['@type'] === 'Article');
    assert.ok(article, `${route}: falta Article`);
    assert.equal(article.author?.['@id'], PERSON_ID, `${route}: author @id`);
  }
});

test('ningún bloque JSON-LD de ninguna ruta contiene undefined, null ni cadenas vacías', () => {
  const dirty = [];
  for (const route of listRoutes()) {
    jsonLd(readPage(route)).forEach((block, i) => {
      for (const path of findDirty(block)) dirty.push(`${route} [${i}] ${path}`);
    });
  }
  assert.deepEqual(dirty, []);
});

for (const route of ['/aviso-legal/', '/es/aviso-legal/', '/privacidad/', '/es/privacidad/']) {
  test(`'${route}' muestra el domicilio del titular (al menos la localidad)`, () => {
    const m = readPage(route).match(/<li><strong>(?:Domicilio|Dirección):<\/strong>([^<]*)<\/li>/);
    assert.ok(m, 'falta la línea de domicilio');
    assert.ok(m[1].includes('València'), `domicilio sin localidad: ${m[1]}`);
  });
}

test('teléfono, dirección y email solo aparecen en src/data/business.ts', () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(astro|ts)$/.test(entry.name)) {
        const rel = relative(SRC, full).split(sep).join('/');
        if (rel === 'data/business.ts') continue;
        const text = readFileSync(full, 'utf8');
        for (const literal of SINGLE_SOURCE) {
          if (text.includes(literal)) offenders.push(`src/${rel}: ${literal}`);
        }
      }
    }
  };
  walk(SRC);
  assert.deepEqual(offenders, []);
});
