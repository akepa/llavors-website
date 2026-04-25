# Slice 0 — Infraestructura base: Design

**Fecha:** 2026-04-25  
**Repo:** `akepa/llavors-website`  
**Rama de trabajo:** `slice/0-infra`  
**Objetivo:** Deploy automático funcionando en GitHub Pages antes de escribir contenido real.

---

## Contexto y decisiones

- El proyecto Astro (v6.1.9, template minimal, TypeScript strict) ya está scaffolded.
- El DNS **no** cambia en este slice — el sitio se desarrolla en paralelo al WordPress existente.
- La URL de validación es `https://akepa.github.io/llavors-website` (no `llavorslogopedia.com`).
- Cuando llegue el momento del DNS: eliminar `base`, cambiar `site`, añadir `CNAME`.
- Rama principal: `master` (no renombrar a `main`).

---

## Cambios a realizar

### 1. `package.json`

Renombrar `"name"` de `"evolved-ephemera"` a `"llavors-website"`.

### 2. `astro.config.mjs`

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://akepa.github.io',
  base: '/llavors-website',
  output: 'static',
})
```

### 3. Estructura de carpetas

Crear carpetas vacías (con `.gitkeep`):
- `src/components/`
- `src/layouts/`
- `src/styles/` con `global.css` vacío

### 4. `src/pages/index.astro`

Actualizar con contenido placeholder real:
- `lang="ca"`
- `<title>Llavors Logopèdia</title>`
- Nombre y párrafo descriptivo en catalán

### 5. `.github/workflows/deploy.yml`

Workflow con dos jobs (`build` + `deploy`) usando las Actions oficiales:
- `actions/checkout@v4`
- `actions/setup-node@v4` (Node 22, cache npm)
- `actions/upload-pages-artifact@v3` → `./dist`
- `actions/deploy-pages@v4`
- Permissions: `pages: write`, `id-token: write`
- Trigger: push a `master`

---

## Validación

- [ ] `npm run build` sin errores en local
- [ ] Push a `master` dispara el workflow de GitHub Actions
- [ ] `https://akepa.github.io/llavors-website` carga la página placeholder

---

## Pendiente para después del DNS

- Eliminar `base: '/llavors-website'` de `astro.config.mjs`
- Cambiar `site` a `'https://llavorslogopedia.com'`
- Añadir `/public/CNAME` con contenido `llavorslogopedia.com`
- Configurar registros A en Hostinger apuntando a GitHub Pages IPs