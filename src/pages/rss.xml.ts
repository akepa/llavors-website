import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const allEntries = await getCollection('blog')
  const caEntries = allEntries
    .filter((e) => e.filePath?.includes('/blog/ca/') && !e.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .slice(0, 20)

  return rss({
    title: 'Mamà Informada · Llavors Logopèdia',
    description:
      'Articles de divulgació sobre logopèdia, lactància i desenvolupament per a famílies.',
    site: context.site!,
    items: caEntries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: `/blog/${entry.data.slug}/`,
      content: entry.body,
    })),
    customData: '<language>ca</language>',
  })
}
