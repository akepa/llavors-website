import type { Translations } from '../i18n/index'

// Modalidades de atención: las usan la sección Servicios de la home, las páginas
// de servicio y el esquema de la colección services (frontmatter `modalities`).
export const MODALITIES = ['domicilio', 'consulta', 'online'] as const

export type Modality = (typeof MODALITIES)[number]

/** Contenido del <svg viewBox="0 0 24 24"> de cada modalidad (trazo, sin relleno). */
export const MODALITY_ICONS: Record<Modality, string> = {
  domicilio: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  consulta: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  online: '<rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>',
}

/** Clave de traducción de la etiqueta de cada modalidad. */
export const MODALITY_LABEL_KEY = {
  domicilio: 'mod1',
  consulta: 'mod2',
  online: 'mod3',
} as const satisfies Record<Modality, keyof Translations>
