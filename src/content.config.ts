import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    translationKey: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    excerpt: z.string(),
    category: z.enum(['funcions-orals', 'lactancia-alimentacio', 'comunicacio-llenguatge']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImageAlt: z.string(),
    draft: z.boolean().default(false),
    readingTime: z.number().int().positive(),
  }),
})

export const collections = { blog }
