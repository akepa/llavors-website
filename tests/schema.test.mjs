import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPage, listRoutes, jsonLd, findDirty } from './helpers.mjs';

const SITE = 'https://www.llavorslogopedia.com';
const BUSINESS_ID = `${SITE}/#negocio`;
const PERSON_ID = `${SITE}/#angela`;
const DOCTORALIA = 'https://www.doctoralia.es/angela-alonso-millet/logopeda/valencia';

// Datos publicados en la web (src/data/business.ts). Si el negocio pasa a
// atender solo a domicilio (address = null), el pie debe decir «a domicilio».
const ADDRESS = ['Calle Chile, 4', '46021 València'];
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

function footerText(html) {
  const m = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i);
  assert.ok(m, 'falta <footer>');
  return visibleText(m[0]);
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
});

for (const route of ['/es/', '/']) {
  test(`'${route}' muestra en el pie la dirección y cada tramo de horario, y la colegiada 46666`, () => {
    const html = readPage(route);
    const footer = footerText(html);
    const hasAddress = ADDRESS.every((part) => footer.includes(part));
    const homeVisits = /a domicili/i.test(footer);
    assert.ok(hasAddress || homeVisits, `el pie no muestra la dirección: ${footer}`);
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
