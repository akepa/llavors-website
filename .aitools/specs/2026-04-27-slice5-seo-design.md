# Slice 5 — SEO básico: Diseño

**Fecha:** 2026-04-27  
**Estado:** Aprobado

---

## Objetivo

La web es indexable por Google, se ve bien al compartir en redes sociales y tiene datos estructurados para búsqueda local. Se introduce soporte completo de hreflang para el sitio bilingüe (valenciano/español).

---

## Arquitectura

### Ficheros nuevos

| Fichero | Responsabilidad |
|---|---|
| `src/components/SEO.astro` | Todas las etiquetas `<head>` de SEO: title, description, OG, canonical, hreflang |
| `src/components/SchemaOrg.astro` | JSON-LD LocalBusiness (solo homepage ca y es) |
| `public/og-default.jpg` | Imagen OG por defecto (1200×630px, creación manual en Canva) |
| `public/robots.txt` | Directivas para crawlers + enlace al sitemap |

### Ficheros modificados

| Fichero | Cambio |
|---|---|
| `src/layouts/BaseLayout.astro` | Importa `SEO.astro`; añade props `description`, `ogImage`, `canonical` |
| `src/pages/index.astro` | Pasa props SEO + incluye `SchemaOrg.astro` |
| `src/pages/es/index.astro` | Pasa props SEO en español + incluye `SchemaOrg.astro` |
| `src/pages/privacidad.astro` y equivalentes | Añaden prop `description` |
| `src/pages/es/privacidad.astro` y equivalentes | Añaden prop `description` |
| `src/pages/aviso-legal.astro` y equivalentes | Añaden prop `description` |
| `src/pages/cookies.astro` y equivalentes | Añaden prop `description` |
| `astro.config.mjs` | `site` → `https://www.llavorslogopedia.com`; añade `@astrojs/sitemap` |

La página `/blog` se excluye del sitemap hasta que tenga contenido real.

---

## Componente `SEO.astro`

### Props

```ts
interface Props {
  title: string        // sin sufijo — el componente añade "| Llavors Logopèdia"
  description: string  // ~155 caracteres
  lang: 'ca' | 'es'
  ogImage?: string     // ruta relativa; por defecto '/og-default.jpg'
  canonical?: string   // URL completa; si se omite, se construye desde el path actual
  gscVerification?: string  // token de Google Search Console (solo en BaseLayout)
}
```

### Tags generados

```html
<title>{title} | Llavors Logopèdia</title>
<meta name="description" content={description} />

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content="https://www.llavorslogopedia.com{ogImage}" />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />

<!-- Canonical -->
<link rel="canonical" href={canonical} />

<!-- Hreflang -->
<link rel="alternate" hreflang="ca" href="https://www.llavorslogopedia.com{caPath}" />
<link rel="alternate" hreflang="es" href="https://www.llavorslogopedia.com/es{esPath}" />
<link rel="alternate" hreflang="x-default" href="https://www.llavorslogopedia.com{caPath}" />

<!-- Google Search Console (solo si se pasa el token) -->
{gscVerification && <meta name="google-site-verification" content={gscVerification} />}
```

Los canonicals y OG URLs siempre apuntan a `https://www.llavorslogopedia.com`, ignorando el `base: '/llavors-website/'` activo durante la fase de GitHub Pages.

### Construcción del canonical cuando no se pasa la prop

`Astro.url.pathname` incluye el prefijo `/llavors-website/` mientras esté activo el `base`. El componente debe eliminarlo antes de construir la URL definitiva:

```ts
const BASE = '/llavors-website'
const SITE = 'https://www.llavorslogopedia.com'
const path = Astro.url.pathname.startsWith(BASE)
  ? Astro.url.pathname.slice(BASE.length) || '/'
  : Astro.url.pathname
const resolvedCanonical = canonical ?? `${SITE}${path}`
```

Cuando se elimine `base` en la migración DNS (Slice 6b), este código seguirá funcionando sin cambios.

Los paths de hreflang se derivan del `lang` prop y del canonical ya resuelto. Con `prefixDefaultLocale: false` (config actual), las URLs ca no llevan prefijo y las es llevan `/es`:

```ts
const caUrl = lang === 'ca'
  ? resolvedCanonical
  : resolvedCanonical.replace(/\/es\//, '/').replace(/\/es$/, '/')

const esUrl = lang === 'es'
  ? resolvedCanonical
  : resolvedCanonical.replace(/^(https:\/\/www\.llavorslogopedia\.com)(\/.*)$/, '$1/es$2')
```

---

## Componente `SchemaOrg.astro`

### Props

```ts
interface Props {
  lang: 'ca' | 'es'
}
```

Incluir solo en `index.astro` (ca) y `es/index.astro`. Genera un `<script type="application/ld+json">` con tipo `MedicalBusiness`.

### Datos fijos (ambos idiomas)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "url": "https://www.llavorslogopedia.com",
  "telephone": "+34614337743",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Chile, 4",
    "addressLocality": "Valencia",
    "postalCode": "46021",
    "addressCountry": "ES"
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday",    "opens": "11:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday",   "opens": "11:00", "closes": "14:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "09:30", "closes": "14:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday",  "opens": "11:00", "closes": "19:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday",    "opens": "09:30", "closes": "14:00" }
  ],
  "areaServed": ["Valencia", "Massamagrell", "L'Horta", "España"]
}
```

### Datos localizados por idioma

**Valenciano (`lang="ca"`):**
```json
{
  "name": "Llavors Logopèdia",
  "description": "Logopèdia neonatal, reeducació de les funcions orals i desenvolupament comunicatiu. Atenció a domicili, presencial i online a València i l'Horta.",
  "serviceType": [
    "Logopèdia neonatal",
    "Assessorament en lactància materna",
    "Alimentació complementària",
    "Tractament d'anquiloglòssia",
    "Teràpia miofuncional",
    "Reeducació de les funcions orals",
    "Desenvolupament comunicatiu i del llenguatge",
    "Atenció a domicili",
    "Sessions online",
    "Consulta presencial"
  ]
}
```

**Español (`lang="es"`):**
```json
{
  "name": "Llavors Logopèdia",
  "description": "Logopedia neonatal, reeducación de las funciones orales y desarrollo comunicativo. Atención a domicilio, presencial y online en Valencia y l'Horta.",
  "serviceType": [
    "Logopedia neonatal",
    "Asesoramiento en lactancia materna",
    "Alimentación complementaria",
    "Tratamiento de anquiloglosia",
    "Terapia miofuncional",
    "Reeducación de las funciones orales",
    "Desarrollo comunicativo y del lenguaje",
    "Atención a domicilio",
    "Sesiones online",
    "Consulta presencial"
  ]
}
```

---

## Sitemap

Integración `@astrojs/sitemap` de Astro. Se instala como dependencia y se registra en `astro.config.mjs`. Genera `/sitemap-index.xml` automáticamente en cada build.

La página `/blog` y `/es/blog` se filtran del sitemap hasta que tengan contenido real, usando la opción `filter` de la integración.

**Nota de transición:** mientras el `base: '/llavors-website/'` esté activo (GitHub Pages), las URLs del sitemap incluirán ese prefijo. Se normalizarán al eliminar `base` durante la migración DNS (Slice 6b). No enviar el sitemap a Google Search Console hasta entonces.

---

## `robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://www.llavorslogopedia.com/sitemap-index.xml
```

---

## Imagen OG por defecto

- Dimensiones: 1200×630px, formato JPG
- Creación manual en Canva (tarea fuera del código)
- Composición: fondo rosa de la paleta (`#CF3A69` o variante clara), logo centrado, texto "Llavors Logopèdia", tagline "Logopeda a domicili i online · València"
- Ubicación: `public/og-default.jpg`

---

## Textos SEO por página

| Página | `title` | `description` |
|---|---|---|
| `/` | Logopeda a Domicili i Online a València | Llavors Logopèdia — Àngela Alonso. Logopèdia neonatal, funcions orals i desenvolupament del llenguatge. Atenció a domicili, presencial i online a València i l'Horta. |
| `/es/` | Logopeda a Domicilio y Online en Valencia | Llavors Logopèdia — Àngela Alonso. Logopedia neonatal, funciones orales y desarrollo del lenguaje. Atención a domicilio, presencial y online en Valencia y l'Horta. |
| `/privacidad` | Política de Privacitat | Informació sobre el tractament de les teues dades personals a Llavors Logopèdia, d'acord amb el RGPD i la LOPDGDD. |
| `/es/privacidad` | Política de Privacidad | Información sobre el tratamiento de tus datos personales en Llavors Logopèdia, según el RGPD y la LOPDGDD. |
| `/aviso-legal` | Avís Legal | Dades identificatives del titular de llavorslogopedia.com i condicions d'ús del lloc web. |
| `/es/aviso-legal` | Aviso Legal | Datos identificativos del titular de llavorslogopedia.com y condiciones de uso del sitio web. |
| `/cookies` | Política de Cookies | Informació sobre les cookies utilitzades a llavorslogopedia.com i com gestionar-les. |
| `/es/cookies` | Política de Cookies | Información sobre las cookies utilizadas en llavorslogopedia.com y cómo gestionarlas. |

---

## Validación

- [ ] `<title>` y `<meta name="description">` únicos en cada página
- [ ] Compartir la URL en WhatsApp/redes muestra la imagen OG correctamente
- [ ] Las etiquetas hreflang enlazan correctamente ca ↔ es en todas las páginas
- [ ] `https://www.llavorslogopedia.com/sitemap-index.xml` accesible (tras migración DNS)
- [ ] `https://www.llavorslogopedia.com/robots.txt` accesible
- [ ] El test de datos estructurados de Google valida el JSON-LD sin errores
- [ ] Web registrada en Google Search Console (Slice 6b)