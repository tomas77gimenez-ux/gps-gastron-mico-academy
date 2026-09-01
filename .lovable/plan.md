# Relevamiento: modo claro/oscuro + idioma

Todo lo de abajo sale de búsquedas hechas sobre el proyecto actual, no de supuestos.

---

## Barrido 1 — Modo claro / oscuro

### 1.1 Colores escritos a mano en `src/**` (sin `styles.css`)

Buena noticia: es muy poco. Coincidencias de `rgba(`, hex y `oklch(`:

| Archivo | Apariciones |
|---|---|
| src/lib/email-templates/_styles.ts | 9 |
| src/routes/index.tsx | 5 |
| src/lib/email-templates/novedades.tsx | 2 |
| src/routes/tienda.tsx | 1 |
| src/routes/registro.tsx | 1 |
| src/routes/planes.tsx | 1 |
| src/routes/login.tsx | 1 |
| src/routes/cursos.tsx | 1 |
| src/components/visual/GlassCard.tsx | 1 |
| src/components/ui/chart.tsx | 1 |
| src/components/HeroBanner.tsx | 1 |

Total: 24 apariciones en 11 archivos. Los 11 de `email-templates` no cuentan para el tema (los mails van siempre con fondo propio, no siguen el tema del navegador). Quedan **13 apariciones reales en 9 archivos de UI**.

Dato importante: hoy la app **no tiene ningún modo claro**. `dark:` aparece 1 sola vez en todo `src/**/*.tsx`, y no existe ningún toggle de tema (`Navbar.tsx` no tiene ninguna referencia a `theme`, `dark` ni `documentElement`). Es una app dark-only con una sola paleta en `:root`.

### 1.2 Utilidades de `styles.css` que asumen fondo oscuro

Confirmo tus cuatro y aparecen más. Lista completa:

1. `--border` (blanco 14%), `--border-strong` (28%), `--input` (16%), `--sidebar-border` (12%) — desaparecen sobre claro.
2. `.grid-lines` — dos gradientes de blanco al 3,5% + `mask-image` con `black`.
3. `@utility shine` — barrido de blanco al 35%.
4. `body::before` — ruido SVG al 3% de opacidad: sobre claro se ve como suciedad gris.
5. `--glow-gold` / `--glow-gold-soft` — glows de dorado pensados para brillar sobre negro; sobre blanco quedan sucios.
6. `.gradient-border-gold` — usa `linear-gradient(var(--card), var(--card))` como padding-box: funciona si `--card` se redefine, pero el borde dorado al 15% pierde contraste en claro.
7. `.text-gradient-brand` — dorado sobre claro baja mucho de legibilidad (el `#F0D080` del medio es casi invisible sobre blanco).
8. `@utility glass` — `color-mix(card 62%, transparent)` + blur: en claro hay que subir la opacidad o el panel se vuelve ilegible.
9. `--primary-foreground: #050505` y `--accent-foreground` — hoy negro sobre dorado; sigue sirviendo, pero hay que revisarlos como par.
10. `--destructive-foreground: oklch(0.97 0 0)` — casi blanco fijo.

### 1.3 Cuántos tokens hay que redefinir

`styles.css` declara **106 variables `--`** en total; **51 están en `:root`**. De esas 51:

- 3 son no-color (`--radius`, `--font-display`, `--font-body`) → no se tocan.
- **48 son tokens de color/efecto que hay que redefinir para una paleta clara completa**, incluidos los 3 de glow/gradiente (`--gradient-brand`, `--glow-gold`, `--glow-gold-soft`).

En la práctica: se copia el bloque `:root` completo, se lo convierte en la paleta clara, y la paleta oscura pasa a `.dark` (o al revés). El `@theme inline` de arriba (los ~55 mapeos) no se toca: ya apunta a variables, así que hereda el tema solo.

### 1.4 Tema sin parpadeo en TanStack Start (SSR)

El problema: el HTML lo genera el servidor, y hoy `<html lang="en">` en `src/routes/__root.tsx` no lleva clase de tema. Si el tema se lee de `localStorage` en un `useEffect`, se pinta oscuro y salta a claro después de hidratar. Igual que hoy pasa con el idioma.

Mecanismo propuesto (dos piezas, ninguna con parpadeo):

1. **Cookie `gps-theme`**, no `localStorage`. El servidor la lee en un `beforeLoad`/`loader` del root y devuelve `theme` en el contexto del root. `RootShell` renderiza `<html className={theme}>` ya correcto en el primer byte. La cookie se escribe desde el cliente con `document.cookie` al cambiar el tema (misma función que actualiza `documentElement.classList`).
2. **Script inline de respaldo** en `head.scripts` de `__root.tsx`, antes de la hidratación, que sincroniza la clase con `prefers-color-scheme` cuando no hay cookie. Es el único caso en que el servidor no puede saber el tema.

Se agrega `@custom-variant`/clase `.dark` (ya existe: `@custom-variant dark (&:is(.dark *))`, línea 4 — solo falta que alguien ponga la clase). Y un `<meta name="color-scheme">` para que los controles nativos y el scrollbar acompañen.

---

## Barrido 2 — Idioma

### 2.1 Qué soporta hoy `src/lib/i18n.tsx`

- 533 líneas, un diccionario plano de claves con `es` / `en` / `pt`. Tres idiomas.
- `t(key)`: si la clave **no existe en el diccionario** devuelve **la clave cruda** (`return key`). Si existe pero falta el idioma, cae a `es`, después `en`, y por último la clave.
- Tipado: `t()` acepta solo `keyof typeof translations`, así que una clave inexistente la caza el typecheck. El riesgo real no es la clave faltante, es el texto que nunca pasó por `t()`.
- El idioma se guarda en `localStorage` y se lee en un `useEffect` → arranca siempre en `es` y parpadea al idioma guardado tras hidratar. Mismo problema que el tema, misma solución (cookie).

### 2.2 Cobertura: 18 de 113

Solo **18 archivos** de `src/**` usan `useI18n`. Hay **113 archivos** en `src/routes/**` y `src/components/**`. Archivos con texto en español **sin** `useI18n` (conteo de cadenas con acentos/signos, es un piso, no un techo):

| Archivo | Cadenas |
|---|---|
| src/components/admin/SalaProManager.tsx | 22 |
| src/components/admin/CourseManager.tsx | 22 |
| src/components/admin/LessonManager.tsx | 16 |
| src/routes/sala-pro.tsx | 15 |
| src/routes/reset-password.tsx | 14 |
| src/components/tools/BreakEvenTool.tsx | 14 |
| src/routes/dashboard.tsx | 11 |
| src/routes/admin.tsx | 11 |
| src/components/tools/CashControlTool.tsx | 11 |
| src/components/DRERealtimeTracker.tsx | 11 |
| src/components/dashboard/MetricsStrip.tsx | 10 |
| src/components/admin/UserManager.tsx | 10 |
| src/routes/unsubscribe.tsx | 9 |
| src/routes/registro.tsx | 9 |
| src/components/admin/BunnySync.tsx | 9 |
| src/components/tools/RecipeTool.tsx | 8 |
| src/routes/asistente.tsx | 7 |
| src/routes/__root.tsx | 7 |
| src/components/admin/NovedadesSender.tsx | 7 |
| src/components/admin/MetricsPanel.tsx | 7 |
| src/components/admin/MaterialUpload.tsx | 7 |
| src/routes/forgot-password.tsx | 6 |
| src/components/tools/ToolUI.tsx | 6 |
| src/components/tools/MonthlyDreTool.tsx | 6 |
| src/components/admin/LiveEventManager.tsx | 6 |
| src/routes/herramientas.index.tsx | 5 |
| src/routes/herramientas.fichas-tecnicas.tsx | 5 |
| src/routes/checkout.return.tsx | 5 |
| src/components/tools/CmvMonitorTool.tsx | 5 |
| src/routes/herramientas.punto-equilibrio.tsx | 3 |
| src/routes/herramientas.monitor-cmv.tsx | 3 |
| src/routes/herramientas.dre.tsx | 3 |
| src/routes/herramientas.control-caja.tsx | 3 |
| src/components/dashboard/NovedadesSection.tsx | 3 |
| src/components/pro/ProVideoPlayer.tsx | 1 |
| src/components/dashboard/ProximoEnVivoCard.tsx | 1 |
| src/components/StripeEmbeddedCheckout.tsx | 1 |
| src/components/HeroBanner.tsx | 1 |

38 archivos, ~330 cadenas de piso. Confirmado tu diagnóstico: `dashboard.tsx` y `MonthlyDreTool.tsx` no importan `useI18n`. Además, archivos que **sí** usan `t()` conservan cadenas fijas (`index.tsx` 14, `tienda.tsx` 13, `planes.tsx` 4, `perfil.tsx` 4, `cursos.tsx` 5, `Navbar.tsx` 4) — la migración fue parcial.

### 2.3 Por categoría

Ninguna de estas categorías pasa por `t()` hoy, salvo excepciones sueltas.

- **`toast.*`** — ~70 llamadas. Top: SalaProManager 15, UserManager 10, RecipeTool 9, CashControlTool 7, perfil 6, cursos_.$id 6, NovedadesSender 5, CourseManager 5.
- **`placeholder=`** — ~60. Top: SalaProManager 8, LessonManager 8, RecipeTool 7, CashControlTool 5, BreakEvenTool 5, MonthlyDreTool 4, CmvMonitorTool 4, CourseManager 4, DREQuestionnaire 3, registro 3.
- **`aria-label=`** — ~22, de los cuales 6 son de `components/ui/*` (shadcn, en inglés, se dejan). Propios: RecipeTool 5, Navbar 4, BreakEvenTool 2, Footer 2, perfil, dashboard, MonthlyDreTool, CashControlTool, NovedadesBanner.
- **`alt=`** — 12 en 8 archivos (cursos_.$id 4, LessonManager 2, y uno cada uno en perfil, index, dashboard, cursos, CourseManager, Navbar). Varios son `alt` derivados del título del curso, o sea contenido de base: no se traducen.
- **`<title>` / meta** — el `head()` de cada ruta está escrito en español fijo. `name: "description"` aparece en 12+ rutas; `title:` en `head()` en todas. `__root.tsx` también fija título y descripción en español. Esto es lo más delicado: el `head()` se resuelve en el servidor, donde no hay contexto de React, así que **no se puede usar `t()` ahí**. Requiere que el idioma viaje por cookie hasta el contexto del router (misma pieza que el tema).

### 2.4 Qué NO se traduce: contenido de base

Verificado contra `src/integrations/supabase/types.ts` y las consultas del código:

| Contenido | De dónde sale | Traducible en base |
|---|---|---|
| Títulos y descripciones de cursos | `courses` | **Sí**: `title_en`, `title_pt`, `description_en`, `description_pt` |
| Títulos y descripciones de clases | `lessons` | **Sí**: mismas 4 columnas |
| Materiales descargables | `course_materials` | No hay columnas `_en`/`_pt` |
| Novedades | `novedades` | No hay columnas `_en`/`_pt` |
| Casos y grabaciones de Sala Pro | `pro_cases`, `pro_recordings`, `pro_sessions` | No hay columnas `_en`/`_pt` |
| Archivos de Gerente Digital | `gd_files`, `gerentes_digitales` | No hay columnas `_en`/`_pt` |

Todo eso **sale de la base, no del diccionario** — confirmado.

Una excepción a corregir: **los productos de la tienda no salen de la base**. En `src/routes/tienda.tsx` línea 49 hay un `const products: Product[] = [...]` con los seis productos y sus textos hardcodeados. Hoy no son ni diccionario ni base.

Y el helper `loc()` de `src/lib/localize.ts` solo se usa en 3 archivos (`perfil.tsx`, `cursos.tsx`, `cursos_.$id.tsx`). El dashboard nuevo, `NovedadesSection` y `NovedadesBanner` muestran títulos de curso/clase **sin** pasar por `loc()`, así que ahí el contenido queda en español aunque el usuario esté en inglés.

---

## Orden de trabajo propuesto: 5 tandas

La regla es que ninguna tanda deje la app en un estado peor que el anterior.

**Tanda 1 — Infraestructura compartida (sin cambio visible).**
Cookie + contexto del root para tema e idioma, script inline anti-parpadeo, `<html>` con clase y `lang` correctos desde el servidor. Idioma pasa de `localStorage` a cookie. Nada cambia de aspecto: solo desaparece el parpadeo de idioma que ya existe hoy. Es la base de todo lo demás, y hay que hacerla primero porque el `head()` de las rutas la necesita.

**Tanda 2 — Paleta clara completa.**
Los 48 tokens de color duplicados: oscuro en `.dark`, claro en `:root`. Bordes translúcidos pasan a color sólido por tema. Se arreglan las 10 utilidades que asumen oscuro (grid-lines, shine, ruido, glows, glass, gradient-border, text-gradient). Toggle de tema en el Navbar. Se limpian las 13 apariciones de color a mano en los 9 archivos de UI. Al final: repaso visual pantalla por pantalla en los dos modos.

**Tanda 3 — Idioma en las pantallas que ve el alumno que paga.**
`dashboard.tsx`, `MetricsStrip`, `ProximoEnVivoCard`, `NovedadesSection`, `sala-pro.tsx`, `cursos*`, `perfil`, `planes`, `tienda`, `checkout.return`, `asistente`, y las 6 rutas de `herramientas.*`. Incluye toasts, placeholders y aria-labels de esos archivos, más `loc()` donde hoy falta. También los `head()` de cada ruta, que ya pueden leer el idioma de la Tanda 1.

**Tanda 4 — Las herramientas por dentro.**
`MonthlyDreTool`, `CmvMonitorTool`, `CashControlTool`, `BreakEvenTool`, `RecipeTool`, `ToolUI`, `DREQuestionnaire`, `DRERealtimeTracker`. Es el volumen más grande de placeholders y toasts, y son formularios con estado: conviene una tanda propia para poder probar cada herramienta guardando datos de verdad.

**Tanda 5 — Auth, y decisión sobre el panel admin.**
`login`, `registro`, `forgot-password`, `reset-password`, `unsubscribe`. Y a definir: los 7 archivos de `components/admin/*` suman ~100 cadenas y los usás solo vos. Mi recomendación es **dejar el admin en español fijo** y no gastar una tanda ahí; si lo querés traducido igual, va al final.

**Decisión pendiente para vos:** los productos de la tienda están hardcodeados en `tienda.tsx`. ¿Los movemos a la base (con columnas `_en`/`_pt`, como cursos) o los dejamos en el diccionario de i18n? La primera opción te deja editarlos desde el admin sin tocar código; la segunda es más rápida ahora.
