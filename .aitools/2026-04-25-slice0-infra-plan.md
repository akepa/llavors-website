# Slice 0 — Infraestructura base: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy automático funcionando en `https://akepa.github.io/llavors-website` con página placeholder antes de escribir contenido real.

**Architecture:** Astro 6 estático (output: static) desplegado vía GitHub Actions a GitHub Pages. El DNS no cambia en este slice — el sitio convive con el WordPress existente en `llavorslogopedia.com`. La config de `base: '/llavors-website'` se eliminará cuando se haga el cambio de DNS.

**Tech Stack:** Astro 6.1.9, TypeScript strict, GitHub Actions, GitHub Pages

---

## File Map

| Acción | Archivo |
|--------|---------|
| Modify | `package.json` |
| Modify | `astro.config.mjs` |
| Create | `src/components/.gitkeep` |
| Create | `src/layouts/.gitkeep` |
| Create | `src/styles/global.css` |
| Modify | `src/pages/index.astro` |
| Create | `.github/workflows/deploy.yml` |
| Create | `CLAUDE.md` |

---

## Task 1: Configurar package.json y astro.config.mjs

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Actualizar nombre del paquete en package.json**

Reemplazar el campo `"name"`:

```json
{
  "name": "llavors-website",
  "type": "module",
  "version": "0.0.1",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^6.1.9"
  }
}
```

- [ ] **Step 2: Reemplazar astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://akepa.github.io',
  base: '/llavors-website',
  output: 'static',
})
```

> Nota: cuando se haga el cambio de DNS, eliminar `base` y cambiar `site` a `'https://llavorslogopedia.com'`.

- [ ] **Step 3: Verificar que el build funciona**

```bash
npm run build
```

Resultado esperado: carpeta `dist/` creada sin errores. El index estará en `dist/llavors-website/index.html`.

- [ ] **Step 4: Commit**

```bash
git add package.json astro.config.mjs
git commit -m "chore: configure astro for github pages deployment"
```

---

## Task 2: Crear estructura de carpetas y actualizar index.astro

**Files:**
- Create: `src/components/.gitkeep`
- Create: `src/layouts/.gitkeep`
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Crear carpetas con .gitkeep**

Crear archivos vacíos en:
- `src/components/.gitkeep`
- `src/layouts/.gitkeep`

- [ ] **Step 2: Crear src/styles/global.css**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}
```

- [ ] **Step 3: Actualizar src/pages/index.astro**

```astro
---
---
<html lang="ca">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>Llavors Logopèdia</title>
  </head>
  <body>
    <h1>Llavors Logopèdia</h1>
    <p>Especialista en logopèdia infantil i d'adults. Pròximament, la nova web.</p>
  </body>
</html>
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Resultado esperado: `dist/llavors-website/index.html` contiene "Llavors Logopèdia". Sin errores de TypeScript.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "chore: add folder structure and placeholder index page"
```

---

## Task 3: GitHub Actions — Deploy a GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

> **Paso manual previo:** En `https://github.com/akepa/llavors-website/settings/pages`, configurar Source → **GitHub Actions** (no "Deploy from a branch"). Sin esto el workflow falla.

- [ ] **Step 1: Crear .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit y push a master**

```bash
git add .github/
git commit -m "ci: add github actions workflow for github pages deploy"
git push origin master
```

- [ ] **Step 3: Verificar el workflow en GitHub**

Ir a `https://github.com/akepa/llavors-website/actions` y confirmar que el workflow se ejecuta sin errores.

- [ ] **Step 4: Verificar la URL**

Abrir `https://akepa.github.io/llavors-website` y confirmar que carga la página "Llavors Logopèdia".

---

## Task 4: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Crear CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — servidor de desarrollo en `localhost:4321`
- `npm run build` — build de producción a `./dist/`
- `npm run preview` — previsualizar el build local

## Architecture

Web estática construida con **Astro 6** (TypeScript strict). Se despliega automáticamente a **GitHub Pages** via GitHub Actions en cada push a `master`.

### Estructura de ramas

- `master` → producción (deploy automático)
- `develop` → integración
- `slice/N-nombre` → rama de trabajo por slice

### Slices de desarrollo

El proyecto se desarrolla en slices independientes (ver `.aitools/llavors-dev-plan.md`):
- Slice 0: Infraestructura base ← en curso
- Slice 1: Landing estática (contenido real, sin integraciones)
- Slice 2: Reserva de citas (Calendly embed)
- Slice 3: Formulario de contacto (Formspree/Web3Forms)
- Slice 4: Legal y privacidad (RGPD)
- Slice 5: SEO básico
- Slice 6: Analytics (Plausible)
- Slice 7: Reseñas dinámicas (requiere migración a Vercel)

### Config importante

`astro.config.mjs` tiene `base: '/llavors-website'` mientras el DNS no esté migrado. El sitio convive con el WordPress en `llavorslogopedia.com`. Al hacer el cambio de DNS: eliminar `base`, cambiar `site` a `'https://llavorslogopedia.com'`, añadir `public/CNAME`.

### Fuente de verdad del diseño

Los specs y planes están en `.aitools/`.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project context"
```

---

## Validación final

- [ ] `npm run build` sin errores en local
- [ ] Workflow de GitHub Actions visible en `https://github.com/akepa/llavors-website/actions`
- [ ] `https://akepa.github.io/llavors-website` carga "Llavors Logopèdia"
