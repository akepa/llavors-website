import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPage, listRoutes } from './helpers.mjs';

const text = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const title = (html) => html.match(/<title>([\s\S]*?)<\/title>/)[1];

test('title de /es/ empieza por Logopeda neonatal', () => {
  assert.ok(title(readPage('/es/')).startsWith('Logopeda neonatal'), title(readPage('/es/')));
});

test('title de / empieza por Logopeda neonatal', () => {
  assert.ok(title(readPage('/')).startsWith('Logopeda neonatal'), title(readPage('/')));
});

test('H1 de /es/ contiene Logopeda neonatal en Valencia', () => {
  const h1 = readPage('/es/').match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.ok(text(h1).includes('Logopeda neonatal en Valencia'), text(h1));
});

test('H1 de / contiene Logopeda neonatal a València', () => {
  const h1 = readPage('/').match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.ok(text(h1).includes('Logopeda neonatal a València'), text(h1));
});

test('cada ruta tiene exactamente un <h1>', () => {
  for (const route of listRoutes()) {
    const n = (readPage(route).match(/<h1[\s>]/g) || []).length;
    assert.equal(n, 1, `${route} tiene ${n} <h1>`);
  }
});
