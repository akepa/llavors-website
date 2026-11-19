// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import { SERVICE_SLUGS } from './src/data/service-slugs'

const SITE = 'https://www.llavorslogopedia.com'

// Páginas de servicio con slug distinto en cada idioma: el sitemap solo empareja
// por prefijo de idioma, así que sus alternates se declaran aquí.
const serviceAlternates = new Map()
for (const slugs of Object.values(SERVICE_SLUGS)) {
  if (slugs.ca === slugs.es) continue
  const links = [
    { url: `${SITE}/${slugs.ca}/`, lang: 'ca' },
    { url: `${SITE}/es/${slugs.es}/`, lang: 'es' },
  ]
  for (const { url } of links) serviceAlternates.set(url, links)
}

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
        ...(serviceAlternates.has(item.url) && { links: serviceAlternates.get(item.url) }),
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
