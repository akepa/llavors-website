// Categorías del blog. Las usan el esquema del blog, el relatedCategory de los
// servicios (src/content.config.ts) y los filtros y rutas de categoría.
export const BLOG_CATEGORIES = ['funcions-orals', 'lactancia-alimentacio', 'comunicacio-llenguatge'] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
