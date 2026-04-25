// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://akepa.github.io/llavors-website',
  base: '/llavors-website/',
  output: 'static',
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
