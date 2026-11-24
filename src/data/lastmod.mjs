// Fechas de última modificación (lastmod) del sitemap, deterministas: dos builds
// sin cambios dan el mismo sitemap. Lo usan astro.config.mjs y tests/sitemap.test.mjs,
// por eso es .mjs con JSDoc (la config y `node --test` no cargan TypeScript).
//
// - Artículo publicado: updatedAt ?? publishedAt del frontmatter.
// - Índice del blog y categorías: la fecha del artículo más reciente que listan.
// - Servicio: último commit de su .mdx.
// - Portada: último commit de la página, src/components y src/i18n/<lang>.ts.
// Si git no está, falla o el clon es superficial, esas URLs quedan sin lastmod
// (nunca la fecha del build).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {'ca' | 'es'} Lang */

const LANGS = /** @type {const} */ (['ca', 'es']);
const DEFAULT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Frontmatter de cada .mdx de una carpeta (los que empiezan por `_` se ignoran),
 * como función que devuelve el valor de un campo escalar.
 * @param {string} dir
 * @returns {{ file: string, field: (name: string) => string | undefined }[]}
 */
function readFrontmatters(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^[^_].*\.mdx?$/.test(f))
    .sort()
    .map((f) => {
      const file = join(dir, f);
      const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      /** @param {string} name */
      const field = (name) => fm.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+?)['"]?\\s*$`, 'm'))?.[1];
      return { file, field };
    });
}

/**
 * Artículos publicados (sin `draft: true`) de un idioma.
 * @param {Lang} lang
 * @param {string} [root] raíz del proyecto
 * @returns {{ translationKey: string | undefined, slug: string | undefined, category: string | undefined, date: string | undefined }[]}
 */
export function blogArticles(lang, root = DEFAULT_ROOT) {
  return readFrontmatters(join(root, 'src/data/blog', lang))
    .filter(({ field }) => field('draft') !== 'true')
    .map(({ field }) => ({
      translationKey: field('translationKey'),
      slug: field('slug'),
      category: field('category'),
      date: isoDate(field('updatedAt') ?? field('publishedAt')),
    }));
}

/**
 * translationKey → slug de los artículos publicados de un idioma.
 * @param {Lang} lang
 * @param {string} [root] raíz del proyecto
 */
export function blogSlugs(lang, root = DEFAULT_ROOT) {
  return new Map(blogArticles(lang, root).map((a) => [a.translationKey, a.slug]));
}

/** @param {string | undefined} value fecha del frontmatter o de git */
function isoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** @param {(string | undefined)[]} dates ISO 8601 en UTC: el orden de texto es el cronológico */
function latest(dates) {
  return dates.filter((d) => d !== undefined).sort().at(-1);
}

/**
 * Fecha del último commit que toca alguna de las rutas, o undefined si git no la sabe.
 * Solo vale el repo cuya raíz es `root` (no uno que lo contenga) y no un clon superficial,
 * donde el último commit visible no es el que cambió el archivo.
 * @param {string} root
 * @returns {(paths: string[]) => string | undefined}
 */
function gitDates(root) {
  /** @param {string[]} args */
  const git = (args) => {
    try {
      return execFileSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        env: { ...process.env, GIT_CEILING_DIRECTORIES: dirname(root.replace(/[\\/]+$/, '')) },
      }).trim();
    } catch {
      return '';
    }
  };
  const usable = git(['rev-parse', '--is-shallow-repository']) === 'false';
  return (paths) => (usable ? isoDate(git(['log', '-1', '--format=%cI', '--', ...paths])) : undefined);
}

/**
 * URL absoluta (con barra final) → lastmod ISO 8601 de las páginas que se saben fechar.
 * Las que no están en el mapa van al sitemap sin lastmod.
 * @param {string} site p. ej. 'https://www.llavorslogopedia.com'
 * @param {string} [root] raíz del proyecto (por defecto, la de este repo)
 * @returns {Map<string, string>}
 */
export function buildLastmodMap(site, root = DEFAULT_ROOT) {
  /** @type {Map<string, string>} */
  const map = new Map();
  /** @param {string} path @param {string | undefined} date */
  const set = (path, date) => {
    if (date) map.set(`${site}${path}`, date);
  };
  const gitDate = gitDates(root);

  for (const lang of LANGS) {
    const prefix = lang === 'es' ? '/es' : '';

    const articles = blogArticles(lang, root).filter((a) => a.slug);
    for (const a of articles) set(`${prefix}/blog/${a.slug}/`, a.date);
    set(`${prefix}/blog/`, latest(articles.map((a) => a.date)));
    for (const category of new Set(articles.map((a) => a.category))) {
      if (!category) continue;
      const dates = articles.filter((a) => a.category === category).map((a) => a.date);
      set(`${prefix}/blog/categoria/${category}/`, latest(dates));
    }

    for (const { file, field } of readFrontmatters(join(root, 'src/data/services', lang))) {
      const slug = field('slug');
      if (slug) set(`${prefix}/${slug}/`, gitDate([file]));
    }

    const page = lang === 'es' ? 'src/pages/es/index.astro' : 'src/pages/index.astro';
    set(`${prefix}/`, gitDate([page, 'src/components', `src/i18n/${lang}.ts`]));
  }
  return map;
}
