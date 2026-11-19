import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { BLOG_CATEGORIES } from './data/blog-categories'

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/data/blog' }),
  schema: ({ image }) => z.object({
    translationKey: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    excerpt: z.string(),
    category: z.enum(BLOG_CATEGORIES),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: image().optional(),
    heroImageAlt: z.string(),
    draft: z.boolean().default(false),
    readingTime: z.number().int().positive(),
  }),
})

// Páginas de servicio: src/data/services/{ca,es}/<archivo>.mdx.
// El id conserva la carpeta del idioma ('ca/logopeda-neonatal'): el slug puede
// coincidir en los dos idiomas y el id por defecto del glob saldría del slug.
const services = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/data/services',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    translationKey: z.enum(['neonatal', 'lactancia', 'miofuncional', 'lenguaje', 'domicilio']),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    description: z.string().min(1),
    h1: z.string().min(1),
    priceFrom: z.number().positive().optional(),
    modalities: z.array(z.enum(['domicilio', 'consulta', 'online'])).min(1),
    faqs: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(3),
    relatedCategory: z.enum(BLOG_CATEGORIES),
  }),
})

export const collections = { blog, services }
