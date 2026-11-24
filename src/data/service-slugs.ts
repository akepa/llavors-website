import type { Lang } from '../i18n/index'

// Slug de cada página de servicio por idioma. Tiene que coincidir con el `slug`
// del MDX en src/data/services/{ca,es}/: si no, el build falla (assertServiceSlugs).
// Al añadir un servicio: su MDX en los dos idiomas + una entrada aquí.
// Vive fuera de src/utils/services.ts para que astro.config.mjs (sitemap) pueda importarlo.
export const SERVICE_SLUGS = {
  neonatal: { ca: 'logopeda-neonatal-valencia', es: 'logopeda-neonatal-valencia' },
  lactancia: { ca: 'assessora-lactancia-valencia', es: 'asesora-lactancia-valencia' },
  miofuncional: { ca: 'terapia-miofuncional-infantil-valencia', es: 'terapia-miofuncional-infantil-valencia' },
  lenguaje: { ca: 'logopeda-infantil-llenguatge-valencia', es: 'logopeda-infantil-lenguaje-valencia' },
  domicilio: { ca: 'logopeda-a-domicili-valencia', es: 'logopeda-a-domicilio-valencia' },
} as const satisfies Record<string, Record<Lang, string>>

export type ServiceKey = keyof typeof SERVICE_SLUGS

/** Claves de servicio, en el orden de SERVICE_SLUGS (tupla no vacía para z.enum). */
export const SERVICE_KEYS = Object.keys(SERVICE_SLUGS) as [ServiceKey, ...ServiceKey[]]
