# Blog drafts (Mamà Informada)

Borradores de artículos para el blog, en valenciano y castellano, antes de pasarlos
al sistema de Content Collections del Slice 8.2.

## Estructura

Un subdirectorio por artículo:

- `val.md` — cuerpo en valenciano (variedad valenciana, no catalán central)
- `es.md` — cuerpo en castellano
- `metadata.yml` — metadatos comunes: translationKey, slugs, categoría,
  descripción VAL/ES, idea de hero image, alt VAL/ES.

## Naming

`NN-translationKey/` donde NN es el orden de creación. El `translationKey` debe
coincidir con el campo dentro de `metadata.yml`.

## ⚠️ Validación obligatoria

Estos textos están redactados como borradores de divulgación, **no como
contenido clínico**. Antes de publicarse, Àngela (logopeda) debe:

1. Revisar precisión clínica y matices profesionales.
2. Aprobar, editar o reescribir según necesidad.
3. Aportar (o validar) las imágenes destacadas reales.

Ningún borrador de este directorio se publica como contenido público sin
la aprobación previa de Àngela.

## Flujo hacia producción

Slice 8.0 (aquí) → Slice 8.1 (hardcoded en `.astro` para validar diseño) →
Slice 8.2 (migrado a MDX en `src/content/blog/`).
