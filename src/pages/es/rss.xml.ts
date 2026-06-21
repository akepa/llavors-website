import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const allEntries = await getCollection('blog')
  const esEntries = allEntries
    .filter((e) => e.filePath?.includes('/blog/es/') && !e.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .slice(0, 20)

  return rss({
    title: 'Mamá Informada · Llavors Logopèdia',
    description:
      'Artículos de divulgación sobre logopedia, lactancia y desarrollo para familias.',
    site: context.site!,
    items: esEntries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: `/es/blog/${entry.data.slug}/`,
      content: entry.body,
    })),
    customData: '<language>es</language>',
  })
}
