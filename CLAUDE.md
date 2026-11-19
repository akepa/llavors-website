# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — servidor de desarrollo en `http://localhost:4321/`
- `npm run build` — build de producción a `./dist/`
- `npm run preview` — previsualizar el build local

### Ejecutar npm desde las herramientas

Node.js **no está en el PATH** del entorno de herramientas. Para ejecutar cualquier comando npm usar **PowerShell** (no Bash) con el PATH ampliado:

```powershell
$env:PATH = "C:\Program Files\nodejs\;" + $env:PATH; npm run dev
```

El servidor arranca en `http://localhost:4321/` en unos 2 segundos. Lanzarlo siempre en background (`run_in_background: true`) y leer el output para confirmar que está listo.

## Architecture

Web estática construida con **Astro 7** (TypeScript strict). Se despliega automáticamente a **GitHub Pages** via GitHub Actions en cada push a `master`.

### Estructura de ramas

- `master` → producción (deploy automático)
- `develop` → integración
- `slice/N-nombre` → rama de trabajo por slice

### Slices de desarrollo

El proyecto se desarrolló en slices independientes (plan en `plans/` del repo privado `akepa/llavors-ops`). Estado histórico:
- Slice 0: Infraestructura base ✓
- Slice 1: Landing estática ✓
- Slice 2: Reserva de citas (Google Calendar + Apps Script)
- Slice 3: Formulario de contacto (Formspree/Web3Forms)
- Slice 4: Legal y privacidad (RGPD)
- Slice 5: SEO básico
- Slice 6: Analytics (Plausible)
- Slice 7: Reseñas dinámicas (requiere migración a Vercel)

### Fuente de verdad del diseño

Los diseños y planes viven en el repo privado `akepa/llavors-ops`:

- Specs de diseño → `specs/`
- Planes de desarrollo → `plans/`

## Idioma

Cuando se añadan o modifiquen textos en catalán, usar siempre la **variedad valenciana** (no el catalán central). Por ejemplo: "xiquet" en lugar de "nen", "vosté" en lugar de "vostè", terminaciones verbales valencianas, etc. El botón de idioma ya usa "VAL" como etiqueta para indicar esto.

## Herramientas

Para cualquier operación sobre archivos, usar siempre las herramientas internas en este orden de preferencia:

- **Read** — leer archivos (no `cat`, `head`, `tail`)
- **Write** — crear o reescribir archivos (no `echo`, heredocs)
- **Edit** — modificar fragmentos de archivos existentes (no `sed`, `awk`)
- **Grep** — buscar en contenido (no `grep`, `rg`)
- **Glob** — buscar archivos por patrón (no `find`, `ls`)

Reservar Bash/PowerShell únicamente para operaciones de shell que no tengan herramienta dedicada (git, npm, etc.).
