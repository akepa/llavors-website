// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://www.llavorslogopedia.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/blog'),
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
