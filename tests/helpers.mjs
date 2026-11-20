import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');

function assertDist() {
  if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
    throw new Error(`No existe dist/ (${DIST}). Ejecuta "npm run build" antes de "npm test".`);
  }
}

/** Contenido de cualquier archivo de dist/ ('sitemap-0.xml', 'llms.txt'). */
export function readDist(file) {
  assertDist();
  return readFileSync(join(DIST, file.replace(/^\/+/, '')), 'utf8');
}

/** HTML de dist/<route>/index.html ('/', '/es/', '/privacidad/'). */
export function readPage(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return readDist(clean ? `${clean}/index.html` : 'index.html');
}

/** Todas las rutas con index.html en dist/ ('/', '/es/', ...). */
export function listRoutes() {
  assertDist();
  const routes = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        const rel = relative(DIST, dir).split(sep).join('/');
        routes.push(rel ? `/${rel}/` : '/');
      }
    }
  };
  walk(DIST);
  return routes.sort();
}

/** Bloques application/ld+json de un HTML, parseados. */
export function jsonLd(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(re)].map((m) => JSON.parse(m[1]));
}

/**
 * Rutas JSON ('$.founder.sameAs[2]') de los valores "sucios" de un bloque:
 * undefined, null, '' y cadenas que delatan una interpolación rota
 * ('null' exacto o que contienen la palabra 'undefined').
 */
export function findDirty(value, path = '$') {
  if (value === undefined || value === null || value === '') return [path];
  if (typeof value === 'string') {
    return value === 'null' || /\bundefined\b/.test(value) ? [path] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => findDirty(v, `${path}[${i}]`));
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => findDirty(v, `${path}.${k}`));
  }
  return [];
}
