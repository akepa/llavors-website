// Única fuente de los datos del negocio: pie, páginas legales y JSON-LD leen de aquí.
// Ningún componente debe repetir dirección, teléfono, email u horario.

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'

const SITE = 'https://www.llavorslogopedia.com'
const LOCALITY = 'València'
const DOCTORALIA = 'https://www.doctoralia.es/angela-alonso-millet/logopeda/valencia'

export const business = {
  id: `${SITE}/#negocio`,
  personId: `${SITE}/#angela`,
  url: SITE,
  name: 'Llavors Logopèdia',
  alternateName: 'Llavors Logopèdia · Àngela Alonso Millet',
  phone: '+34614337743',
  email: 'info@llavorslogopedia.com',
  /** Localidad del titular; se muestra aunque address sea null (LSSICE art. 10). */
  locality: LOCALITY,
  address: {
    street: 'Calle Chile, 4',
    postalCode: '46021',
    locality: LOCALITY,
    country: 'ES',
  } as { street: string; postalCode: string; locality: 'València'; country: 'ES' } | null,
  geo: null as { lat: number; lng: number } | null,
  hours: [
    { day: 'Monday', opens: '11:00', closes: '19:00' },
    { day: 'Tuesday', opens: '11:00', closes: '14:00' },
    { day: 'Wednesday', opens: '09:30', closes: '14:00' },
    { day: 'Thursday', opens: '11:00', closes: '19:30' },
    { day: 'Friday', opens: '09:30', closes: '14:00' },
  ] as { day: Weekday; opens: string; closes: string }[],
  areaServed: ['València', "L'Horta"],
  sameAs: [DOCTORALIA, 'https://www.instagram.com/llavors.de.llet'],
  colegiada: '46666',
  person: {
    name: 'Àngela Alonso Millet',
    jobTitle: 'Logopeda',
    /** Perfiles de la persona (no los del negocio, como su Instagram). */
    sameAs: [DOCTORALIA],
    knowsAbout: [
      'Logopedia neonatal',
      'Lactancia materna',
      'Alimentación complementaria',
      'Anquiloglosia',
      'Terapia miofuncional',
      'Desarrollo del lenguaje',
    ],
  },
} as const

/** «Calle Chile, 4 · 46021 València» */
export function formatAddress(a: NonNullable<typeof business.address>): string {
  return `${a.street} · ${a.postalCode} ${a.locality}`
}

/** Domicilio para las páginas legales: dirección completa o, si no hay, la localidad. */
export const legalAddress = business.address ? formatAddress(business.address) : business.locality

/** '+34614337743' → '614 33 77 43' */
export const phoneDisplay = business.phone.replace(/^\+34/, '').replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')

/** Enlace de WhatsApp al teléfono del negocio. */
export const whatsappUrl = `https://wa.me/${business.phone.replace(/^\+/, '')}`

/** Perfil de Instagram (de sameAs) y su @usuario. */
export const instagramUrl = business.sameAs.find((u) => u.includes('instagram.com'))!
export const instagramHandle = `@${instagramUrl.replace(/\/+$/, '').split('/').pop()}`

/** '09:30' → '9:30' (formato visible del horario). */
export function formatTime(time: string): string {
  return time.replace(/^0/, '')
}
