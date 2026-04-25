# Plan de Desarrollo — Llavors Logopèdia

> Documento de referencia para usar con Claude Code. Cada slice es una unidad de trabajo independiente con contexto suficiente para ser implementada de forma autónoma.

---

## Contexto del proyecto

**Cliente:** Àngela Alonso Millet — Logopeda  
**Web actual:** https://llavorslogopedia.com (WordPress, Hostinger Premium)  
**Referencia de diseño:** https://www.crislorentenutricion.com/  
**Repo:** GitHub (existente)  
**Objetivo:** Reemplazar WordPress por una web estática customizada, con reserva de citas y presencia profesional

---

## Stack técnico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Astro** | Estático, rápido, fácil de mantener |
| Hosting v1 | **GitHub Pages** | Gratuito, deploy via GitHub Actions |
| Hosting v2+ | **Vercel** | Migración cuando se necesite backend |
| Citas | **Calendly** (free tier) | Widget embed |
| Formulario | **Formspree** o **Web3Forms** | Sin backend propio |
| Reseñas v1 | Hardcodeadas | Contenido estático |
| Reseñas v2 | **Google Business API** + widget Doctoralia | Requiere Vercel |
| CMS futuro | **Decap CMS** | Si se necesita edición de contenido |
| BBDD futuro | **Supabase** | Solo si hay gestión de pacientes |

---

## Estructura de ramas

```
master          → producción (desplegado automáticamente)
develop       → integración
slice/N-nombre → rama de trabajo por slice
```

---

## Slice 0 — Infraestructura base

**Objetivo:** URL real funcionando con deploy automático antes de escribir una línea de contenido.

### Tareas

1. Inicializar proyecto Astro en el repo existente
   ```bash
   npm create astro@latest . -- --template minimal --typescript strict --no-install
   npm install
   ```

2. Crear estructura de carpetas
   ```
   src/
     components/
     layouts/
     pages/
       index.astro
     styles/
       global.css
   public/
     fonts/
     images/
   ```

3. Página `index.astro` con contenido mínimo: nombre "Llavors Logopèdia" y un párrafo placeholder

4. Configurar GitHub Actions para deploy a GitHub Pages
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [master]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: actions/deploy-pages@v4
   ```

5. En `astro.config.mjs`:
   ```js
   export default defineConfig({
     site: 'https://llavorslogopedia.com',
     output: 'static',
   })
   ```

6. Configurar DNS en Hostinger: apuntar dominio `llavorslogopedia.com` a GitHub Pages
   - Añadir archivo `CNAME` en `/public/` con el contenido `llavorslogopedia.com`
   - En Hostinger DNS: registro A apuntando a IPs de GitHub Pages (185.199.108-111.153)

### Validación
- [ ] `npm run build` sin errores en local
- [ ] Push a `master` dispara el workflow
- [ ] `https://llavorslogopedia.com` carga la página placeholder

---

## Slice 1 — Landing estática

> **Prerequisito:** Diseño de Àngela completado en Claude Design. Se necesita: paleta de colores (hex), tipografía elegida, foto de Àngela, textos reales de cada sección.

**Objetivo:** La web completa visualmente con contenido real, sin integraciones externas todavía.

### Secciones a implementar (en orden en la página)

1. **Header / Nav** — Logo + links de navegación + botón CTA "Reservar cita"
2. **Hero** — Foto de Àngela, titular, subtítulo, CTA principal, botón WhatsApp
3. **Servicios** — Cards con los servicios que ofrece (logopedia infantil, adultos, domicilio...)
4. **Sobre mí** — Foto, texto biográfico, formación
5. **Cómo funciona** — Proceso en 3-4 pasos
6. **Testimonios** — Reseñas hardcodeadas (texto, nombre, estrellas)
7. **Reserva de cita** — Sección placeholder con CTA (el embed de Calendly va en Slice 2)
8. **FAQ** — Acordeón con preguntas frecuentes
9. **Footer** — Links de navegación, redes sociales (Instagram, Facebook, LinkedIn), aviso legal, privacidad

### Componentes Astro a crear

```
src/components/
  Header.astro
  Hero.astro
  Services.astro
  About.astro
  HowItWorks.astro
  Testimonials.astro
  BookingPlaceholder.astro
  FAQ.astro
  Footer.astro
  WhatsAppButton.astro   ← botón flotante global
  SocialLinks.astro
```

### Botón flotante de WhatsApp

Presente en todas las páginas. Implementar en el layout base.

```html
<!-- Formato del enlace -->
<a href="https://wa.me/34XXXXXXXXX?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20informaci%C3%B3n%20sobre%20logopedia">
  <!-- Icono WhatsApp SVG -->
</a>
```

Posición: `fixed`, esquina inferior derecha, z-index alto, visible en móvil y escritorio.

### Links de redes sociales

Incluir en Footer y opcionalmente en Hero:
- Instagram: https://www.instagram.com/llavors.logopedia
- Facebook: https://www.facebook.com/angelamillet.logopedadomicili/
- LinkedIn: https://www.linkedin.com/in/àngela-alonso-a2015240/

Abrir siempre en `target="_blank" rel="noopener noreferrer"`.

### Responsive

- Mobile-first
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`
- Menú hamburguesa en móvil

### Validación
- [ ] Se ve correctamente en móvil (375px) y escritorio (1280px)
- [ ] Todos los textos son reales (sin Lorem Ipsum)
- [ ] Foto de Àngela cargada y optimizada (Astro Image)
- [ ] Links de redes sociales funcionan
- [ ] Botón WhatsApp visible y funcional en todas las páginas
- [ ] Sin errores de consola

---

## Slice 2 — Reserva de citas (Calendly)

**Objetivo:** Los pacientes pueden reservar cita directamente desde la web.

### Prerequisitos

- Àngela tiene cuenta Calendly creada (free tier)
- Calendly configurado con: disponibilidad semanal, duración de sesión, nombre del evento ("Cita de Logopedia")
- URL del evento Calendly disponible

### Tareas

1. Sustituir `BookingPlaceholder.astro` por `BookingCalendly.astro`

2. Embed inline de Calendly (sin popup, mejor UX):
   ```html
   <!-- En el componente BookingCalendly.astro -->
   <div
     class="calendly-inline-widget"
     data-url="https://calendly.com/USUARIO/EVENTO"
     style="min-width:320px;height:700px;">
   </div>
   <script
     type="text/javascript"
     src="https://assets.calendly.com/assets/external/widget.js"
     async>
   </script>
   ```

3. Asegurarse de que la sección tiene `id="reservar"` para que el botón CTA del hero haga scroll correcto:
   ```html
   <section id="reservar">...</section>
   ```

### Validación
- [ ] El widget de Calendly carga correctamente
- [ ] Se puede completar una reserva de prueba end-to-end
- [ ] Àngela recibe email de confirmación
- [ ] El paciente recibe email de confirmación
- [ ] El botón "Reservar cita" del header hace scroll a la sección

---

## Slice 3 — Formulario de contacto

**Objetivo:** Los pacientes pueden enviar consultas sin salir de la web.

### Tareas

1. Crear cuenta en [Formspree](https://formspree.io) o [Web3Forms](https://web3forms.com) (ambos gratuitos)

2. Crear componente `ContactForm.astro` con campos:
   - Nombre (required)
   - Email (required)
   - Teléfono (opcional)
   - Motivo de consulta (textarea, required)
   - Checkbox política de privacidad (required, enlaza a `/privacidad`)

3. Submit via `fetch` a la API de Formspree/Web3Forms (sin recarga de página):
   ```js
   const response = await fetch('https://formspree.io/f/XXXXXX', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(formData)
   })
   ```

4. Estados del formulario: idle / loading / success / error — mostrar feedback visual claro

5. Añadir sección de contacto en `index.astro` con el formulario (puede ir antes del footer)

### Validación
- [ ] Formulario enviado → Àngela recibe email con los datos
- [ ] El usuario ve mensaje de confirmación tras enviar
- [ ] Validación de campos en cliente (HTML5 + JS básico)
- [ ] El checkbox de privacidad es obligatorio para enviar
- [ ] Funciona en móvil

---

## Slice 4 — Legal y privacidad (RGPD)

**Objetivo:** Cumplir la normativa española antes de hacer cualquier campaña o publicitar la web.

> ⚠️ Este slice debe completarse antes de lanzar la web públicamente.

### Páginas a crear

#### `/privacidad` — Política de Privacidad
Contenido mínimo obligatorio (RGPD + LOPDGDD):
- Responsable del tratamiento (nombre, NIF, dirección, email)
- Finalidad de los datos recogidos (formulario de contacto, reservas)
- Base jurídica (consentimiento)
- Destinatarios (Calendly, Formspree — indicar transferencias a EEUU y garantías)
- Derechos del usuario (acceso, rectificación, supresión, portabilidad)
- Cómo ejercer los derechos (email de contacto)
- Derecho a reclamar ante la AEPD

#### `/aviso-legal` — Aviso Legal
- Datos identificativos del titular
- Objeto y ámbito de aplicación
- Propiedad intelectual

#### `/cookies` — Política de Cookies
- Solo cookies técnicas en v1 (sin Analytics todavía)
- Si se añade Analytics en Slice 6, actualizar este documento

### Banner de cookies

Componente `CookieBanner.astro`:
- Aparece en primera visita
- Opción "Aceptar todas" y "Solo técnicas"
- Guardar preferencia en `localStorage`
- En v1 (sin Analytics) es suficiente con informar — no hay cookies de terceros que bloquear

### Actualizar formulario de contacto
- El checkbox de privacidad debe enlazar a `/privacidad`
- Texto: "He leído y acepto la [política de privacidad](/privacidad)"

### Validación
- [ ] Las tres páginas legales existen y tienen contenido real (no plantilla genérica)
- [ ] Footer enlaza a `/privacidad`, `/aviso-legal`, `/cookies`
- [ ] Banner de cookies aparece en primera visita y no vuelve a aparecer si se acepta
- [ ] El formulario de contacto tiene el checkbox de privacidad obligatorio

---

## Slice 5 — SEO básico

**Objetivo:** La web es indexable por Google y se ve bien al compartir en redes sociales.

### Tareas

1. Crear componente `SEO.astro` reutilizable para el `<head>`:
   ```astro
   ---
   interface Props {
     title: string
     description: string
     image?: string
     canonical?: string
   }
   ---
   <title>{title} | Llavors Logopèdia</title>
   <meta name="description" content={description} />
   <meta property="og:title" content={title} />
   <meta property="og:description" content={description} />
   <meta property="og:image" content={image ?? '/og-default.jpg'} />
   <meta property="og:type" content="website" />
   <meta name="twitter:card" content="summary_large_image" />
   <link rel="canonical" href={canonical} />
   ```

2. Añadir el componente `SEO` en todas las páginas con título y descripción únicos

3. Crear imagen Open Graph por defecto (`/public/og-default.jpg`) — 1200x630px con logo/nombre

4. Generar `sitemap.xml` automáticamente:
   ```bash
   npm install @astrojs/sitemap
   ```
   ```js
   // astro.config.mjs
   import sitemap from '@astrojs/sitemap'
   export default defineConfig({
     integrations: [sitemap()]
   })
   ```

5. Crear `/public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://llavorslogopedia.com/sitemap-index.xml
   ```

6. Dar de alta en **Google Search Console**:
   - Verificar propiedad (método recomendado: HTML tag en el `<head>`)
   - Enviar sitemap manualmente

### Validación
- [ ] `<title>` y `<meta description>` únicos en cada página
- [ ] Compartir la URL en WhatsApp/Twitter muestra la imagen OG correctamente
- [ ] `https://llavorslogopedia.com/sitemap-index.xml` accesible
- [ ] `https://llavorslogopedia.com/robots.txt` accesible
- [ ] Web registrada en Google Search Console sin errores críticos

---

## Slice 6 — Analytics

**Objetivo:** Àngela puede ver cuánta gente visita la web y desde dónde llegan.

### Opción recomendada: Plausible Analytics (privacy-friendly)

- Sin cookies → no requiere actualizar el banner de cookies
- RGPD-compliant por diseño
- Dashboard simple, apto para no-técnicos
- Coste: 9€/mes (o self-hosted gratis)
- Alternativa gratuita: **Google Analytics 4** (requiere actualizar política de cookies)

### Tareas (con Plausible)

1. Crear cuenta en [plausible.io](https://plausible.io) y añadir el dominio

2. Añadir script en el layout base:
   ```html
   <script
     defer
     data-domain="llavorslogopedia.com"
     src="https://plausible.io/js/script.js">
   </script>
   ```

3. Configurar evento de conversión para el botón de reserva:
   ```html
   <a
     href="#reservar"
     onclick="plausible('Click Reservar Cita')">
     Reservar cita
   </a>
   ```

4. Configurar evento para el botón de WhatsApp:
   ```html
   onclick="plausible('Click WhatsApp')"
   ```

### Validación
- [ ] Visita de prueba aparece en el dashboard de Plausible
- [ ] El evento "Click Reservar Cita" se registra al hacer clic
- [ ] El evento "Click WhatsApp" se registra al hacer clic

---

## Slice 7 — Reseñas dinámicas

> **Prerequisito:** Migración a Vercel completada (necesario para serverless functions).  
> Este slice cambia el hosting de GitHub Pages a Vercel.

**Objetivo:** Mostrar automáticamente las reseñas reales de Google y Doctoralia.

### Migración a Vercel

1. Conectar el repo de GitHub a Vercel (1 clic desde el dashboard)
2. Configurar dominio personalizado en Vercel
3. Eliminar configuración de GitHub Pages (GitHub Actions de deploy)
4. Verificar que el deploy automático funciona desde Vercel

### Google Reviews

**Prerequisito:** Àngela tiene Google Business Profile verificado ✅

1. Activar Google Places API en Google Cloud Console
2. Crear API key con restricción de dominio (`llavorslogopedia.com`)
3. Crear serverless function en Vercel (`/api/reviews.js`):
   - Llama a Places API
   - Filtra reseñas de 4-5 estrellas
   - Cachea el resultado 24h (evitar llamadas repetidas a la API)
   - Devuelve JSON limpio al frontend
4. Sustituir el componente `Testimonials.astro` hardcodeado por uno que consuma este endpoint

### Doctoralia

El **plan gratuito de Doctoralia no tiene API**. Las opciones son:

**Opción A (recomendada):** Widget oficial de Doctoralia
- Doctoralia proporciona un embed HTML para el perfil
- Buscar en el perfil de Àngela: Compartir → Insertar en web
- Sin coste adicional, pero el diseño lo controla Doctoralia

**Opción B:** Mostrar solo el enlace al perfil de Doctoralia con la puntuación actualizada manualmente
- Más simple, sin dependencias externas

### Validación
- [ ] Deploy en Vercel funcionando con dominio personalizado
- [ ] Las reseñas de Google se actualizan automáticamente
- [ ] Widget o enlace de Doctoralia visible en la sección de testimonios
- [ ] La página sigue cargando correctamente si la API de Google falla (fallback a reseñas hardcodeadas)

---

## Roadmap futuro (fuera de scope v1)

### Blog / Contenido editorial → Decap CMS

Cuando Àngela quiera publicar artículos o actualizar contenido sin tocar código:

- Instalar Decap CMS (se integra directamente con el repo de GitHub)
- Panel de administración en `/admin`
- Los cambios se guardan como commits — sin base de datos
- Compatible con Astro y Vercel sin cambios

### Panel de administración → Supabase

Solo si aparece necesidad real de datos estructurados (historial, notas de sesión):

- Supabase Auth para login de Àngela
- Postgres para almacenar datos
- ⚠️ Los datos clínicos de pacientes son **categoría especial bajo RGPD** (datos de salud) — requiere medidas técnicas adicionales y posiblemente asesoría legal antes de implementar

---

## Checklist de lanzamiento

Antes de retirar el WordPress y apuntar el dominio definitivamente:

- [ ] Slice 0-4 completados
- [ ] Revisión legal de las páginas de privacidad y aviso legal
- [ ] Prueba de reserva end-to-end con Calendly
- [ ] Prueba del formulario de contacto
- [ ] Web revisada en iOS Safari y Android Chrome
- [ ] Redirección 301 configurada si alguna URL antigua de WordPress era relevante para SEO
- [ ] Backup de la web WordPress guardado antes de cancelar Hostinger

---

## Notas para Claude Code

- Cada slice tiene su propia rama: `slice/0-infra`, `slice/1-landing`, etc.
- Hacer PR a `develop` al terminar cada slice, merge a `main` solo cuando esté validado
- Los secrets (API keys, tokens de Formspree) van en variables de entorno, nunca en el código
- En GitHub Pages: usar GitHub Secrets + Actions para inyectar env vars en build time
- En Vercel: usar el panel de Environment Variables
