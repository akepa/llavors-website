// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://www.llavorslogopedia.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/draft'),
      i18n: {
        defaultLocale: 'ca',
        locales: {
          ca: 'ca-ES-valencia',
          es: 'es-ES',
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
