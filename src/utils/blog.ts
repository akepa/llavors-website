import type { CollectionEntry } from 'astro:content'
import type { Lang, Translations } from '../i18n/index'

export type BlogEntry = CollectionEntry<'blog'>

export const CATEGORY_LABELS_KEY = {
  'funcions-orals': 'blog_cat_funcions_orals',
  'lactancia-alimentacio': 'blog_cat_lactancia',
  'comunicacio-llenguatge': 'blog_cat_comunicacio',
} as const

export const CATEGORIES = [
  { key: 'funcions-orals' as const },
  { key: 'lactancia-alimentacio' as const },
  { key: 'comunicacio-llenguatge' as const },
]

export function getCategoryLabel(category: string, t: Translations): string {
  const key = CATEGORY_LABELS_KEY[category as keyof typeof CATEGORY_LABELS_KEY]
  return t[key] ?? category
}

export function getCategorySlug(category: string): string {
  return category
}

export function getCategoryKey(slug: string): string {
  return slug
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'ca' ? 'ca-ES' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function isLang(entry: BlogEntry, lang: Lang): boolean {
  return entry.filePath?.includes(`/blog/${lang === 'ca' ? 'ca' : 'es'}/`) ?? false
}

export function getRelatedEntries(
  allEntries: BlogEntry[],
  current: BlogEntry,
  count = 3,
): BlogEntry[] {
  const others = allEntries.filter(
    (e) => e.data.translationKey !== current.data.translationKey,
  )
  const sameCategory = others
    .filter((e) => e.data.category === current.data.category)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
  const different = others
    .filter((e) => !sameCategory.some((s) => s.data.translationKey === e.data.translationKey))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
  return [...sameCategory, ...different].slice(0, count)
}
