# Slice 1 — Landing estática

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la landing completa de Llavors Logopèdia con diseño real, bilingüe (CA/ES) vía Astro i18n routing, y blog placeholder, fiel al mockup en `.aitools/mockups/llavors_landing.html`.

**Architecture:** Astro i18n routing con `defaultLocale: 'ca'` (sin prefijo en URL) y `'es'` en `/es/`. Strings tipadas en `src/i18n/`, pasadas como prop `t: Translations` a componentes. Lang switcher usa `getRelativeLocaleUrl` de `astro:i18n` — sin JS de runtime. Imágenes en `public/images/`, referenciadas con `${import.meta.env.BASE_URL}images/...` para respetar el `base: '/llavors-website'` del config.

**Tech Stack:** Astro 6, TypeScript strict, CSS puro con variables CSS, Google Fonts (Playfair Display + Nunito).

---

## File Map

| Acción | Fichero |
|---|---|
| Modify | `astro.config.mjs` |
| Modify | `.gitignore` |
| Create | `src/i18n/ca.ts` |
| Create | `src/i18n/es.ts` |
| Create | `src/i18n/index.ts` |
| Modify | `src/styles/global.css` |
| Create | `src/layouts/BaseLayout.astro` |
| Create | `src/components/WhatsAppButton.astro` |
| Create | `src/components/Header.astro` |
| Create | `src/components/Hero.astro` |
| Create | `src/components/Services.astro` |
| Create | `src/components/About.astro` |
| Create | `src/components/HowItWorks.astro` |
| Create | `src/components/Testimonials.astro` |
| Create | `src/components/BookingPlaceholder.astro` |
| Create | `src/components/FAQ.astro` |
| Create | `src/components/Footer.astro` |
| Modify | `src/pages/index.astro` |
| Create | `src/pages/es/index.astro` |
| Create | `src/pages/blog.astro` |
| Create | `src/pages/es/blog.astro` |
| Copy | `public/images/logo.png` (from `.aitools/content/uploads/`) |
| Copy | `public/images/angela-hero.jpg` |
| Copy | `public/images/angela-about.jpg` |

---

### Task 1: Branch + config

**Files:**
- Modify: `astro.config.mjs`
- Modify: `.gitignore`

- [ ] **Crear la rama de trabajo**

```bash
git checkout -b slice/1-landing
```

- [ ] **Añadir excepción para plans en .gitignore**

Editar `.gitignore`: cambiar el bloque de `.aitools` para que quede:

```
.aitools/
!.aitools/specs/
!.aitools/specs/**
!.aitools/plans/
!.aitools/plans/**
```

- [ ] **Añadir i18n config en astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://akepa.github.io/llavors-website',
  base: '/llavors-website',
  output: 'static',
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```
Esperado: build completado sin errores en `dist/`.

- [ ] **Commit**

```bash
git add astro.config.mjs .gitignore
git commit -m "feat(slice-1): add i18n routing config, unignore .aitools/plans/"
```

---

### Task 2: Traducciones

**Files:**
- Create: `src/i18n/ca.ts`
- Create: `src/i18n/es.ts`
- Create: `src/i18n/index.ts`

- [ ] **Crear src/i18n/ca.ts**

```ts
const ca = {
  nav_serveis: 'Serveis',
  nav_sobre: 'Sobre mi',
  nav_com: 'Com funciona',
  nav_blog: 'Mamà Informada',
  nav_reservar: 'Reservar',
  nav_cta: 'Reserva la cita',

  hero_tag: 'Logopeda Neonatal · Assessora de Lactància',
  hero_h1: "La <em>tranquil·litat</em> que necessites per a la lactància i l'alimentació del teu bebè",
  hero_sub: "Sóc l'Àngela. T'acompanye perquè et sentis segura, confiada i pugues gaudir d'aquesta etapa amb el teu bebè, sense pressió i amb molt d'amor.",
  hero_cta1: 'Reserva la primera consulta',
  hero_cta2: 'Escriu-me',
  hero_trust: 'Valoracions de famílies a Doctoralia',

  serveis_label: 'El que faig',
  serveis_h2: 'Serveis',
  serveis_sub: "Atenció especialitzada per a bebès, xiquets i les seues famílies, des del naixement fins als 6 anys.",
  s1_title: 'Logopèdia Neonatal',
  s1_text: "Assessorament en la lactància materna, mixta o al biberó i en l'alimentació complementària. Des de la preparació durant l'embaràs fins al tractament de dificultats de succió, dolor o problemes derivats de la prematuritat o anquiloglòssia. Acompanyament en la introducció d'aliments de manera segura i respectuosa.",
  s2_title: 'Reeducació de les Funcions Orals',
  s2_text: "Teràpia miofuncional per millorar la respiració nasal, la masticació i la deglució. Tractaments complementaris i/o preventius a l'ortodòncia, treballant de la mà dels odontopediatres per millorar la qualitat de la respiració i el descans dels xiquets.",
  s3_title: 'Desenvolupament Comunicatiu i del Llenguatge',
  s3_text: "Assessorament i acompanyament en el desenvolupament de la comunicació i el llenguatge des del primer any fins als 6 anys. Busquem estratègies i millorem les habilitats familiars per afavorir l'aprenentatge del llenguatge en els entorns naturals del xiquet i en base a les seues rutines diàries.",
  mod1: "Atenció a domicili · València i l'Horta",
  mod2: 'Consulta presencial · València i Massamagrell',
  mod3: 'Sessions online',

  about_badge: '+5 anys acompanyant famílies en la primera infància',
  sobre_label: 'Qui sóc',
  sobre_h2: "Hola, sóc l'Àngela",
  sobre_p1: "Sóc doble titulada en Logopèdia i Magisteri, especialitat en Educació Infantil. Però més que els títols, el que em defineix és la passió per acompanyar a les famílies en un dels moments més intensos i transformadors de la vida.",
  sobre_p2: "La meua trajectòria professional va començar en l'àmbit adult — comunicació i alimentació — fins que vaig descobrir la primera infància en un centre d'Atenció Primerenca. Em vaig enamorar d'aquesta etapa i des d'aleshores no he deixat de formar-me i especialitzar-me.",
  sobre_p3: "Va ser la meua pròpia maternitat la que va fer resurrgir amb força la meua passió per l'alimentació dels bebès. Vaig viure en primera persona els reptes de la lactància i vaig entendre, com mai, el que senten les mares. Això em va impulsar a especialitzar-me en <strong>disfàgia neonatal i assessoria de lactància</strong>, per poder acompanyar a famílies com la teua.",
  sobre_p4: "Des de 2019 forme part dels equips d'Atenció Primerenca de la Conselleria d'Educació, treballant en la prevenció, detecció i intervenció en xiquets de 0 a 6 anys. Ara, a través de Llavors, poso tota aquesta experiència al servei de les famílies en l'àmbit privat.",
  cred1: 'Diplomada en Logopèdia i en Magisteri · Educació Infantil',
  cred2: 'Especialització en disfàgia neonatal en UCIN i prematuritat',
  cred3: 'Certificació en assessoria de lactància',
  cred4: 'Intervenció logopèdica en casos ortodòntics i teràpia miofuncional',
  cred5: 'Psicopatologia del xiquet de 0 a 3 anys i el xiquet prematur',
  cred6: 'Màster en Teràpia Miofuncional Orofacial · Hospital de la Santa Creu i Sant Pau — en curs',

  com_label: 'El procés',
  com_h2: 'Com funciona',
  com_sub: 'Un acompanyament pensat per a tu i el teu bebè, pas a pas.',
  step1_h: 'Primera consulta',
  step1_p: "Ens coneixem i avaluem la situació del bebè i la família. Escoltem la teua história i les teues preocupacions sense pressa.",
  step2_h: 'Pla personalitzat',
  step2_p: "Dissenyem juntes el programa de treball, establint estratègies adaptades a les necessitats del xiquet i del seu entorn familiar.",
  step3_h: 'Sessions i seguiment',
  step3_p: "Treballem setmana a setmana, amb contacte directe per WhatsApp per a qualsevol dubte. Perquè les preguntes no esperen al proper dijous.",
  step4_h: 'Alta i resultats',
  step4_p: "Quan el bebè i la família han assolit els objectius i el benestar és òptim, tanquem el procés. Sempre amb la porta oberta per a qualsevol consulta futura.",

  testi_label: 'Testimonis',
  testi_h2: 'El que diuen les famílies',
  testi_sub: 'Valoracions reals de famílies que han confiat en Llavors Logopèdia.',
  t1_text: "\"L'Àngela va ser un punt d'inflexió en la nostra lactància. Gràcies al seu acompanyament vam superar les dificultats dels primers dies i vam poder gaudir d'una experiència preciosa. Sempre disponible i amb molta paciència.\"",
  t1_author: 'Laura M.',
  t1_sub: "· Mamà d'una bebè de 3 mesos",
  t2_text: '"Professional, empàtica i molt propera. Ens va ajudar amb les dificultats d\'alimentació del nostre fill des del primer moment. La seua mirada holística i el seu tracte humà fan que et sentis acompanyada de debò."',
  t2_author: 'Marta P.',
  t2_sub: '· Mamà de nen de 8 mesos',
  t3_text: '"El seu acompanyament durant la transició a l\'alimentació complementària ha sigut increïble. Ens ha donat les eines per viure aquesta etapa amb tranquil·litat, sense pors ni pressió. La recomanaria a totes les mares."',
  t3_author: 'Carmen R.',
  t3_sub: '· Mamà de xiqueta de 7 mesos',

  res_label: 'Comencem',
  res_h2: 'Reserva la primera visita de valoració',
  res_sub: "Una primera consulta sense compromís per a conèixer-nos i veure com puc ajudar-te.",
  res_o1: 'Confirmació immediata',
  res_o2: '45–60 minuts',
  res_o3: 'Sense compromís',
  cal_title: 'Widget de Calendly',
  cal_text: "Aquí s'integrarà el teu calendari de Calendly. Afegeix el teu codi d'embed per activar les reserves en línia.",
  cal_btn: 'Mentrestant, escriu-me per WhatsApp',

  faq_label: 'Dubtes',
  faq_h2: 'Preguntes freqüents',
  faq1_q: 'A partir de quina edat podeu tractar als xiquets?',
  faq1_a: "Treballem amb bebès des del naixement. En logopèdia neonatal, podem intervenir des dels primers dies de vida per a problemes de lactància i alimentació. Per al desenvolupament comunicatiu i del llenguatge, acompanyem des de l'any fins als 6 anys.",
  faq2_q: 'Quant dura una sessió?',
  faq2_a: 'Les sessions duren entre 45 minuts i 1 hora, depenent de les necessitats del xiquet i la família. La primera consulta de valoració sol ser una mica més llarga, perquè volem conèixer-vos bé a tots.',
  faq3_q: 'Quantes sessions es necessiten?',
  faq3_a: "Depèn de cada cas. Algunes famílies noten millores en poques sessions; altres necessiten un acompanyament més prolongat. Sempre establim un pla personalitzat i fem revisions periòdiques per ajustar-lo a l'evolució del xiquet.",
  faq4_q: "Treballeu amb l'assegurança mèdica?",
  faq4_a: 'De moment no treballem amb assegurances mèdiques. Oferim atenció privada perquè ens permet dedicar el temps i la qualitat que cada família mereix, sense restriccions ni pressa.',
  faq5_q: 'Feu sessions a domicili?',
  faq5_a: "Sí! Oferim atenció a domicili a València i les poblacions de l'Horta. També tenim consulta presencial a València i Massamagrell, i sessions online per a qui preferisca la comoditat de casa seva.",
  faq6_q: 'Com sé si el meu fill necessita logopèdia?',
  faq6_a: "Si tens dubtes sobre l'alimentació del teu bebè, la lactància, la seua respiració o el seu desenvolupament comunicatiu, no esperes. Una primera consulta de valoració és el millor punt de partida per resoldre els teus dubtes i quedar-te tranquil·la.",

  footer_desc: 'Logopèdia neonatal, assessoria de lactància i acompanyament al desenvolupament comunicatiu a València.',
  footer_serveis_h: 'Serveis',
  footer_s1: 'Logopèdia Neonatal',
  footer_s2: 'Funcions Orals',
  footer_s3: 'Desenvolupament Comunicatiu',
  footer_s4: 'Sessions Online',
  footer_s5: 'Atenció a Domicili',
  footer_nav_h: 'Navegació',
  footer_n1: 'Inici',
  footer_n2: 'Sobre mi',
  footer_n3: 'Com funciona',
  footer_n4: 'Blog',
  footer_n5: 'Preguntes freqüents',
  footer_contact_h: 'Contacte',
  footer_copy: '© 2025 Llavors Logopèdia · Àngela Alonso Millet',
  legal1: 'Política de privacitat',
  legal2: 'Avís legal',
  legal3: 'Política de cookies',

  wa_label: 'Parlem?',

  blog_label: 'Recursos per a famílies',
  blog_h1: 'Mamà <em>Informada</em>',
  blog_sub: 'Articles, consells i recursos per a famílies. Pròximament.',
  blog_back: 'Tornar a la web',
} as const

export default ca
```

- [ ] **Crear src/i18n/es.ts**

```ts
const es = {
  nav_serveis: 'Servicios',
  nav_sobre: 'Sobre mí',
  nav_com: 'Cómo funciona',
  nav_blog: 'Mamá Informada',
  nav_reservar: 'Reservar',
  nav_cta: 'Reservar cita',

  hero_tag: 'Logopeda Neonatal · Asesora de Lactancia',
  hero_h1: 'La <em>tranquilidad</em> que necesitas para la lactancia y la alimentación de tu bebé',
  hero_sub: 'Soy Àngela. Te acompaño para que te sientas segura, confiada y puedas disfrutar de esta etapa con tu bebé, sin presión y con mucho amor.',
  hero_cta1: 'Reserva la primera consulta',
  hero_cta2: 'Escríbeme',
  hero_trust: 'Valoraciones de familias en Doctoralia',

  serveis_label: 'Lo que hago',
  serveis_h2: 'Servicios',
  serveis_sub: 'Atención especializada para bebés, niños y sus familias, desde el nacimiento hasta los 6 años.',
  s1_title: 'Logopedia Neonatal',
  s1_text: 'Asesoramiento en la lactancia materna, mixta o con biberón y en la alimentación complementaria. Desde la preparación durante el embarazo hasta el tratamiento de dificultades de succión, dolor o problemas derivados de la prematuridad o anquiloglosia. Acompañamiento en la introducción de alimentos de manera segura y respetuosa.',
  s2_title: 'Reeducación de las Funciones Orales',
  s2_text: 'Terapia miofuncional para mejorar la respiración nasal, la masticación y la deglución. Tratamientos complementarios y/o preventivos a la ortodoncia, trabajando de la mano de los odontopediatras para mejorar la calidad de la respiración y el descanso de los niños.',
  s3_title: 'Desarrollo Comunicativo y del Lenguaje',
  s3_text: 'Asesoramiento y acompañamiento en el desarrollo de la comunicación y el lenguaje desde el primer año hasta los 6 años. Buscamos estrategias y mejoramos las habilidades familiares para favorecer el aprendizaje del lenguaje en los entornos naturales del niño y en base a sus rutinas diarias.',
  mod1: "Atención a domicilio · Valencia y l'Horta",
  mod2: 'Consulta presencial · Valencia y Massamagrell',
  mod3: 'Sesiones online',

  about_badge: '+5 años acompañando familias en la primera infancia',
  sobre_label: 'Quién soy',
  sobre_h2: 'Hola, soy Àngela',
  sobre_p1: 'Soy doble titulada en Logopedia y Magisterio, especialidad en Educación Infantil. Pero más que los títulos, lo que me define es la pasión por acompañar a las familias en uno de los momentos más intensos y transformadores de la vida.',
  sobre_p2: 'Mi trayectoria profesional comenzó en el ámbito adulto — comunicación y alimentación — hasta que descubrí la primera infancia en un centro de Atención Temprana. Me enamoré de esta etapa y desde entonces no he dejado de formarme y especializarme.',
  sobre_p3: 'Fue mi propia maternidad la que hizo resurgir con fuerza mi pasión por la alimentación de los bebés. Viví en primera persona los retos de la lactancia y entendí, como nunca, lo que sienten las madres. Eso me impulsó a especializarme en <strong>disfagia neonatal y asesoría de lactancia</strong>, para poder acompañar a familias como la tuya.',
  sobre_p4: "Desde 2019 formo parte de los equipos de Atención Temprana de la Conselleria d'Educació, trabajando en la prevención, detección e intervención en niños de 0 a 6 años. Ahora, a través de Llavors, pongo toda esta experiencia al servicio de las familias en el ámbito privado.",
  cred1: 'Diplomada en Logopedia y Magisterio · Educación Infantil',
  cred2: 'Especialización en disfagia neonatal en UCIN y prematuridad',
  cred3: 'Certificación en asesoría de lactancia',
  cred4: 'Intervención logopédica en casos ortodónticos y terapia miofuncional',
  cred5: 'Psicopatología del niño de 0 a 3 años y el niño prematuro',
  cred6: 'Máster en Terapia Miofuncional Orofacial · Hospital de la Santa Creu i Sant Pau — en curso',

  com_label: 'El proceso',
  com_h2: 'Cómo funciona',
  com_sub: 'Un acompañamiento pensado para ti y tu bebé, paso a paso.',
  step1_h: 'Primera consulta',
  step1_p: 'Nos conocemos y evaluamos la situación del bebé y la familia. Escuchamos tu historia y tus preocupaciones sin prisa.',
  step2_h: 'Plan personalizado',
  step2_p: 'Diseñamos juntas el programa de trabajo, estableciendo estrategias adaptadas a las necesidades del niño y de su entorno familiar.',
  step3_h: 'Sesiones y seguimiento',
  step3_p: 'Trabajamos semana a semana, con contacto directo por WhatsApp para cualquier duda. Porque las preguntas no esperan al próximo jueves.',
  step4_h: 'Alta y resultados',
  step4_p: 'Cuando el bebé y la familia han alcanzado los objetivos y el bienestar es óptimo, cerramos el proceso. Siempre con la puerta abierta para cualquier consulta futura.',

  testi_label: 'Testimonios',
  testi_h2: 'Lo que dicen las familias',
  testi_sub: 'Valoraciones reales de familias que han confiado en Llavors Logopèdia.',
  t1_text: '"Àngela fue un punto de inflexión en nuestra lactancia. Gracias a su acompañamiento superamos las dificultades de los primeros días y pudimos disfrutar de una experiencia preciosa. Siempre disponible y con mucha paciencia."',
  t1_author: 'Laura M.',
  t1_sub: '· Mamá de una bebé de 3 meses',
  t2_text: '"Profesional, empática y muy cercana. Nos ayudó con las dificultades de alimentación de nuestro hijo desde el primer momento. Su mirada holística y su trato humano hacen que te sientas acompañada de verdad."',
  t2_author: 'Marta P.',
  t2_sub: '· Mamá de niño de 8 meses',
  t3_text: '"Su acompañamiento durante la transición a la alimentación complementaria ha sido increíble. Nos ha dado las herramientas para vivir esta etapa con tranquilidad, sin miedos ni presión. La recomendaría a todas las madres."',
  t3_author: 'Carmen R.',
  t3_sub: '· Mamá de niña de 7 meses',

  res_label: 'Empezamos',
  res_h2: 'Reserva la primera visita de valoración',
  res_sub: 'Una primera consulta sin compromiso para conocernos y ver cómo puedo ayudarte.',
  res_o1: 'Confirmación inmediata',
  res_o2: '45–60 minutos',
  res_o3: 'Sin compromiso',
  cal_title: 'Widget de Calendly',
  cal_text: 'Aquí se integrará tu calendario de Calendly. Añade tu código de embed para activar las reservas en línea.',
  cal_btn: 'Mientras tanto, escríbeme por WhatsApp',

  faq_label: 'Dudas',
  faq_h2: 'Preguntas frecuentes',
  faq1_q: '¿A partir de qué edad podéis tratar a los niños?',
  faq1_a: 'Trabajamos con bebés desde el nacimiento. En logopedia neonatal, podemos intervenir desde los primeros días de vida para problemas de lactancia y alimentación. Para el desarrollo comunicativo y del lenguaje, acompañamos desde el año hasta los 6 años.',
  faq2_q: '¿Cuánto dura una sesión?',
  faq2_a: 'Las sesiones duran entre 45 minutos y 1 hora, dependiendo de las necesidades del niño y la familia. La primera consulta de valoración suele ser un poco más larga, porque queremos conoceros bien a todos.',
  faq3_q: '¿Cuántas sesiones se necesitan?',
  faq3_a: 'Depende de cada caso. Algunas familias notan mejoras en pocas sesiones; otras necesitan un acompañamiento más prolongado. Siempre establecemos un plan personalizado y hacemos revisiones periódicas para ajustarlo a la evolución del niño.',
  faq4_q: '¿Trabajáis con el seguro médico?',
  faq4_a: 'Por el momento no trabajamos con seguros médicos. Ofrecemos atención privada porque nos permite dedicar el tiempo y la calidad que cada familia merece, sin restricciones ni prisas.',
  faq5_q: '¿Hacéis sesiones a domicilio?',
  faq5_a: "¡Sí! Ofrecemos atención a domicilio en Valencia y los municipios de l'Horta. También tenemos consulta presencial en Valencia y Massamagrell, y sesiones online para quien prefiera la comodidad de su casa.",
  faq6_q: '¿Cómo sé si mi hijo necesita logopedia?',
  faq6_a: 'Si tienes dudas sobre la alimentación de tu bebé, la lactancia, su respiración o su desarrollo comunicativo, no esperes. Una primera consulta de valoración es el mejor punto de partida para resolver tus dudas y quedarte tranquila.',

  footer_desc: 'Logopedia neonatal, asesoría de lactancia y acompañamiento al desarrollo comunicativo en Valencia.',
  footer_serveis_h: 'Servicios',
  footer_s1: 'Logopedia Neonatal',
  footer_s2: 'Funciones Orales',
  footer_s3: 'Desarrollo Comunicativo',
  footer_s4: 'Sesiones Online',
  footer_s5: 'Atención a Domicilio',
  footer_nav_h: 'Navegación',
  footer_n1: 'Inicio',
  footer_n2: 'Sobre mí',
  footer_n3: 'Cómo funciona',
  footer_n4: 'Blog',
  footer_n5: 'Preguntas frecuentes',
  footer_contact_h: 'Contacto',
  footer_copy: '© 2025 Llavors Logopèdia · Àngela Alonso Millet',
  legal1: 'Política de privacidad',
  legal2: 'Aviso legal',
  legal3: 'Política de cookies',

  wa_label: '¿Hablamos?',

  blog_label: 'Recursos para familias',
  blog_h1: 'Mamá <em>Informada</em>',
  blog_sub: 'Artículos, consejos y recursos para familias. Próximamente.',
  blog_back: 'Volver a la web',
} as const

export default es
```

- [ ] **Crear src/i18n/index.ts**

```ts
import ca from './ca'
import es from './es'

export type Lang = 'ca' | 'es'
export type Translations = typeof ca

const translations = { ca, es } as const

export function getTranslations(lang: Lang): Translations {
  return translations[lang]
}
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```
Esperado: build completado sin errores.

- [ ] **Commit**

```bash
git add src/i18n/
git commit -m "feat(slice-1): add bilingual translation files (ca/es)"
```

---

### Task 3: Assets

**Files:**
- Create: `public/images/logo.png`
- Create: `public/images/angela-hero.jpg`
- Create: `public/images/angela-about.jpg`

- [ ] **Crear carpeta y copiar imágenes**

```bash
mkdir -p public/images
cp ".aitools/content/uploads/Diseño sin título (7)-c1f6852b.png" public/images/logo.png
cp ".aitools/content/uploads/20240426_180608 (1).jpg" public/images/angela-hero.jpg
cp ".aitools/content/uploads/20240617_170611.jpg" public/images/angela-about.jpg
```

- [ ] **Commit**

```bash
git add public/images/
git commit -m "feat(slice-1): add logo and Angela photos to public/images"
```

---

### Task 4: Global CSS

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Reemplazar src/styles/global.css con el design system completo**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
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
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: 'Playfair Display', Georgia, serif;
  line-height: 1.2;
}

h2 { font-size: clamp(1.9rem, 4vw, 2.6rem); }
h3 { font-size: clamp(1.05rem, 2.5vw, 1.3rem); }

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
p { text-wrap: pretty; }

.container {
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 24px;
}

.section { padding: 90px 0; }

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pink);
  margin-bottom: 14px;
}

.section-title { margin-bottom: 48px; }
.section-title p {
  color: var(--text-soft);
  font-size: 1.05rem;
  margin-top: 12px;
  max-width: 580px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 50px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary { background: var(--pink); color: var(--white); }
.btn-primary:hover {
  background: #b82e58;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(207, 58, 105, 0.3);
}

.btn-whatsapp { background: #25d366; color: var(--white); }
.btn-whatsapp:hover {
  background: #1ebe5b;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
}

.btn-outline-pink {
  background: transparent;
  color: var(--pink);
  border: 2px solid var(--pink);
}
.btn-outline-pink:hover { background: var(--pink); color: var(--white); }

.btn-ghost {
  background: transparent;
  color: var(--text-soft);
  border: 1.5px solid var(--bg-dark);
  font-size: 0.88rem;
  padding: 10px 20px;
}
.btn-ghost:hover { border-color: var(--pink); color: var(--pink); }

@media (max-width: 600px) {
  .section { padding: 64px 0; }
}
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/styles/global.css
git commit -m "feat(slice-1): add full design system to global.css"
```

---

### Task 5: BaseLayout + WhatsAppButton

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/WhatsAppButton.astro`

- [ ] **Crear src/components/WhatsAppButton.astro**

```astro
---
import type { Lang } from '../i18n/index'

interface Props {
  lang: Lang
}

const { lang } = Astro.props
const label = lang === 'ca' ? 'Parlem?' : '¿Hablamos?'
const waUrl = 'https://wa.me/34614337743?text=Hola%2C%20m%27agradaria%20demanar%20informaci%C3%B3%20sobre%20logop%C3%A8dia'
---
<div class="wa-fab">
  <span class="wa-label">{label}</span>
  <a href={waUrl} target="_blank" rel="noopener noreferrer" class="wa-btn" aria-label="WhatsApp">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/>
    </svg>
  </a>
</div>

<style>
  .wa-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 200;
    display: flex;
    align-items: center;
  }
  .wa-label {
    background: var(--text);
    color: var(--bg);
    padding: 8px 14px 8px 16px;
    border-radius: 50px 0 0 50px;
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.25s;
    pointer-events: none;
    white-space: nowrap;
  }
  .wa-fab:hover .wa-label { opacity: 1; transform: translateX(0); }
  .wa-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #25d366;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 24px rgba(37, 211, 102, 0.45);
    transition: transform 0.2s;
  }
  .wa-fab:hover .wa-btn { transform: scale(1.05); }
  .wa-btn svg { width: 28px; height: 28px; }
</style>
```

- [ ] **Crear src/layouts/BaseLayout.astro**

```astro
---
import '../styles/global.css'
import WhatsAppButton from '../components/WhatsAppButton.astro'
import type { Lang } from '../i18n/index'

interface Props {
  lang: Lang
  title?: string
}

const { lang, title = 'Llavors Logopèdia – Àngela Alonso Millet' } = Astro.props
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" href={`${import.meta.env.BASE_URL}favicon.ico`} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>{title}</title>
  </head>
  <body>
    <slot />
    <WhatsAppButton lang={lang} />
  </body>
</html>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/WhatsAppButton.astro
git commit -m "feat(slice-1): add BaseLayout and WhatsAppButton"
```

---

### Task 6: Header

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Crear src/components/Header.astro**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import type { Lang, Translations } from '../i18n/index'

interface Props {
  t: Translations
  lang: Lang
}

const { t, lang } = Astro.props
const base = import.meta.env.BASE_URL
---
<nav>
  <div class="nav-inner">
    <a class="nav-logo" href={getRelativeLocaleUrl(lang, '/')}>
      <img src={`${base}images/logo.png`} alt="Llavors Logopèdia" height="52" />
    </a>
    <ul class="nav-links">
      <li><a href="#serveis">{t.nav_serveis}</a></li>
      <li><a href="#sobre-mi">{t.nav_sobre}</a></li>
      <li><a href="#com-funciona">{t.nav_com}</a></li>
      <li><a href={getRelativeLocaleUrl(lang, '/blog')}>{t.nav_blog}</a></li>
    </ul>
    <div class="nav-right">
      <div class="lang-switcher">
        <a
          href={getRelativeLocaleUrl('ca', '/')}
          class={`lang-btn${lang === 'ca' ? ' active' : ''}`}
        >VAL</a>
        <a
          href={getRelativeLocaleUrl('es', '/')}
          class={`lang-btn${lang === 'es' ? ' active' : ''}`}
        >ES</a>
      </div>
      <a href="#reserva" class="btn btn-primary">{t.nav_cta}</a>
      <button class="hamburger" id="hamburger" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu">
    <a href="#serveis">{t.nav_serveis}</a>
    <a href="#sobre-mi">{t.nav_sobre}</a>
    <a href="#com-funciona">{t.nav_com}</a>
    <a href={getRelativeLocaleUrl(lang, '/blog')}>{t.nav_blog}</a>
    <a href="#reserva">{t.nav_reservar}</a>
    <div class="lang-switcher mobile-lang">
      <a
        href={getRelativeLocaleUrl('ca', '/')}
        class={`lang-btn${lang === 'ca' ? ' active' : ''}`}
      >VAL</a>
      <a
        href={getRelativeLocaleUrl('es', '/')}
        class={`lang-btn${lang === 'es' ? ' active' : ''}`}
      >ES</a>
    </div>
    <a href="#reserva" class="btn btn-primary">{t.nav_cta}</a>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(242, 233, 225, 0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(207, 58, 105, 0.1);
    padding: 0 24px;
  }
  .nav-inner {
    max-width: var(--max);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    gap: 16px;
  }
  .nav-logo img { height: 52px; width: auto; }
  .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
  .nav-links a { font-size: 0.92rem; font-weight: 600; color: var(--gray); transition: color 0.2s; }
  .nav-links a:hover { color: var(--pink); }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .lang-switcher {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--bg-dark);
    border-radius: 50px;
    padding: 3px;
  }
  .lang-btn {
    padding: 5px 13px;
    border-radius: 50px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--text-soft);
    transition: all 0.2s;
  }
  .lang-btn.active {
    background: var(--white);
    color: var(--pink);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 6px;
    background: none;
    border: none;
  }
  .hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: all 0.3s;
  }
  .mobile-menu {
    display: none;
    flex-direction: column;
    background: var(--bg);
    border-top: 1px solid var(--pink-light);
    padding: 16px 24px 24px;
  }
  .mobile-menu.open { display: flex; }
  .mobile-menu a {
    padding: 13px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray);
    border-bottom: 1px solid var(--pink-light);
  }
  .mobile-lang { margin: 16px 0 8px; align-self: flex-start; border-bottom: none !important; padding: 0 !important; }
  .mobile-menu .btn { text-align: center; justify-content: center; margin-top: 8px; border-bottom: none; padding: 14px 28px; }

  @media (max-width: 960px) {
    .nav-links,
    .nav-right .btn-primary,
    .nav-right .lang-switcher { display: none; }
    .nav-right { gap: 8px; }
    .hamburger { display: flex; }
  }
</style>

<script is:inline>
  const hamburger = document.getElementById('hamburger')
  const mobileMenu = document.getElementById('mobile-menu')
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'))
    mobileMenu.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    })
  }
</script>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(slice-1): add Header with bilingual nav and mobile menu"
```

---

### Task 7: Hero

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Crear src/components/Hero.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props
const base = import.meta.env.BASE_URL
---
<section class="hero" id="inici">
  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-tag">{t.hero_tag}</div>
      <h1 set:html={t.hero_h1} />
      <p class="hero-sub">{t.hero_sub}</p>
      <div class="hero-ctas">
        <a href="#reserva" class="btn btn-primary">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {t.hero_cta1}
        </a>
        <a href="https://wa.me/34614337743" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {t.hero_cta2}
        </a>
      </div>
      <div class="hero-trust">
        <span class="hero-trust-stars" aria-hidden="true">★★★★★</span>
        <span>{t.hero_trust}</span>
      </div>
    </div>
    <div class="hero-photo-wrap">
      <div class="hero-blob" aria-hidden="true"></div>
      <img
        class="hero-photo"
        src={`${base}images/angela-hero.jpg`}
        alt="Àngela Alonso Millet – Logopeda Neonatal"
        width="480"
        height="540"
      />
    </div>
  </div>
</section>

<style>
  .hero { background: var(--bg); padding: 80px 0 60px; overflow: hidden; }
  .hero-inner {
    max-width: var(--max);
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    background: var(--pink-pale);
    border: 1px solid var(--pink-light);
    border-radius: 50px;
    padding: 6px 16px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--pink);
    margin-bottom: 24px;
  }
  .hero :global(h1) {
    font-size: clamp(2rem, 4.5vw, 3rem);
    color: var(--text);
    margin-bottom: 20px;
    line-height: 1.15;
  }
  .hero :global(h1 em) { color: var(--pink); font-style: italic; }
  .hero-sub { font-size: 1.1rem; color: var(--text-soft); margin-bottom: 36px; max-width: 480px; }
  .hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
  .hero-trust { margin-top: 40px; display: flex; align-items: center; gap: 12px; font-size: 0.88rem; color: var(--text-soft); }
  .hero-trust-stars { color: var(--pink); font-size: 1rem; letter-spacing: 2px; }
  .hero-photo-wrap { position: relative; display: flex; justify-content: center; align-items: flex-end; }
  .hero-blob {
    position: absolute;
    width: 90%; height: 90%;
    background: var(--pink-light);
    border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    top: 10%; left: 5%;
    z-index: 0;
  }
  .hero-photo {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    height: 540px;
    border-radius: 40px;
    object-fit: cover;
    object-position: 50% 8%;
    box-shadow: 0 24px 60px rgba(207, 58, 105, 0.18);
  }

  @media (max-width: 960px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-photo-wrap { order: -1; }
    .hero-photo { max-width: 320px; margin: 0 auto; height: 360px; }
  }
  @media (max-width: 600px) {
    .hero-ctas { flex-direction: column; }
    .hero-ctas :global(.btn) { text-align: center; justify-content: center; }
  }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat(slice-1): add Hero section"
```

---

### Task 8: Services

**Files:**
- Create: `src/components/Services.astro`

- [ ] **Crear src/components/Services.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props
---
<section class="services section" id="serveis">
  <div class="container">
    <div class="section-title">
      <span class="section-label">{t.serveis_label}</span>
      <h2>{t.serveis_h2}</h2>
      <p>{t.serveis_sub}</p>
    </div>
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V18h8v-2.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z"/>
            <path d="M9 18v2a1 1 0 001 1h4a1 1 0 001-1v-2"/>
          </svg>
        </div>
        <h3>{t.s1_title}</h3>
        <p>{t.s1_text}</p>
      </div>
      <div class="service-card">
        <div class="service-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9" stroke-linecap="round" stroke-width="3"/>
            <line x1="15" y1="9" x2="15.01" y2="9" stroke-linecap="round" stroke-width="3"/>
          </svg>
        </div>
        <h3>{t.s2_title}</h3>
        <p>{t.s2_text}</p>
      </div>
      <div class="service-card">
        <div class="service-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <h3>{t.s3_title}</h3>
        <p>{t.s3_text}</p>
      </div>
    </div>
    <div class="modalities">
      <div class="modality-pill">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>{t.mod1}</span>
      </div>
      <div class="modality-pill">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>{t.mod2}</span>
      </div>
      <div class="modality-pill">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        <span>{t.mod3}</span>
      </div>
    </div>
  </div>
</section>

<style>
  .services { background: var(--bg-card); }
  .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
  .service-card {
    background: var(--white);
    border-radius: var(--r);
    padding: 32px 28px;
    border: 1px solid var(--pink-light);
    transition: all 0.25s;
  }
  .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(207, 58, 105, 0.12); }
  .service-icon {
    width: 52px; height: 52px;
    background: var(--pink-pale);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .service-icon svg { width: 26px; height: 26px; stroke: var(--pink); fill: none; stroke-width: 1.8; }
  .service-card h3 { color: var(--text); margin-bottom: 10px; }
  .service-card p { color: var(--text-soft); font-size: 0.94rem; line-height: 1.6; }
  .modalities { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .modality-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1.5px solid var(--pink-light);
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gray);
  }
  .modality-pill svg { width: 17px; height: 17px; stroke: var(--pink); fill: none; stroke-width: 2; flex-shrink: 0; }

  @media (max-width: 960px) { .services-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Services.astro
git commit -m "feat(slice-1): add Services section"
```

---

### Task 9: About

**Files:**
- Create: `src/components/About.astro`

- [ ] **Crear src/components/About.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props
const base = import.meta.env.BASE_URL
---
<section class="about section" id="sobre-mi">
  <div class="container">
    <div class="about-inner">
      <div class="about-photo-wrap">
        <img
          class="about-photo"
          src={`${base}images/angela-about.jpg`}
          alt="Àngela Alonso Millet"
          width="460"
          height="520"
        />
        <div class="about-badge">{t.about_badge}</div>
      </div>
      <div class="about-text">
        <span class="section-label">{t.sobre_label}</span>
        <h2>{t.sobre_h2}</h2>
        <p>{t.sobre_p1}</p>
        <p>{t.sobre_p2}</p>
        <p set:html={t.sobre_p3} />
        <p>{t.sobre_p4}</p>
        <div class="credentials">
          <div class="credential">{t.cred1}</div>
          <div class="credential">{t.cred2}</div>
          <div class="credential">{t.cred3}</div>
          <div class="credential">{t.cred4}</div>
          <div class="credential">{t.cred5}</div>
          <div class="credential">{t.cred6}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .about { background: var(--bg); }
  .about-inner { display: grid; grid-template-columns: 1fr 1.2fr; gap: 72px; align-items: start; }
  .about-photo-wrap { position: relative; }
  .about-photo { width: 100%; border-radius: 32px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1); object-fit: cover; max-height: 520px; }
  .about-badge {
    position: absolute;
    bottom: -16px; right: -16px;
    background: var(--pink);
    color: var(--white);
    border-radius: 16px;
    padding: 16px 20px;
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.3;
    box-shadow: 0 8px 24px rgba(207, 58, 105, 0.3);
    max-width: 200px;
  }
  .about-text h2 { margin-bottom: 20px; }
  .about-text p { color: var(--text-soft); margin-bottom: 16px; }
  .about-text p :global(strong) { color: var(--text); }
  .credentials { margin-top: 32px; display: flex; flex-direction: column; gap: 8px; }
  .credential { display: flex; align-items: flex-start; gap: 10px; font-size: 0.9rem; color: var(--text-soft); }
  .credential::before {
    content: '';
    flex-shrink: 0;
    margin-top: 7px;
    width: 6px; height: 6px;
    background: var(--pink);
    border-radius: 50%;
  }

  @media (max-width: 960px) {
    .about-inner { grid-template-columns: 1fr; }
    .about-badge { position: static; margin-top: 16px; max-width: 100%; }
  }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/About.astro
git commit -m "feat(slice-1): add About section"
```

---

### Task 10: HowItWorks

**Files:**
- Create: `src/components/HowItWorks.astro`

- [ ] **Crear src/components/HowItWorks.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props

const steps = [
  { num: '01', h: t.step1_h, p: t.step1_p, icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
  { num: '02', h: t.step2_h, p: t.step2_p, icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  { num: '03', h: t.step3_h, p: t.step3_p, icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' },
  { num: '04', h: t.step4_h, p: t.step4_p, icon: '<polyline points="20 6 9 17 4 12"/>' },
]
---
<section class="how section" id="com-funciona">
  <div class="container">
    <div class="section-title">
      <span class="section-label">{t.com_label}</span>
      <h2>{t.com_h2}</h2>
      <p>{t.com_sub}</p>
    </div>
    <div class="steps-grid">
      {steps.map(step => (
        <div class="step">
          <div class="step-num" aria-hidden="true">{step.num}</div>
          <div class="step-dot" aria-hidden="true">
            <svg viewBox="0 0 24 24" set:html={step.icon} />
          </div>
          <h3>{step.h}</h3>
          <p>{step.p}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .how { background: var(--pink); color: var(--white); }
  .how .section-label { color: rgba(255, 255, 255, 0.7); }
  .how h2 { color: var(--white); }
  .how .section-title p { color: rgba(255, 255, 255, 0.75); }
  .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 4rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.2);
    line-height: 1;
    margin-bottom: 8px;
  }
  .step-dot {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  .step-dot svg { width: 22px; height: 22px; stroke: var(--white); fill: none; stroke-width: 2; }
  .step h3 { color: var(--white); margin-bottom: 10px; font-size: 1.1rem; }
  .step p { color: rgba(255, 255, 255, 0.78); font-size: 0.93rem; line-height: 1.6; }

  @media (max-width: 960px) { .steps-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .steps-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/HowItWorks.astro
git commit -m "feat(slice-1): add HowItWorks section"
```

---

### Task 11: Testimonials

**Files:**
- Create: `src/components/Testimonials.astro`

- [ ] **Crear src/components/Testimonials.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props

const cards = [
  { text: t.t1_text, author: t.t1_author, sub: t.t1_sub },
  { text: t.t2_text, author: t.t2_author, sub: t.t2_sub },
  { text: t.t3_text, author: t.t3_author, sub: t.t3_sub },
]
---
<section class="testimonials section" id="testimonis">
  <div class="container">
    <div class="section-title">
      <span class="section-label">{t.testi_label}</span>
      <h2>{t.testi_h2}</h2>
      <p>{t.testi_sub}</p>
    </div>
    <div class="testimonials-grid">
      {cards.map(card => (
        <div class="testi-card">
          <div class="testi-stars" aria-label="5 estrelles">★★★★★</div>
          <p class="testi-text">{card.text}</p>
          <div class="testi-author">{card.author} <span>{card.sub}</span></div>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .testimonials { background: var(--bg-dark); }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .testi-card {
    background: var(--white);
    border-radius: var(--r);
    padding: 32px 28px;
    border: 1px solid rgba(207, 58, 105, 0.08);
  }
  .testi-stars { color: var(--pink); font-size: 1.05rem; letter-spacing: 2px; margin-bottom: 16px; }
  .testi-text { color: var(--text-soft); font-size: 0.95rem; line-height: 1.7; margin-bottom: 20px; font-style: italic; }
  .testi-author { font-weight: 700; font-size: 0.9rem; color: var(--text); }
  .testi-author span { color: var(--text-soft); font-weight: 400; }

  @media (max-width: 960px) { .testimonials-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Testimonials.astro
git commit -m "feat(slice-1): add Testimonials section"
```

---

### Task 12: BookingPlaceholder

**Files:**
- Create: `src/components/BookingPlaceholder.astro`

- [ ] **Crear src/components/BookingPlaceholder.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props
---
<section class="booking section" id="reserva">
  <div class="container">
    <div class="section-title" style="text-align:center">
      <span class="section-label">{t.res_label}</span>
      <h2>{t.res_h2}</h2>
      <p style="margin: 0 auto">{t.res_sub}</p>
    </div>
    <div class="booking-options">
      <div class="booking-option">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>{t.res_o1}</span>
      </div>
      <div class="booking-option">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>{t.res_o2}</span>
      </div>
      <div class="booking-option">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <span>{t.res_o3}</span>
      </div>
    </div>
    <div class="calendly-wrap">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <strong>{t.cal_title}</strong>
      <p>{t.cal_text}</p>
      <a href="https://wa.me/34614337743" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {t.cal_btn}
      </a>
    </div>
  </div>
</section>

<style>
  .booking { background: var(--bg); text-align: center; }
  .booking-options { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; margin-bottom: 40px; }
  .booking-option {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gray);
    border: 1px solid var(--bg-dark);
  }
  .booking-option svg { width: 18px; height: 18px; stroke: var(--pink); fill: none; stroke-width: 2; }
  .calendly-wrap {
    max-width: 700px;
    margin: 0 auto;
    background: var(--white);
    border-radius: 24px;
    border: 1.5px solid var(--pink-light);
    min-height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    padding: 48px;
    color: var(--text-soft);
  }
  .calendly-wrap svg { width: 52px; height: 52px; stroke: var(--pink-light); fill: none; stroke-width: 1.5; }
  .calendly-wrap strong {
    display: block;
    font-size: 1.1rem;
    color: var(--text);
    font-family: 'Playfair Display', serif;
  }
  .calendly-wrap p { font-size: 0.9rem; max-width: 320px; text-align: center; }

  @media (max-width: 600px) { .booking-options { flex-direction: column; align-items: center; } }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/BookingPlaceholder.astro
git commit -m "feat(slice-1): add BookingPlaceholder section"
```

---

### Task 13: FAQ

**Files:**
- Create: `src/components/FAQ.astro`

- [ ] **Crear src/components/FAQ.astro**

```astro
---
import type { Translations } from '../i18n/index'

interface Props {
  t: Translations
}

const { t } = Astro.props

const items = [
  { q: t.faq1_q, a: t.faq1_a },
  { q: t.faq2_q, a: t.faq2_a },
  { q: t.faq3_q, a: t.faq3_a },
  { q: t.faq4_q, a: t.faq4_a },
  { q: t.faq5_q, a: t.faq5_a },
  { q: t.faq6_q, a: t.faq6_a },
]
---
<section class="faq section" id="faq">
  <div class="container">
    <div class="section-title" style="text-align:center">
      <span class="section-label">{t.faq_label}</span>
      <h2>{t.faq_h2}</h2>
    </div>
    <div class="faq-list">
      {items.map((item, i) => (
        <div class="faq-item">
          <button class="faq-q" data-faq={i} aria-expanded="false">
            <span>{item.q}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </button>
          <div class="faq-a" id={`faq-${i}`} role="region">
            {item.a}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .faq { background: var(--bg-dark); }
  .faq-list { max-width: 740px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid rgba(87, 87, 84, 0.15); }
  .faq-q {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 22px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-family: 'Nunito', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    transition: color 0.2s;
  }
  .faq-q:hover, .faq-q.active { color: var(--pink); }
  .faq-icon {
    flex-shrink: 0;
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s;
    font-size: 1.2rem;
    line-height: 1;
  }
  .faq-q.active .faq-icon {
    background: var(--pink);
    border-color: var(--pink);
    color: var(--white);
    transform: rotate(45deg);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, padding 0.25s;
    font-size: 0.97rem;
    color: var(--text-soft);
    line-height: 1.7;
  }
  .faq-a.open { max-height: 300px; padding-bottom: 20px; }
</style>

<script is:inline>
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('active')
      document.querySelectorAll('.faq-q').forEach(b => {
        b.classList.remove('active')
        b.setAttribute('aria-expanded', 'false')
        const ans = document.getElementById('faq-' + b.dataset.faq)
        if (ans) ans.classList.remove('open')
      })
      if (!isActive) {
        btn.classList.add('active')
        btn.setAttribute('aria-expanded', 'true')
        const ans = document.getElementById('faq-' + btn.dataset.faq)
        if (ans) ans.classList.add('open')
      }
    })
  })
</script>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/FAQ.astro
git commit -m "feat(slice-1): add FAQ accordion"
```

---

### Task 14: Footer

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Crear src/components/Footer.astro**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import type { Lang, Translations } from '../i18n/index'

interface Props {
  t: Translations
  lang: Lang
}

const { t, lang } = Astro.props
const base = import.meta.env.BASE_URL
---
<footer>
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <img src={`${base}images/logo.png`} alt="Llavors Logopèdia" width="120" height="36" class="footer-logo" />
        <p>{t.footer_desc}</p>
        <div class="footer-social">
          <a href="https://www.instagram.com/llavors.de.llet" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/></svg>
          </a>
          <a href="https://www.facebook.com/angelamillet.logopedadomicili/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/%C3%A0ngela-alonso-a2015240/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="https://wa.me/34614337743" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="white" stroke="none" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>{t.footer_serveis_h}</h4>
        <ul>
          <li><a href="#serveis">{t.footer_s1}</a></li>
          <li><a href="#serveis">{t.footer_s2}</a></li>
          <li><a href="#serveis">{t.footer_s3}</a></li>
          <li><a href="#serveis">{t.footer_s4}</a></li>
          <li><a href="#serveis">{t.footer_s5}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{t.footer_nav_h}</h4>
        <ul>
          <li><a href="#inici">{t.footer_n1}</a></li>
          <li><a href="#sobre-mi">{t.footer_n2}</a></li>
          <li><a href="#com-funciona">{t.footer_n3}</a></li>
          <li><a href={getRelativeLocaleUrl(lang, '/blog')}>{t.footer_n4}</a></li>
          <li><a href="#faq">{t.footer_n5}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{t.footer_contact_h}</h4>
        <ul>
          <li><a href="mailto:logopeda.angela@gmail.com">logopeda.angela@gmail.com</a></li>
          <li><a href="tel:+34614337743">614 33 77 43</a></li>
          <li><a href="https://www.instagram.com/llavors.de.llet" target="_blank" rel="noopener noreferrer">@llavors.de.llet</a></li>
          <li style="margin-top:8px">
            <a href="#reserva" class="btn btn-outline-pink" style="font-size:0.85rem;padding:10px 20px">{t.nav_cta}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>{t.footer_copy}</span>
      <div class="footer-legal">
        <a href="#">{t.legal1}</a>
        <a href="#">{t.legal2}</a>
        <a href="#">{t.legal3}</a>
      </div>
    </div>
  </div>
</footer>

<style>
  footer { background: var(--text); color: var(--bg); padding: 64px 0 32px; }
  .footer-top {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid rgba(242, 233, 225, 0.1);
    margin-bottom: 32px;
  }
  .footer-logo { filter: brightness(0) invert(1); margin-bottom: 16px; }
  .footer-brand p { font-size: 0.88rem; opacity: 0.65; line-height: 1.6; max-width: 220px; }
  .footer-social { display: flex; gap: 12px; margin-top: 20px; }
  .social-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(242, 233, 225, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .social-icon:hover { background: var(--pink); }
  .social-icon svg { width: 17px; height: 17px; stroke: var(--bg); fill: none; stroke-width: 2; }
  .footer-col h4 {
    font-family: 'Nunito', sans-serif;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
    margin-bottom: 16px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 0.9rem; opacity: 0.75; transition: opacity 0.2s; }
  .footer-col a:hover { opacity: 1; }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.82rem;
    opacity: 0.5;
  }
  .footer-legal { display: flex; gap: 20px; flex-wrap: wrap; }
  .footer-legal a { opacity: 0.8; }
  .footer-legal a:hover { opacity: 1; }

  @media (max-width: 960px) { .footer-top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) {
    .footer-top { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; align-items: flex-start; }
  }
</style>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(slice-1): add Footer"
```

---

### Task 15: Landing pages

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/es/index.astro`

- [ ] **Reemplazar src/pages/index.astro (landing en CA)**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Header from '../components/Header.astro'
import Hero from '../components/Hero.astro'
import Services from '../components/Services.astro'
import About from '../components/About.astro'
import HowItWorks from '../components/HowItWorks.astro'
import Testimonials from '../components/Testimonials.astro'
import BookingPlaceholder from '../components/BookingPlaceholder.astro'
import FAQ from '../components/FAQ.astro'
import Footer from '../components/Footer.astro'
import { getTranslations } from '../i18n/index'

const lang = 'ca' as const
const t = getTranslations(lang)
---
<BaseLayout lang={lang}>
  <Header t={t} lang={lang} />
  <main>
    <Hero t={t} />
    <Services t={t} />
    <About t={t} />
    <HowItWorks t={t} />
    <Testimonials t={t} />
    <BookingPlaceholder t={t} />
    <FAQ t={t} />
  </main>
  <Footer t={t} lang={lang} />
</BaseLayout>
```

- [ ] **Crear src/pages/es/index.astro (landing en ES)**

Crear el directorio `src/pages/es/` si no existe, luego crear el fichero:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro'
import Header from '../../components/Header.astro'
import Hero from '../../components/Hero.astro'
import Services from '../../components/Services.astro'
import About from '../../components/About.astro'
import HowItWorks from '../../components/HowItWorks.astro'
import Testimonials from '../../components/Testimonials.astro'
import BookingPlaceholder from '../../components/BookingPlaceholder.astro'
import FAQ from '../../components/FAQ.astro'
import Footer from '../../components/Footer.astro'
import { getTranslations } from '../../i18n/index'

const lang = 'es' as const
const t = getTranslations(lang)
---
<BaseLayout lang={lang}>
  <Header t={t} lang={lang} />
  <main>
    <Hero t={t} />
    <Services t={t} />
    <About t={t} />
    <HowItWorks t={t} />
    <Testimonials t={t} />
    <BookingPlaceholder t={t} />
    <FAQ t={t} />
  </main>
  <Footer t={t} lang={lang} />
</BaseLayout>
```

- [ ] **Verificar que el build pasa**

```bash
npm run build
```
Esperado: se generan `dist/index.html` y `dist/es/index.html`.

- [ ] **Commit**

```bash
git add src/pages/index.astro src/pages/es/
git commit -m "feat(slice-1): add CA and ES landing pages"
```

---

### Task 16: Blog placeholder

**Files:**
- Create: `src/pages/blog.astro`
- Create: `src/pages/es/blog.astro`

- [ ] **Crear src/pages/blog.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'
import { getTranslations } from '../i18n/index'

const lang = 'ca' as const
const t = getTranslations(lang)
---
<BaseLayout lang={lang} title="Mamà Informada · Llavors Logopèdia">
  <Header t={t} lang={lang} />
  <main class="blog-placeholder">
    <div class="container">
      <span class="section-label">{t.blog_label}</span>
      <h1 set:html={t.blog_h1} />
      <p>{t.blog_sub}</p>
      <a href="/" class="btn btn-primary" style="margin-top:2rem">{t.blog_back}</a>
    </div>
  </main>
  <Footer t={t} lang={lang} />
</BaseLayout>

<style>
  .blog-placeholder {
    min-height: 60vh;
    display: flex;
    align-items: center;
    padding: 80px 0;
  }
  .blog-placeholder h1 {
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    margin: 10px 0 16px;
  }
  .blog-placeholder h1 :global(em) { color: var(--pink); font-style: italic; }
  .blog-placeholder p { color: var(--text-soft); font-size: 1.05rem; max-width: 480px; }
</style>
```

- [ ] **Crear src/pages/es/blog.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro'
import Header from '../../components/Header.astro'
import Footer from '../../components/Footer.astro'
import { getTranslations } from '../../i18n/index'

const lang = 'es' as const
const t = getTranslations(lang)
---
<BaseLayout lang={lang} title="Mamá Informada · Llavors Logopèdia">
  <Header t={t} lang={lang} />
  <main class="blog-placeholder">
    <div class="container">
      <span class="section-label">{t.blog_label}</span>
      <h1 set:html={t.blog_h1} />
      <p>{t.blog_sub}</p>
      <a href="/es/" class="btn btn-primary" style="margin-top:2rem">{t.blog_back}</a>
    </div>
  </main>
  <Footer t={t} lang={lang} />
</BaseLayout>

<style>
  .blog-placeholder {
    min-height: 60vh;
    display: flex;
    align-items: center;
    padding: 80px 0;
  }
  .blog-placeholder h1 {
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    margin: 10px 0 16px;
  }
  .blog-placeholder h1 :global(em) { color: var(--pink); font-style: italic; }
  .blog-placeholder p { color: var(--text-soft); font-size: 1.05rem; max-width: 480px; }
</style>
```

- [ ] **Verificar que el build pasa y genera las 4 páginas**

```bash
npm run build
```
Esperado: `dist/index.html`, `dist/es/index.html`, `dist/blog/index.html`, `dist/es/blog/index.html`.

- [ ] **Commit**

```bash
git add src/pages/blog.astro src/pages/es/blog.astro
git commit -m "feat(slice-1): add blog placeholder pages (ca/es)"
```

---

### Task 17: Verificación final y visual

- [ ] **Arrancar servidor de desarrollo**

```bash
npm run dev
```
Abrir `http://localhost:4321/llavors-website/` en el navegador.

- [ ] **Verificar landing CA en escritorio (1280px)**

Comprobar visualmente:
- Nav sticky con logo, links, lang switcher y CTA
- Hero: foto de Àngela visible con blob de fondo rosa
- Services: 3 cards + 3 pills de modalidad
- About: foto + badge + credenciales
- HowItWorks: 4 pasos sobre fondo rosa
- Testimonials: 3 cards
- BookingPlaceholder: pills informativas + recuadro placeholder
- FAQ: acordeón funciona (clic abre/cierra, solo uno abierto a la vez)
- Footer: 4 columnas, iconos de redes sociales
- WhatsApp FAB: visible en esquina inferior derecha, label aparece en hover

- [ ] **Verificar landing ES en escritorio**

Navegar a `http://localhost:4321/llavors-website/es/`.
Comprobar que todos los textos están en castellano y el lang switcher muestra "ES" como activo.

- [ ] **Verificar responsive en móvil (375px)**

Usar DevTools (F12 → emulación móvil). Comprobar:
- Hamburger visible, nav links ocultos
- Menú hamburguesa abre/cierra correctamente
- Hero: foto sobre el texto
- Services: tarjetas en columna única
- Footer: columnas apiladas

- [ ] **Verificar links del nav**

- "Serveis" → scroll a `#serveis`
- "VAL" / "ES" → navega entre `/llavors-website/` y `/llavors-website/es/`
- "Mamà Informada" → lleva a `/llavors-website/blog`
- "Reserva la cita" → scroll a `#reserva`

- [ ] **Build de producción limpio**

```bash
npm run build && npm run preview
```
Abrir `http://localhost:4321/llavors-website/` y verificar que todo funciona desde los archivos compilados.

- [ ] **Marcar slice en CLAUDE.md como completado**

En `CLAUDE.md`, cambiar `Slice 1: Landing estática (contenido real, sin integraciones)` por `Slice 1: Landing estática ✓`.

- [ ] **Commit final**

```bash
git add CLAUDE.md
git commit -m "feat(slice-1): complete static landing — CA/ES bilingual, all sections"
```

- [ ] **Abrir PR a develop**

```bash
gh pr create --title "Slice 1: Landing estática bilingüe" --body "$(cat <<'EOF'
## Summary
- Landing completa con diseño real fiel al mockup de Claude Design
- Bilingüe CA/ES via Astro i18n routing (prefixDefaultLocale: false)
- 9 secciones: Hero, Services, About, HowItWorks, Testimonials, BookingPlaceholder, FAQ, Footer, WhatsApp FAB
- Blog placeholder en /blog y /es/blog

## Test plan
- [ ] Build sin errores: npm run build
- [ ] Landing CA en / se ve correctamente en 375px y 1280px
- [ ] Landing ES en /es/ muestra todos los textos en castellano
- [ ] Lang switcher navega entre locales
- [ ] Acordeón FAQ funciona
- [ ] WhatsApp FAB visible en todas las páginas
- [ ] Links de redes sociales apuntan a URLs correctas

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
