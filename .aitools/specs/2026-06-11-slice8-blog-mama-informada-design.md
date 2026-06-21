# Slice 8 — Blog "Mamà Informada" — Diseño

> Estado: borrador para revisión
> Autor: Claude + Adam, sesión 2026-06-11
> Predecesor: `src/pages/blog.astro` actual (placeholder con "Pròximament")

---

## 1. Contexto y objetivo

La web actual tiene una sección de blog ("Mamà Informada" en VAL, "Mamá Informada" en ES) accesible desde el header, pero el contenido es un único placeholder que dice "Pròximament". Este slice convierte el placeholder en un blog editorial real, con artículos divulgativos para familias.

**Objetivo principal:** publicar contenido editorial bilingüe (VAL + ES) que aporte valor a las familias.

**Objetivo secundario (igualmente importante):** mejorar el posicionamiento orgánico de `llavorslogopedia.com` en buscadores. El SEO técnico es prioridad de diseño, no añadido al final.

**Estrategia:** entrega incremental en 5 sub-slices (8.0 → 8.4), de modo que el blog quede "pulido" antes de que Àngela empiece a publicar contenido real con frecuencia.

---

## 2. Decisiones de producto

| Decisión | Elección |
|---|---|
| Idiomas | Bilingüe VAL + ES en paralelo. Cada artículo tiene dos versiones emparejadas. |
| Taxonomía | Solo categorías cerradas (3 categorías). Sin tags. |
| Autoría | Única (Àngela). No se modelan colaboradores. |
| Sistema de publicación | Estática (Markdown/MDX en repo) hasta el slice 8.4 opcional con CMS. |
| Frecuencia esperada | Baja (1-2 artículos/mes). Suficiente con paginación simple. |
| Comentarios | No. Fuera de scope. |
| Newsletter | No. Fuera de scope. |

**Categorías definidas (cerradas):**

| Clave interna | Valenciano (display) | Castellano (display) |
|---|---|---|
| `funcions-orals` | Funcions orals | Funciones orales |
| `lactancia-alimentacio` | Lactància i Alimentació | Lactancia y Alimentación |
| `comunicacio-llenguatge` | Desenvolupament de la comunicació i el llenguatge | Desarrollo de la comunicación y el lenguaje |

Slugs por idioma (para SEO local de cada idioma):

| Clave | Slug VAL | Slug ES |
|---|---|---|
| `funcions-orals` | `funcions-orals` | `funciones-orales` |
| `lactancia-alimentacio` | `lactancia-i-alimentacio` | `lactancia-y-alimentacion` |
| `comunicacio-llenguatge` | `comunicacio-i-llenguatge` | `comunicacion-y-lenguaje` |

**Features del MVP** (presentes desde el slice 8.2):

- Imagen destacada por artículo (con alt text obligatorio, optimizada con Astro Image). **Nota:** en 8.2 solo se implementó el `heroImageAlt`; el campo `heroImage` y la generación de imágenes son el Slice 8.4.
- Tiempo de lectura estimado (calculado automáticamente).
- Fecha de publicación + fecha de última actualización visibles.
- Artículos relacionados al final (3 de la misma categoría, ordenados por fecha).
- Excerpt manual escrito por Àngela en el frontmatter.
- Botones de compartir: WhatsApp, Facebook, copiar enlace.
- RSS feed por idioma.
- Paginación del listado (umbral 10 artículos/página) desde el día 1.

**Features fuera del MVP** (postpuestos):

- Buscador interno (8.2+ si surge necesidad).
- Sticky/destacado manual.
- Generación dinámica de OG image con Satori.
- Comentarios, newsletter, autoría múltiple.

---

## 3. Arquitectura técnica

### 3.1 Sistema de contenido: Astro Content Collections + MDX

Uso **Content Collections** (sistema nativo de Astro v6 para colecciones tipadas con Zod) y **MDX** como formato de archivo en lugar de Markdown puro. MDX cuesta cero (instalar `@astrojs/mdx`) y permite embeber componentes Astro dentro del cuerpo del artículo: `Callout`, `Figure` con caption, etc.

### 3.2 Estructura de carpetas

> **Nota:** la implementación real difiere del plan original: el schema está en `src/content.config.ts` (no `src/content/config.ts`) y los artículos en `src/data/blog/` (no `src/content/blog/`). El árbol siguiente refleja el estado real + las adiciones del Slice 8.4.

```
src/
  content.config.ts              ← schema tipado + enum de categorías (Slice 8.2)
  data/
    blog/
      _images/                   ← imágenes hero compartidas VAL/ES (Slice 8.4); `_` la excluye del loader
        <translationKey>.jpg
      ca/
        2026-MM-DD-titol-article.mdx
        ...
      es/
        2026-MM-DD-titulo-articulo.mdx
        ...
  components/
    blog/
      BlogCard.astro
      BlogGrid.astro
      BlogPagination.astro
      BlogCategoryFilter.astro
      BlogArticleHeader.astro
      BlogArticleMeta.astro
      BlogShareButtons.astro
      BlogRelated.astro
      BlogProse.astro
      mdx/
        Callout.astro
        Figure.astro
  layouts/
    BlogArticleLayout.astro      ← envuelve cabecera + cuerpo MDX + pie
  pages/
    blog/
      index.astro                ← listado VAL paginado
      [...page].astro            ← paginación VAL
      [slug].astro               ← artículo VAL
      categoria/
        [categoria]/
          [...page].astro        ← listado por categoría VAL
    es/blog/
      ... (mismo esquema)
    rss.xml.ts
    es/rss.xml.ts
  i18n/
    ca.ts                        ← claves nuevas: blog_listing_*, blog_category_*, blog_related_*, etc.
    es.ts
.aitools/
  blog-drafts/                   ← borradores en .md plano (Slice 8.0)
pipeline/                        ← procesos de GENERACIÓN de contenido (raíz del repo)
  README.md                      ← visión global del pipeline
  articles/                      ← proceso de texto (Slice 8.3, pendiente)
    README.md                    ← documentación de proceso editorial
    blog-article-template.mdx    ← plantilla de frontmatter
  blog-image/                    ← proceso de imagen (Slice 8.4)
    SKILL.md                     ← skill: genera el prompt de imagen desde el contenido
    master-prompt.md             ← restricciones fijas (guía de estilo)
    reference/
      style-ref.jpg              ← referencia de estilo (se adjunta SIEMPRE a Nano Banana)
      angela/                    ← fotos de referencia de Àngela (de espaldas/sin cara)
  scripts/
    list-missing-heroimages.mjs  ← (opcional) chequeo mecánico
.claude/
  skills/
    blog-image/SKILL.md          ← envoltorio fino → referencia pipeline/blog-image/
```

### 3.3 Modelo de datos (frontmatter por artículo)

```yaml
---
translationKey: dificultats-parla-3-anys   # compartido entre VAL y ES
title: "Dificultats de la parla als 3 anys"
slug: dificultats-de-la-parla-als-3-anys   # específico del idioma
description: "Quan preocupar-se i quan no..."
category: comunicacio-llenguatge           # enum cerrado
publishedAt: 2026-06-15
updatedAt: 2026-06-20                      # opcional
heroImage: ../_images/dificultats-parla-3-anys.jpg  # opcional (Slice 8.4); compartida VAL/ES por translationKey
heroImageAlt: "Xiquet en sessió de logopèdia"
draft: false
---
```

**Reglas:**

- `translationKey` es la clave de emparejamiento entre la versión VAL y la versión ES. Tipo `string`, obligatoria. Debe ser **idéntica** en los dos archivos (VAL y ES) del mismo artículo, y **distinta** entre artículos diferentes. Convención: se escribe en valenciano y sin acentos (estable, no destinada a URL). Si una versión no existe todavía, el otro idioma se publica igualmente y el selector de idioma hace fallback al listado.
- `slug` es por idioma (mejor SEO).
- `category` es enum cerrado validado por Zod contra las tres claves definidas.
- `draft: true` excluye el artículo de listados, sitemap y RSS pero permite previsualizarlo en local.

### 3.4 Routing

Astro genera estáticamente con `getStaticPaths` desde la colección:

| Ruta | Propósito |
|---|---|
| `/blog/` | Listado VAL, página 1 |
| `/blog/2/`, `/blog/3/`, ... | Paginación VAL |
| `/blog/[slug]/` | Artículo VAL |
| `/blog/categoria/[categoria]/` | Listado por categoría VAL |
| `/blog/categoria/[categoria]/2/` | Paginación de categoría VAL |
| `/es/blog/...` | Equivalentes ES |
| `/rss.xml`, `/es/rss.xml` | Feeds RSS |

---

## 4. Componentes Astro

### 4.1 Layout

- **`BlogArticleLayout.astro`** — Hereda de `BaseLayout`. Estructura: `<BlogArticleHeader>` + slot con el cuerpo MDX envuelto en `<BlogProse>` + `<BlogShareButtons>` + `<BlogRelated>`. Inyecta `<SchemaOrg type="Article">` y `<SchemaOrg type="BreadcrumbList">` en el head vía slot nombrado.

### 4.2 Componentes del listado

- **`BlogCard.astro`** — Tarjeta de artículo en listado: imagen destacada (con `loading="lazy"` excepto la primera), categoría como etiqueta, título, excerpt, meta (fecha + tiempo de lectura). Reutiliza el lenguaje visual de las tarjetas de servicios (mismo radio, sombra, padding, hover).
- **`BlogGrid.astro`** — Grid responsive de `BlogCard`. 1 columna en móvil, 2 en `md`, 3 en `lg`.
- **`BlogPagination.astro`** — Navegación entre páginas. Solo se renderiza si total páginas > 1.
- **`BlogCategoryFilter.astro`** — Chips de categorías arriba del listado. La activa se marca visualmente.

### 4.3 Componentes del artículo

- **`BlogArticleHeader.astro`** — Bloque superior: etiqueta de categoría → título h1 → meta → imagen destacada full-width. Reutiliza la estética del Hero pero adaptada a contenido editorial.
- **`BlogArticleMeta.astro`** — Línea de metadatos: fecha de publicación + "actualizado el ..." si difiere + tiempo de lectura + autora (Àngela).
- **`BlogShareButtons.astro`** — Botones: WhatsApp (`https://wa.me/?text=...`), Facebook (`https://www.facebook.com/sharer/sharer.php?u=...`), copiar enlace (JS mínimo, sin librerías).
- **`BlogRelated.astro`** — Bloque "Articles relacionats" / "Artículos relacionados": 3 últimos artículos de la misma categoría, excluyendo el actual. Si hay menos de 3 en la categoría, completa con los más recientes globales.
- **`BlogProse.astro`** — Wrapper de estilos tipográficos del cuerpo. Define `h2, h3, h4, p, ul, ol, li, blockquote, code, a, strong, em, hr, img` con paleta y tipografías existentes. Asegura jerarquía visual coherente con las páginas legales actuales.

### 4.4 Componentes MDX (disponibles dentro de los `.mdx` sin importar)

- **`Callout.astro`** — Caja destacada. Variantes: `info`, `attention`, `tip`. Estilo coherente con el banner de cookies.
- **`Figure.astro`** — Imagen con caption y alt obligatorio. Usa Astro Image para optimización.

Registrados globalmente vía `mdx.components` en `astro.config.mjs`.

---

## 5. Requisitos no funcionales

### 5.1 Cohesión visual con el resto de la web

- Mismo `BaseLayout` (mismo `<head>`, banner de cookies, botón WhatsApp flotante, `Header`, `Footer`).
- Mismas variables CSS globales (paleta `--pink`, `--text`, `--text-soft`, tipografías Playfair Display + Nunito).
- Botones, etiquetas de sección, radios y sombras siguen los estilos existentes en `Hero`, `Services`, `About`.
- `BlogProse` usa la jerarquía tipográfica de las páginas legales actuales (privacidad, aviso legal), que ya tienen un patrón consolidado para contenido largo.
- No se introduce paleta nueva ni tipografía nueva.

### 5.2 Persistencia del idioma seleccionado

Regla literal: **el idioma seleccionado por el usuario nunca debe perderse al navegar dentro del blog.**

- Cualquier enlace interno generado dentro de una página `/blog/...` (VAL) apunta a otra ruta VAL.
- Lo mismo para `/es/blog/...`.
- El selector de idioma del header, cuando estás en un artículo, salta al artículo equivalente en el otro idioma usando `translationKey`. Si no existe traducción, fallback al **listado** del otro idioma (no a la home), para no romper el contexto "estoy en el blog".
- Las URLs de categoría también respetan idioma.
- El RSS también es por idioma: `/rss.xml` solo contiene artículos VAL, `/es/rss.xml` solo ES.
- El auto-descubrimiento de RSS (`<link rel="alternate">`) en el `<head>` apunta solo al feed del idioma actual.

### 5.3 Compatibilidad con `base: '/llavors-website'` y migración futura

Mientras la web vive en GitHub Pages con `base: '/llavors-website'`, todas las URLs canónicas, OG, schema y hreflang se construyen a partir de `Astro.site + Astro.url.pathname` para que sean absolutas y correctas en ambos entornos. El día que se quite la base (Slice 6b), no hay que tocar nada del blog.

---

## 6. SEO técnico

### 6.1 Schema.org

**`Article` JSON-LD** en cada artículo, con `headline`, `description`, `image` (URL absoluta), `datePublished`, `dateModified`, `author` (Àngela), `publisher` (Llavors Logopèdia), `mainEntityOfPage`, `inLanguage` (`ca-ES-valencia` o `es-ES`), `articleSection` (nombre de categoría en el idioma del artículo).

**`BreadcrumbList` JSON-LD** en cada artículo y página de categoría:

- En artículo: `Inicio › Mamà Informada › <Categoría> › <Título>`
- En página de categoría: `Inicio › Mamà Informada › <Categoría>`

El componente `SchemaOrg.astro` ya existe en el proyecto; se extiende con variantes nuevas, no se duplica.

### 6.2 hreflang

En `<head>` de cada artículo, listado y página de categoría:

```html
<link rel="alternate" hreflang="ca-valencia" href="<URL absoluta VAL>" />
<link rel="alternate" hreflang="es" href="<URL absoluta ES>" />
<link rel="alternate" hreflang="x-default" href="<URL absoluta VAL>" />
```

El emparejamiento de artículos es por `translationKey`. Si no existe pareja, **se omiten las líneas de la alternativa inexistente** (mejor omitir que apuntar a 404).

### 6.3 Open Graph + Twitter Card

Extensión de `SEO.astro` con campos adicionales:

```html
<meta property="og:type" content="article" />
<meta property="article:published_time" content="<ISO>" />
<meta property="article:modified_time" content="<ISO>" />
<meta property="article:section" content="<categoría>" />
<meta property="article:author" content="Àngela Alonso Millet" />
<meta property="og:image" content="<URL absoluta heroImage>" />
<meta property="og:locale" content="ca_ES | es_ES" />
<meta property="og:locale:alternate" content="<el otro>" />
```

**OG image = imagen destacada del artículo.** No se generan OG images dinámicas con Satori en esta fase. Si Search Console muestra problemas más adelante, se reabre la decisión.

### 6.4 Canonical

Cada artículo y listado emite `<link rel="canonical">` con URL absoluta a sí mismo. La paginación: la página 1 (`/blog/`) tiene canonical a sí misma; las siguientes (`/blog/2/`...) apuntan a sí mismas también, no a la página 1 (esto es lo recomendado por Google actualmente; cada página paginada es un recurso distinto).

### 6.5 Sitemap

`@astrojs/sitemap` ya está instalado. Configuración:

- Los artículos aparecen automáticamente (rutas estáticas detectadas por Astro).
- Los artículos `draft: true` se filtran (`filter` en la integración).
- El sitemap declara `alternates` por idioma usando la opción `i18n` de la integración.

### 6.6 RSS

`@astrojs/rss` genera `/rss.xml` (VAL) y `/es/rss.xml` (ES). Cada feed:

- Title, description y link al listado del blog en ese idioma.
- Los últimos **20 artículos** (no todos) para mantener el archivo ligero.
- `<content:encoded>` con el HTML del artículo completo (renderizado desde MDX).
- Auto-descubrimiento: `<link rel="alternate" type="application/rss+xml">` en el `<head>` de las páginas del idioma correspondiente.

### 6.7 robots.txt

Ya existe. No requiere cambios. Verificar que `Disallow:` no bloquea nada del blog y que `Sitemap:` apunta al `sitemap-index.xml` correcto.

---

## 7. Troceado por slices

### Slice 8.0 — Redacción de artículos de prueba

**Objetivo:** Tener 2-3 artículos completos en VAL + ES listos para usar como contenido real en el Slice 8.1.

**Tareas:**

- Elegir un tema por categoría (uno por cada eje editorial). Propuestas iniciales:
  - `funcions-orals` — *"Per què el meu fill bava? Quan és normal i quan no"*
  - `lactancia-alimentacio` — *"Introducció de sòlids: senyals que el teu nadó està preparat"*
  - `comunicacio-llenguatge` — *"El meu fill té 2 anys i parla poc: ha de preocupar-me?"*
- Redactar cada artículo (~600-900 palabras), en valenciano primero y traducción a castellano.
- Cada artículo contiene: al menos un `<h2>`, alguna lista (`<ul>` u `<ol>`), una cita destacada o callout, y una imagen referenciada (alt text incluido) — como banco de pruebas tipográfico.
- Excerpt manual (1-2 frases) en ambos idiomas.
- Sugerir alt text descriptivo y una idea de imagen destacada (no se generan imágenes; Àngela las aporta o se usan placeholders de stock libre de derechos).
- Guardar los borradores en `.aitools/blog-drafts/` como `.md` plano (no MDX todavía).

**Importante — validación de contenido:**

Los textos redactados por Claude son borradores de divulgación, **no contenido clínico**. Àngela debe revisar y aprobar cada artículo antes de que se use como contenido público. Puede editar, reescribir, descartar o proponer otros temas. **El contenido publicado siempre pasa por validación profesional de Àngela.**

**Qué NO se hace:** Nada de código. Sin tocar `src/`.

**Validación:** Àngela ha leído los 3 borradores y los aprueba (o pide cambios) en VAL y ES.

---

### Slice 8.1 — Validación visual con artículos hardcoded

**Objetivo:** Iterar el diseño visual sobre contenido real antes de comprometernos con Content Collections.

**Tareas:**

- Crear `BlogCard.astro`, `BlogGrid.astro`, `BlogArticleHeader.astro`, `BlogArticleMeta.astro`, `BlogProse.astro` con datos hardcoded (extraídos de los borradores aprobados en el Slice 8.0).
- Reemplazar `src/pages/blog.astro` y `src/pages/es/blog.astro` por un listado real con 2-3 tarjetas hardcoded en el propio `.astro`.
- Crear 2-3 páginas de artículo hardcoded como `.astro` puros (no MDX aún): `src/pages/blog/<slug>.astro` y `src/pages/es/blog/<slug>.astro`. Texto, imágenes y todo embebido.
- Aplicar paleta, tipografía y patrones visuales existentes (cohesión).
- Selector de idioma y enlaces respetan persistencia de idioma.

**Qué NO se hace:** Content Collections, frontmatter, categorías reales, SEO técnico avanzado, RSS, paginación, compartir, relacionados.

**Validación:** Àngela ve el blog en local/preview, da feedback de diseño. Iteramos hasta visto bueno.

---

### Slice 8.2 — Arquitectura completa + features MVP

**Objetivo:** Convertir el blog en sistema real con todas las funcionalidades del MVP "pulido".

**Tareas:**

- Instalar `@astrojs/mdx`, `@astrojs/rss`.
- Crear `src/content/config.ts` con colección `blog` tipada (schema Zod) y enum de categorías.
- Migrar los 2-3 artículos del Slice 8.1 a `.mdx` con frontmatter completo.
- Crear rutas dinámicas (`[slug].astro`, `[...page].astro`, `categoria/[categoria]/[...page].astro`) en ambos idiomas.
- Implementar paginación (10/página), relacionados, compartir, tiempo de lectura, fechas, excerpt.
- SEO técnico completo: Schema Article + BreadcrumbList, hreflang, OG por artículo, canonical, sitemap con alternates, RSS por idioma.
- Selector de idioma con lógica de `translationKey` y fallback al listado.
- Añadir componentes MDX (`Callout`, `Figure`) y registrarlos globalmente.
- Apuntar `nav_blog` del header al nuevo listado real (eliminando el placeholder).
- Añadir nuevas claves i18n: `blog_listing_*`, `blog_category_*`, `blog_related_*`, `blog_share_*`, `blog_reading_time_*`, etc.

**Qué NO se hace:** Buscador interno, sticky post, CMS.

**Validación:**

- Lighthouse SEO ≥ 95 en artículo y listado.
- Schema válido en [validador de Google](https://search.google.com/test/rich-results).
- hreflang sin errores cuando se valide en Search Console.
- RSS valida en [validador W3C](https://validator.w3.org/feed/).
- Los 2-3 artículos son navegables end-to-end en VAL y ES.
- Selector de idioma cambia correctamente entre artículos emparejados; fallback al listado funciona si no hay pareja.

---

### Slice 8.3 — Operativa editorial estable

> **Estado: PENDIENTE (no implementado).** El slice 8.2 (arquitectura) está en `master`, pero el 8.3 todavía no: no existen `pipeline/articles/` ni la plantilla de frontmatter. Queda como trabajo independiente.

**Objetivo:** Definir el proceso "Àngela me pasa un artículo → yo lo publico" sin código nuevo del blog.

**Tareas:**

- Documentar en `pipeline/articles/README.md` (proceso de **texto**): formato esperado del texto de Àngela, dónde poner imágenes, naming de slugs, checklist SEO por artículo (description, alt, categoría, fecha).
- Plantilla de frontmatter en `pipeline/articles/blog-article-template.mdx`.
- Subir los primeros artículos reales que Àngela vaya pasando.
- Ajustes que aparezcan al usar el sistema con contenido real (refinamientos puntuales, no features nuevas).

**Qué NO se hace:** CMS. Imágenes (eso es el Slice 8.4).

**Validación:** Àngela pasa un artículo nuevo, se publica en menos de 30 minutos sin tocar arquitectura.

> **Nota sobre `pipeline/`:** todo lo relativo a *generar* contenido (texto e imágenes) vive bajo la carpeta nueva `pipeline/` en la raíz del repo. El proceso de texto (este slice) en `pipeline/articles/`; el de imágenes (Slice 8.4) en `pipeline/blog-image/`. Ver §3.2.

---

### Slice 8.4 — Imatges dels articles

**Objetivo:** Sustituir los placeholders de gradiente por imágenes reales generadas de forma **semiautomática a partir del contenido** de cada artículo, con un estilo coherente y sin aspecto de IA.

**Estado de partida:**

- El schema (`src/content.config.ts`) tiene `heroImageAlt` (texto alternativo) pero **no** `heroImage` (el archivo). Hay que añadirlo.
- `BlogCard` y `BlogArticleHeader` pintan el gradiente CSS como placeholder. Ningún artículo tiene imagen real.
- No hay imagen de referencia de estilo previa. **La primera imagen aprobada hará de referencia** para las siguientes (ver "bootstrap" más abajo).

**Decisión de herramienta (importante):**

- Tenemos acceso a **Nano Banana PRO**, pero **NO en modo API** → la generación es **manual** en su interfaz web.
- **Ningún modelo de Anthropic genera imágenes.** Claude solo tiene *visión* (analizar imágenes), no generación. No existe endpoint de generación de imágenes en la API de Anthropic ni bajo la licencia de Claude Code.
- Por tanto el flujo es: **Claude redacta el prompt → el humano genera en Nano Banana PRO → Claude integra la imagen en el repo.**

#### Concepto visual (guía de estilo)

Fotografía editorial cálida de tipo *still-life* / lifestyle doméstico, **casi siempre sin personas**. Reglas duras (van codificadas en el prompt maestro):

- **Horizontal** (apaisada), ~16:9 o más ancha (el hero usa `21/8`, la card `16/9`).
- Paleta afín al sitio: rosa/crema/madera clara, luz suave y natural.
- **Nunca** entorno médico/clínico; **nunca** bata ni material sanitario.
- **Sin caras, sin niños, sin otras personas** de fondo.
- Por defecto **sin personas**: objetos y escenas domésticas cotidianas relacionadas con el tema del artículo.
- **Excepción rara** (solo si el contenido lo exige de verdad): una figura **de espaldas / sin cara visible**, ropa de calle, con los rasgos de Àngela aportados vía foto de referencia en Nano Banana.

#### El pipeline (carpeta `pipeline/`)

Todo lo relativo a generar imágenes vive bajo `pipeline/blog-image/`. Flujo en 3 pasos:

1. **Claude genera el prompt.** Se invoca la skill (ver abajo) indicando el artículo. La skill lee el `.mdx`, identifica categoría y tema, y compone el prompt final = **prompt maestro** (restricciones fijas) + **escena específica** derivada del contenido.
2. **El humano genera en Nano Banana PRO.** Pega el prompt y adjunta lo indicado (ver "Qué adjuntar"). Genera y descarga la imagen.
3. **Claude integra.** Coloca la imagen con el naming correcto en `src/data/blog/_images/<translationKey>.<ext>`, añade `heroImage` al frontmatter de ambas versiones (VAL y ES) y verifica el render.

**Estructura de archivos:**

```
pipeline/
  README.md                       ← visión global del pipeline (artículos + imágenes)
  articles/                       ← proceso de texto (Slice 8.3, pendiente)
    README.md
    blog-article-template.mdx
  blog-image/
    SKILL.md                      ← la skill: cómo generar el prompt de imagen
    master-prompt.md              ← bloque fijo de restricciones (guía de estilo)
    reference/
      style-ref.jpg               ← referencia de estilo (se adjunta SIEMPRE)
      angela/                     ← fotos de referencia de Àngela (de espaldas/sin cara)
  scripts/
    list-missing-heroimages.mjs   ← (opcional) chequeo mecánico de qué artículos faltan
```

Para que Claude Code la descubra como skill invocable (p. ej. `/blog-image`), el `SKILL.md` se registra bajo `.claude/skills/blog-image/` como un envoltorio fino que referencia `pipeline/blog-image/`. La fuente de verdad del contenido sigue en `pipeline/`.

#### ¿Skill o script?

**Skill**, no script de Node, para la generación del prompt. La tarea central —leer el artículo e inventar una escena apropiada que cumpla las restricciones— requiere *comprensión* del contenido, no plantillas. Un script determinista solo puede rellenar huecos con palabras clave de categoría; no puede derivar una escena concreta del texto. Una skill además **es** un `.md` (`SKILL.md`). El script de Node queda **opcional y secundario**, solo para tareas mecánicas (listar artículos sin `heroImage`).

#### Qué adjuntar a Nano Banana PRO

Para cada imagen, en su interfaz web:

1. **El texto del prompt** generado por la skill (se pega en el campo de prompt).
2. **`reference/style-ref.jpg`** — imagen de referencia de estilo. Se adjunta **siempre** (salvo la primera vez, ver bootstrap), para que todas las portadas tengan coherencia visual entre sí (misma temperatura de color, mismo *mood*, misma "familia" estética).
3. **Solo en el caso raro de figura:** 1-2 fotos de `reference/angela/` (de espaldas / sin cara) para que la silueta y los rasgos coincidan con Àngela.

> El prompt maestro debe pedir explícitamente formato **horizontal** y, cuando se adjunte `style-ref.jpg`, indicar a Nano Banana que **imite el estilo/iluminación** de la referencia pero **no su contenido** concreto.

**Bootstrap del estilo (primera imagen):** no existe `style-ref.jpg` de partida. La primera imagen se genera solo con el prompt (paso 2 sin referencia de estilo); el prompt maestro debe describir el *look* deseado con suficiente detalle (paleta rosa/crema/madera, luz suave, editorial). Una vez Àngela aprueba esa primera imagen, **se guarda una copia como `reference/style-ref.jpg`** y, a partir de ahí, se adjunta a todas las generaciones siguientes para fijar la coherencia. Si en algún momento el estilo deriva, se puede re-elegir la `style-ref`.

#### Infraestructura de código

- **Schema:** añadir `heroImage: image().optional()` (helper `image()` de `astro:content`) a `src/content.config.ts`. **Opcional** → las imágenes entran de forma incremental sin romper artículos sin imagen.
- **Imagen compartida VAL/ES:** una sola imagen por `translationKey` en `src/data/blog/_images/<translationKey>.<ext>` (el prefijo `_` la excluye del loader `glob` `**/[^_]*.{md,mdx}`). Ambas versiones la referencian por ruta relativa.
- **Render con fallback:** `BlogCard` y `BlogArticleHeader` → si hay `heroImage`, render con `<Image>` de Astro (optimizada, responsive, `loading="lazy"` salvo la primera); **si no, mantienen el gradiente actual**.
- **SEO:** cuando exista `heroImage`, `og:image` y el `ImageObject` del JSON-LD (`SchemaArticle.astro`) deben apuntar a la URL absoluta de la imagen real en lugar del placeholder/genérico.

#### Requisito previo

Para el caso excepcional de figura: Àngela aporta **2-3 fotos de referencia suyas de espaldas / sin cara visible**, que se guardan en `pipeline/blog-image/reference/angela/`. Mientras no existan, el pipeline funciona igual (genera escenas sin personas).

**Qué NO se hace:** Generación vía API (no disponible). OG images dinámicas con Satori (sigue fuera de scope). Imágenes con personas identificables.

**Validación:**

- Una imagen de prueba por categoría, generada con el pipeline e integrada end-to-end, visible en card y en hero, en VAL y ES.
- El fallback al gradiente sigue funcionando en artículos sin imagen.
- `og:image` correcto en el artículo con imagen (validador de Google / preview de WhatsApp).
- Coherencia visual entre las imágenes generadas (gracias a `style-ref.jpg`).

---

### Slice 8.5 — Decap CMS (opcional, último)

**Objetivo:** Àngela edita y publica sola desde un panel web.

**Tareas:**

- Instalar Decap CMS en `/public/admin/`.
- `config.yml` con la misma estructura de la colección y categorías.
- Habilitar Git Gateway o equivalente para que Decap pueda commitear al repo.
- Documentación para Àngela: cómo entrar al panel, cómo crear/editar/publicar un artículo, cómo subir imágenes.

**Validación:** Àngela publica un artículo desde `/admin/` sin ayuda técnica.

**Nota:** Este slice es **opcional**. Si la fase 8.3 funciona bien con baja frecuencia de publicación, puede no implementarse nunca. Es decisión a tomar más adelante en función de la realidad de uso.

---

## 8. Decisiones explícitas y trade-offs

- **MDX en lugar de Markdown puro:** abre la puerta a componentes embebidos (`Callout`, `Figure`) sin coste extra. Decisión tomada porque divulgación profesional se beneficia de cajas destacadas e imágenes con caption.
- **Slugs por idioma en lugar de compartidos:** mejor SEO (slug en castellano para audiencia castellana, slug en valenciano para audiencia valenciana). Coste: necesidad del campo `translationKey` para emparejar versiones.
- **Categorías como enum cerrado en lugar de colección separada:** simplicidad y menos decisiones por artículo. Coste: si en el futuro se quieren páginas de categoría con descripción rica, hay que migrar. Aceptado.
- **OG image = imagen destacada del artículo:** simple y suficiente para empezar. No se invierte en generación dinámica con Satori hasta que haya evidencia de necesidad.
- **Paginación desde el día 1 con umbral 10:** evita rehacer arquitectura cuando crezca el archivo. Coste mínimo.
- **Sin búsqueda interna en MVP:** baja frecuencia esperada y baja masa crítica de artículos al principio. Se reabre si llega a >30 artículos por idioma.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Contenido escrito por Claude se publica sin revisar | El Slice 8.0 lo prohibe explícitamente: Àngela debe validar todo antes de publicar. |
| Artículos publicados solo en un idioma rompen hreflang | El diseño contempla omisión condicional de hreflang cuando no hay pareja. |
| `base: '/llavors-website'` desaparece (Slice 6b) y rompe URLs absolutas del blog | Todas las URLs se construyen con `Astro.site + Astro.url.pathname`. Inmune a cambios de base. |
| Decap CMS añade complejidad innecesaria si Àngela publica poco | El Slice 8.4 es opcional y se evalúa caso por caso. |
| Cambios de diseño tras migrar a Content Collections | El Slice 8.1 valida diseño antes; el 8.2 solo migra la estructura, no rediseña. |

---

## 10. Validación de lanzamiento

Antes de cerrar el Slice 8.2 y considerar el blog "vivo":

- [ ] Las 3 categorías muestran sus páginas correctamente en VAL y ES.
- [ ] Cambio de idioma desde un artículo lleva al artículo emparejado o al listado del otro idioma si no hay pareja.
- [ ] Los 2-3 artículos del Slice 8.0 están publicados en `.mdx` con frontmatter válido.
- [ ] Lighthouse SEO ≥ 95 en artículo y listado.
- [ ] Schema Article + BreadcrumbList validan en validador de Google.
- [ ] hreflang correcto en los 3 artículos.
- [ ] OG images se previsualizan correctamente en WhatsApp y Facebook.
- [ ] Sitemap incluye los artículos con alternates de idioma.
- [ ] RSS válido en validador W3C, con `content:encoded` poblado.
- [ ] El enlace `nav_blog` del header apunta al listado real (placeholder eliminado).
- [ ] Botón WhatsApp flotante y banner de cookies siguen funcionando en las páginas del blog.

---

## 11. Notas para implementación

- Cada slice tiene su propia rama: `slice/8.0-blog-drafts`, `slice/8.1-blog-visual`, `slice/8.2-blog-arch`, etc.
- PR a `develop` al terminar cada slice. Merge a `master` solo cuando esté validado.
- Para Àngela: los textos en valenciano siguen la **variedad valenciana** (no el catalán central). Ya marcado en `CLAUDE.md`.
- Idioma del selector de idioma: ya está marcado como "VAL" en el botón existente; el blog mantiene esta convención.
