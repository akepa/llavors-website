import { getCollection, type CollectionEntry } from 'astro:content'
import type { Lang } from '../i18n/index'
import { isLang } from './blog'
import { SERVICE_SLUGS, SERVICE_KEYS, type ServiceKey } from '../data/service-slugs'
import { business } from '../data/business'

export type { ServiceKey }
export type ServiceEntry = CollectionEntry<'services'>

const LANGS: Lang[] = ['ca', 'es']

/** Ruta relativa de la página de servicio, con barra final ('/es/logopeda-neonatal-valencia/'). */
export function serviceUrl(key: ServiceKey, lang: Lang): string {
  const slug = SERVICE_SLUGS[key][lang]
  return lang === 'es' ? `/es/${slug}/` : `/${slug}/`
}

/** URL absoluta de la página de servicio. */
export function serviceAbsoluteUrl(key: ServiceKey, lang: Lang): string {
  return `${business.url}${serviceUrl(key, lang)}`
}

/** Idioma de la entrada, sacado de su carpeta (id 'ca/logopeda-neonatal'). */
export function serviceLang(entry: ServiceEntry): Lang {
  const lang = entry.id.split('/')[0]
  if (lang !== 'ca' && lang !== 'es') {
    throw new Error(`services: ${entry.id} debe estar en src/data/services/ca/ o src/data/services/es/`)
  }
  return lang
}

/** Falla el build si SERVICE_SLUGS y la colección no describen las mismas páginas. */
function assertServiceSlugs(entries: ServiceEntry[]): void {
  for (const entry of entries) {
    const lang = serviceLang(entry)
    const { translationKey: key, slug } = entry.data
    if (SERVICE_SLUGS[key][lang] !== slug) {
      throw new Error(
        `services: ${entry.id} tiene slug «${slug}» pero SERVICE_SLUGS.${key}.${lang} es «${SERVICE_SLUGS[key][lang]}»`,
      )
    }
  }
  for (const key of SERVICE_KEYS) {
    for (const lang of LANGS) {
      const matches = entries.filter((e) => e.data.translationKey === key && serviceLang(e) === lang)
      if (matches.length !== 1) {
        throw new Error(`services: «${key}» (${lang}) tiene ${matches.length} MDX en src/data/services/${lang}/ (debe tener 1)`)
      }
    }
  }
}

/** getStaticPaths de las páginas de servicio de un idioma. */
export async function getServicePaths(lang: Lang) {
  const entries = await getCollection('services')
  assertServiceSlugs(entries)

  const posts = (await getCollection('blog'))
    .filter((p) => isLang(p, lang) && !p.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())

  return entries
    .filter((entry) => serviceLang(entry) === lang)
    .map((entry) => ({
      params: { service: entry.data.slug },
      props: {
        entry,
        related: posts.filter((p) => p.data.category === entry.data.relatedCategory).slice(0, 3),
      },
    }))
}
