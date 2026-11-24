import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listRoutes, readPage, readDist } from './helpers.mjs';

// No se publica nada sobre seguros médicos (decisión de Àngela y Adam, nov. 2026).
const SEGUROS = /segur(o|os)\s+m[eé]dic|asseguran[cç]a|asseguradora/i;

test('ninguna página menciona seguros médicos', () => {
  for (const route of listRoutes()) {
    assert.ok(!SEGUROS.test(readPage(route)), `${route} menciona seguros médicos`);
  }
});

test('llms.txt no menciona seguros médicos', () => {
  assert.ok(!SEGUROS.test(readDist('llms.txt')));
});
