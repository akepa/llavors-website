import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { business, phoneDisplay, instagramUrl, doctoraliaUrl } from '../data/business'
import { SERVICE_KEYS, type ServiceKey } from '../data/service-slugs'
import { serviceAbsoluteUrl, serviceLang } from '../utils/services'
import { isLang } from '../utils/blog'
import type { Lang } from '../i18n/index'

// llms.txt (https://llmstxt.org): resumen del negocio para asistentes de IA.
// Los datos de contacto salen de business.ts y los enlaces, de las colecciones:
// al añadir un servicio o un artículo, aparece aquí sin tocar este archivo.

const LANG_LABEL: Record<Lang, string> = { es: 'castellano', ca: 'valencià' }
const link = (text: string, url: string) => `[${text}](${url})`

export const GET: APIRoute = async () => {
  const services = await getCollection('services')
  const serviceTitle = (key: ServiceKey, lang: Lang) => {
    const entry = services.find((s) => s.data.translationKey === key && serviceLang(s) === lang)
    if (!entry) throw new Error(`llms.txt: falta el MDX del servicio «${key}» (${lang})`)
    return entry.data.title
  }

  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
  const postsIn = (lang: Lang) => posts.filter((p) => isLang(p, lang))
  const postUrl = (slug: string, lang: Lang) => `${business.url}${lang === 'es' ? '/es' : ''}/blog/${slug}/`

  const { person, address } = business
  const presencial = address
    ? `Consulta presencial en ${address.locality} (${address.street} · ${address.postalCode}).`
    : `Consulta presencial en ${business.locality}.`

  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.name} es la consulta de ${person.name}, logopeda neonatal y asesora de lactancia en ${business.locality}. Ofrece logopedia neonatal, reeducación de las funciones orales y acompañamiento al desarrollo comunicativo y del lenguaje para bebés, niños de hasta 6 años y sus familias. La web está en valenciano y en castellano.`,
    '',
    '## Quién es',
    '',
    `- ${person.name}, logopeda colegiada n.º ${business.colegiada}, doble titulada en Logopedia y Magisterio (Educación Infantil).`,
    '- Especializada en disfagia neonatal, prematuridad, asesoría de lactancia y terapia miofuncional.',
    "- Desde 2019 forma parte de los equipos de Atención Temprana de la Conselleria d'Educació.",
    '',
    '## Servicios',
    '',
    ...SERVICE_KEYS.map((key) => `- ${link(serviceTitle(key, 'es'), serviceAbsoluteUrl(key, 'es'))}`),
    `- Versión en valenciano: ${SERVICE_KEYS.map((key) => link(serviceTitle(key, 'ca'), serviceAbsoluteUrl(key, 'ca'))).join(', ')}`,
    '',
    '## Zona y modalidades',
    '',
    `- Atención a domicilio en ${business.areaServed.join(' y ')}.`,
    `- ${presencial}`,
    '- Sesiones online. La primera consulta de valoración es online, dura 30 minutos y es sin compromiso.',
    '- Atención privada; no se trabaja con seguros médicos.',
    '',
    '## Contacto',
    '',
    `- Teléfono y WhatsApp: +34 ${phoneDisplay}`,
    `- Email: ${business.email}`,
    `- Instagram: ${instagramUrl}`,
    `- Doctoralia: ${doctoraliaUrl}`,
    '',
    '## Páginas principales',
    '',
    `- ${link(`Inicio (${LANG_LABEL.es})`, `${business.url}/es/`)}`,
    `- ${link(`Inici (${LANG_LABEL.ca})`, `${business.url}/`)}`,
    `- ${link(`Mamá Informada, blog (${LANG_LABEL.es})`, `${business.url}/es/blog/`)}`,
    `- ${link(`Mamà Informada, blog (${LANG_LABEL.ca})`, `${business.url}/blog/`)}`,
    '',
    '## Artículos del blog',
    '',
    ...postsIn('es').map((p) => `- ${link(p.data.title, postUrl(p.data.slug, 'es'))}`),
    `- Versión en valenciano: ${postsIn('ca').map((p) => link(p.data.title, postUrl(p.data.slug, 'ca'))).join(', ')}`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
