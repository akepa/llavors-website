// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SERVICE_SLUGS } from './src/data/service-slugs'

const SITE = 'https://www.llavorslogopedia.com'
const BLOG_DIR = fileURLToPath(new URL('./src/data/blog/', import.meta.url))

/**
 * translationKey → slug de los artículos publicados de un idioma.
 * Lee el frontmatter de src/data/blog/<lang>/*.mdx (la config no tiene acceso a astro:content).
 * @param {'ca' | 'es'} lang
 */
function blogSlugs(lang) {
  const slugs = new Map()
  for (const file of readdirSync(`${BLOG_DIR}${lang}`).filter((f) => /^[^_].*\.mdx?$/.test(f))) {
    const fm = readFileSync(`${BLOG_DIR}${lang}/${file}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
    /** @param {string} name */
    const field = (name) => fm.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+?)['"]?\\s*$`, 'm'))?.[1]
    if (field('draft') === 'true') continue
    slugs.set(field('translationKey'), field('slug'))
  }
  return slugs
}

// Páginas con slug distinto en cada idioma (servicios y artículos del blog): el
// sitemap solo empareja por prefijo de idioma, así que sus alternates se declaran aquí.
/** @type {Map<string, { url: string, lang: string }[]>} */
const alternates = new Map()
/**
 * Con el mismo slug en los dos idiomas el sitemap ya los empareja: no hace falta declararlos.
 * @param {'' | '/blog'} base ruta común de la página ('' para servicios)
 * @param {string | undefined} ca slug en valenciano
 * @param {string | undefined} es slug en castellano
 */
function addAlternates(base, ca, es) {
  if (!ca || !es || ca === es) return
  const links = [
    { url: `${SITE}${base}/${ca}/`, lang: 'ca' },
    { url: `${SITE}/es${base}/${es}/`, lang: 'es' },
  ]
  for (const { url } of links) alternates.set(url, links)
}
for (const slugs of Object.values(SERVICE_SLUGS)) addAlternates('', slugs.ca, slugs.es)
const blogEs = blogSlugs('es')
for (const [key, ca] of blogSlugs('ca')) addAlternates('/blog', ca, blogEs.get(key))

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/draft') &&
        !['/privacidad', '/aviso-legal', '/cookies'].some((p) => page.includes(p)),
      serialize: (item) => ({
        ...item,
        lastmod: new Date().toISOString(),
        ...(alternates.has(item.url) && { links: alternates.get(item.url) }),
      }),
      i18n: {
        defaultLocale: 'ca',
        locales: {
          ca: 'ca',
          es: 'es',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
