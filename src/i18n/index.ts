import ca from './ca'
import es from './es'

export type Lang = 'ca' | 'es'
export type Translations = typeof ca

const translations = { ca, es } as const

export function getTranslations(lang: Lang): Translations {
  return translations[lang]
}
