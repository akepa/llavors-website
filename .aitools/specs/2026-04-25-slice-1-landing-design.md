# Spec — Slice 1: Landing estática

**Fecha:** 2026-04-25  
**Rama:** `slice/1-landing`  
**Prerequisito:** Slice 0 completado ✓

---

## Objetivo

Implementar la landing completa de Llavors Logopèdia en Astro, con contenido real, bilingüe (valenciano / castellano) vía Astro i18n routing, y sin integraciones externas todavía (Calendly y formulario van en slices posteriores).

---

## Arquitectura i18n

### Configuración Astro

```js
// astro.config.mjs
i18n: {
  defaultLocale: 'ca',
  locales: ['ca', 'es'],
  routing: { prefixDefaultLocale: false }
}
```

- Valenciano: `/` (sin prefijo, locale por defecto)
- Castellano: `/es/`

### Ficheros de traducción

```
src/i18n/
  ca.ts        ← strings en valenciano (fuente de verdad)
  es.ts        ← strings en castellano
  index.ts     ← tipo Translations + helper getTranslations(lang)
```

`getTranslations(lang: 'ca' | 'es'): Translations` — importado en cada página, pasado como prop `t` a los componentes.

### Páginas

```
src/pages/
  index.astro       ← landing CA
  blog.astro        ← placeholder "Pròximament" CA
  es/
    index.astro     ← landing ES
    blog.astro      ← placeholder "Próximamente" ES
```

---

## CSS y estilos

- **`src/styles/global.css`** — variables CSS (`:root`), reset, tipografía base, utilidades globales (`.btn`, `.container`, `.section`, `.section-label`)
- **Estilos de componente** — `<style>` scoped en cada `.astro` para reglas específicas de esa sección
- **Google Fonts** — Playfair Display (400, 600, 700, italic) + Nunito (300, 400, 500, 600, 700) en `BaseLayout.astro`

### Paleta (CSS variables)

```css
--pink: #cf3a69;
--pink-light: #f5d5e0;
--pink-pale: #faf0f3;
--gray: #575754;
--terra: #c4704a;
--bg: #f2e9e1;
--bg-dark: #e8ddd4;
--bg-card: #fffaf7;
--text: #2a2826;
--text-soft: #5a5754;
--white: #ffffff;
--max: 1100px;
--r: 16px;
```

---

## Assets

Copiar de `.aitools/content/uploads/` a `public/images/`:

| Fichero origen | Destino |
|---|---|
| `Diseño sin título (7)-c1f6852b.png` | `public/images/logo.png` |
| `20240426_180608 (1).jpg` | `public/images/angela-hero.jpg` |
| `20240617_170611.jpg` | `public/images/angela-about.jpg` |

Usar `<img>` estándar con `width` y `height` explícitos. Astro Image se añade en Slice 5 (SEO).

> Las rutas de imagen en componentes deben usar `import.meta.env.BASE_URL` como prefijo: `src={`${import.meta.env.BASE_URL}images/logo.png`}` — necesario mientras el proyecto tenga `base: '/llavors-website'`.

---

## Componentes

### `BaseLayout.astro`

Props: `{ lang: 'ca' | 'es', title?: string }`

- `<html lang={lang}>`
- `<head>`: charset, viewport, Google Fonts, `global.css`, title
- Slot para el contenido de la página
- `WhatsAppButton` integrado (fixed, siempre visible)

### `Header.astro`

Props: `{ t: Translations, lang: 'ca' | 'es' }`

- Logo (enlace a la raíz del locale con `getRelativeLocaleUrl(lang, '/')`)
- Nav links: Serveis → `#serveis`, Sobre mi → `#sobre-mi`, Com funciona → `#com-funciona`, Mamà Informada → `getRelativeLocaleUrl(lang, '/blog')`
- Lang switcher: enlaces `<a>` sin JS usando `getRelativeLocaleUrl('ca', '/')` y `getRelativeLocaleUrl('es', '/')` — locale activo marcado con clase `active` comparando con el prop `lang`
- CTA "Reserva la cita" → `#reserva`
- Hamburger con menú móvil (JS en `<script>` del componente, `is:inline`)

> `getRelativeLocaleUrl` de `astro:i18n` gestiona automáticamente el `base` path del proyecto.

### `Hero.astro`

Props: `{ t: Translations }`

- Tag: "Logopeda Neonatal · Assessora de Lactància"
- H1 con `<em>` en rosa: "La *tranquil·litat* que necessites..."
- Subtítulo
- 2 CTAs: "Reserva la primera consulta" (→ `#reserva`) + "Escriu-me" (WhatsApp, `target="_blank"`)
- Trust badge: ★★★★★ + "Valoracions de famílies a Doctoralia"
- Foto de Àngela con blob decorativo de fondo

### `Services.astro`

Props: `{ t: Translations }`

3 cards de servicios:
1. Logopèdia Neonatal
2. Reeducació de les Funcions Orals
3. Desenvolupament Comunicatiu i del Llenguatge

Pills de modalidad:
- Atenció a domicili · València i l'Horta
- Consulta presencial · València i Massamagrell
- Sessions online

### `About.astro`

Props: `{ t: Translations }`

- Foto de Àngela con badge "+5 anys acompanyant famílies en la primera infància"
- 4 párrafos biográficos (el 3º tiene `<strong>` inline)
- 6 credenciales con bullet rosa

### `HowItWorks.astro`

Props: `{ t: Translations }`

4 pasos sobre fondo `--pink` (texto blanco):
1. Primera consulta
2. Pla personalitzat
3. Sessions i seguiment
4. Alta i resultats

Cada paso: número grande (opacidad 0.2), icono SVG, título, descripción.

### `Testimonials.astro`

Props: `{ t: Translations }`

3 cards hardcodeadas: Laura M., Marta P., Carmen R. — texto, nombre, sub-etiqueta, ★★★★★.

### `BookingPlaceholder.astro`

Props: `{ t: Translations }`

- Sección con `id="reserva"`
- 3 pills informativas: confirmació immediata, 45-60 minuts, sense compromís
- Recuadro placeholder de Calendly con botón WhatsApp provisional
- Se reemplazará íntegramente en Slice 2

### `FAQ.astro`

Props: `{ t: Translations }`

Acordeón de 6 preguntas. Estado abierto/cerrado gestionado con JS puro (`is:inline`, toggle de clase `open` en `faq-a` y `active` en `faq-q`). Solo una pregunta abierta a la vez.

### `Footer.astro`

Props: `{ t: Translations, lang: 'ca' | 'es' }`

4 columnas:
1. Brand: logo invertido, descripción breve, iconos sociales (Instagram `@llavors.de.llet`, Facebook, LinkedIn, WhatsApp)
2. Serveis: 5 links a `#serveis`
3. Navegació: inici, sobre mi, com funciona, blog, FAQ
4. Contacte: email `logopeda.angela@gmail.com`, tel `614 33 77 43`, Instagram, CTA "Reserva la cita"

Footer bottom: copyright + links legales (`#` por ahora, se rellenan en Slice 4).

### `WhatsAppButton.astro`

Sin props. Fixed bottom-right. Enlace a `https://wa.me/34614337743?text=Hola%2C%20m%27agradaria%20demanar%20informaci%C3%B3%20sobre%20logop%C3%A8dia`. Label "Parlem?" aparece en hover.

---

## Páginas blog (placeholder)

`src/pages/blog.astro` y `src/pages/es/blog.astro`:
- Misma estructura: BaseLayout + Header + mensaje "Pròximament" / "Próximamente" + Footer
- Sin contenido real — se implementa en un slice futuro

---

## Redes sociales

| Red | URL |
|---|---|
| Instagram | https://www.instagram.com/llavors.de.llet |
| Facebook | https://www.facebook.com/angelamillet.logopedadomicili/ |
| LinkedIn | https://www.linkedin.com/in/àngela-alonso-a2015240/ |
| WhatsApp | https://wa.me/34614337743 |

Todos con `target="_blank" rel="noopener noreferrer"`.

---

## Responsive

- Mobile-first
- Breakpoint tablet: `max-width: 960px`
- Breakpoint móvil: `max-width: 600px`
- Menú hamburguesa en móvil (oculta nav-links y lang switcher del desktop)

---

## Validación (criterios de Slice 1)

- [ ] Se ve correctamente en móvil (375px) y escritorio (1280px)
- [ ] Lang switcher navega entre `/` y `/es/` correctamente
- [ ] Todos los textos son reales (sin Lorem Ipsum) en ambos idiomas
- [ ] Foto de Àngela cargada en hero y "sobre mi"
- [ ] Links de redes sociales funcionan
- [ ] Botón WhatsApp visible y funcional en todas las páginas
- [ ] Acordeón FAQ funciona
- [ ] `npm run build` sin errores
