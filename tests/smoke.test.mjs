import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPage, jsonLd } from './helpers.mjs';

test('/es/ tiene un <title> que termina en | Llavors Logopèdia', () => {
  const html = readPage('/es/');
  const m = html.match(/<title>([^<]*)<\/title>/);
  assert.ok(m, 'falta <title>');
  assert.ok(m[1].endsWith('| Llavors Logopèdia'), `title inesperado: ${m[1]}`);
});

test('/es/ incluye JSON-LD de tipo MedicalBusiness', () => {
  const blocks = jsonLd(readPage('/es/'));
  assert.ok(blocks.some((b) => b['@type'] === 'MedicalBusiness'));
});
