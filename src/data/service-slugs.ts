import type { Lang } from '../i18n/index'

// Slug de cada página de servicio por idioma. Tiene que coincidir con el `slug`
// del MDX en src/data/services/{ca,es}/: si no, el build falla (assertServiceSlugs).
// Al añadir un servicio: su MDX en los dos idiomas + una entrada aquí.
// Vive fuera de src/utils/services.ts para que astro.config.mjs (sitemap) pueda importarlo.
export const SERVICE_SLUGS: Record<string, Record<Lang, string>> = {
  neonatal: { ca: 'logopeda-neonatal-valencia', es: 'logopeda-neonatal-valencia' },
  lactancia: { ca: 'assessora-lactancia-valencia', es: 'asesora-lactancia-valencia' },
  miofuncional: { ca: 'terapia-miofuncional-infantil-valencia', es: 'terapia-miofuncional-infantil-valencia' },
  lenguaje: { ca: 'logopeda-infantil-llenguatge-valencia', es: 'logopeda-infantil-lenguaje-valencia' },
  domicilio: { ca: 'logopeda-a-domicili-valencia', es: 'logopeda-a-domicilio-valencia' },
}

export const SERVICE_KEYS = ['neonatal', 'lactancia', 'miofuncional', 'lenguaje', 'domicilio'] as const
