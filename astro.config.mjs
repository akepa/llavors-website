// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import { SERVICE_SLUGS } from './src/data/service-slugs'
// La config no tiene acceso a astro:content: el frontmatter se lee en lastmod.mjs.
import { blogSlugs, buildLastmodMap } from './src/data/lastmod.mjs'

const SITE = 'https://www.llavorslogopedia.com'

// lastmod determinista por URL; las que no están en el mapa van sin lastmod.
const lastmods = buildLastmodMap(SITE)

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
        ...(lastmods.has(item.url) && { lastmod: lastmods.get(item.url) }),
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
