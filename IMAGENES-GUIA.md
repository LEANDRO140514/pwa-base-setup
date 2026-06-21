# Guía de Imágenes — Universidad Latino PWA

> Todas las imágenes actuales son placeholders de Unsplash. Este documento define exactamente qué imagen se necesita, dónde se usa y en qué tamaño, para hacer la sustitución definitiva.

---

## ⚠️ Imágenes repetidas detectadas

| Imagen Unsplash | Aparece en |
|---|---|
| `photo-1576091160550` (Salud) | Área card "Salud" **+ Benefit card "Prácticas reales"** |
| `photo-1518770660439` (Tecnología) | Área card "Tecnología" **+ Benefit card "Tecnología educativa"** |

---

## 📂 Imágenes por sección

---

### 🏠 INICIO

#### 1. Hero — Fondo pantalla completa
| Campo | Valor |
|---|---|
| **Nombre de archivo** | `hero-background.jpg` |
| **Ruta destino** | `/public/hero-background.jpg` |
| **Tamaño** | **1600 × 900 px** (16:9) |
| **Formato** | JPG o WebP |
| **Uso** | Fondo absoluto que cubre toda la pantalla (`min-h-screen`) detrás de un video. Se ve solo mientras el video carga. |
| **Contenido sugerido** | Estudiantes universitarios en campus, ambiente moderno, iluminación natural |
| **URL actual** | `photo-1523050854058` |

---

#### 2. Bloque CTA — Fondo "Inscripciones Abiertas"
| Campo | Valor |
|---|---|
| **Nombre de archivo** | `cta-background.jpg` |
| **Ruta destino** | `/public/cta-background.jpg` |
| **Tamaño** | **1600 × 700 px** |
| **Formato** | JPG o WebP |
| **Uso** | Fondo de la sección de conversión (`min-h-[60vh]`). Cubierto por overlay oscuro de izquierda. |
| **Contenido sugerido** | Campus o aula amplia, vista aérea o exterior del edificio UNILATINO |
| **URL actual** | `photo-1541339907198` |

---

#### 3–7. Cards de Áreas (filtro de carreras)
> Aspecto **4:3** — se renderizan a ~400×300 px en móvil, ~280×210 px en grid desktop
> Tamaño recomendado de generación: **800 × 600 px**

| # | Nombre de archivo | Área | Contenido sugerido |
|---|---|---|---|
| 3 | `area-derecho.jpg` | **Derecho** | Sala de audiencias, libros de leyes, toga y birrete |
| 4 | `area-salud.jpg` | **Salud** | Médico o enfermero en clínica/hospital, bata blanca |
| 5 | `area-negocios.jpg` | **Negocios** | Reunión corporativa, ejecutivos, gráficas de crecimiento |
| 6 | `area-gastronomia.jpg` | **Gastronomía** | Chef cocinando, platillos elaborados, cocina profesional |
| 7 | `area-tecnologia.jpg` | **Tecnología** | Programador en laptop, pantallas de código, servidor |

**Rutas destino:** `/public/areas/area-derecho.jpg` etc.

---

#### 8–13. Benefit Cards ("¿Por qué estudiar aquí?")
> Aspecto **4:3** — ~300×225 px en display
> Tamaño recomendado de generación: **600 × 450 px**

| # | Nombre de archivo | Título | Contenido sugerido |
|---|---|---|---|
| 8 | `benefit-sep.jpg` | **Validez SEP** | Diploma o título enmarcado, sello oficial |
| 9 | `benefit-flexibilidad.jpg` | **Flexibilidad** | Estudiante con laptop desde casa o café |
| 10 | `benefit-empleabilidad.jpg` | **Empleabilidad** | Profesionista en entrevista o primer día laboral |
| 11 | `benefit-practicas.jpg` | **Prácticas reales** | Estudiantes en laboratorio, clínica o empresa |
| 12 | `benefit-internacional.jpg` | **Internacionalización** | Mapa del mundo, avión, intercambio estudiantil |
| 13 | `benefit-tecnologia.jpg` | **Tecnología educativa** | Tablet/computadora con plataforma educativa, IA |

**Rutas destino:** `/public/benefits/benefit-sep.jpg` etc.

---

### 📚 CARRERAS (página `/carreras`)

> Las carreras se organizan por área. Cada `CareerSection` es una sección fullscreen con fondo con efecto parallax.
> Las imágenes de área se **comparten** con las Area Cards de Inicio.

| Imagen | Uso en Carreras | Tamaño |
|---|---|---|
| `area-derecho.jpg` | Fondo fullscreen de todas las carreras del área **Derecho** | **1600 × 900 px** |
| `area-salud.jpg` | Fondo fullscreen de todas las carreras del área **Salud** | **1600 × 900 px** |
| `area-negocios.jpg` | Fondo fullscreen de todas las carreras del área **Negocios** | **1600 × 900 px** |
| `area-gastronomia.jpg` | Fondo fullscreen de todas las carreras del área **Gastronomía** | **1600 × 900 px** |
| `area-tecnologia.jpg` | Fondo fullscreen de todas las carreras del área **Tecnología** | **1600 × 900 px** |

> **Nota:** Se necesitan 2 versiones de cada imagen de área:
> - `/public/areas/area-[nombre]-card.jpg` → **800×600 px** para las cards cuadradas (Inicio)
> - `/public/areas/area-[nombre]-hero.jpg` → **1600×900 px** para fondos fullscreen (Carreras + CarreraDetalle)
>
> O una sola imagen a **1600×900 px** y que el navegador la escale (más simple).

---

### 🎓 CARRERA DETALLE (página `/carrera/:slug`)

> El hero de cada carrera usa la misma imagen de área.
> Tamaño renderizado: `min-h-[65vh]` en móvil, `min-h-[75vh]` en desktop (~800 px alto).

| Área | Imagen usada | Tamaño recomendado |
|---|---|---|
| Derecho | `area-derecho.jpg` | **1600 × 900 px** |
| Salud | `area-salud.jpg` | **1600 × 900 px** |
| Negocios | `area-negocios.jpg` | **1600 × 900 px** |
| Gastronomía | `area-gastronomia.jpg` | **1600 × 900 px** |
| Tecnología | `area-tecnologia.jpg` | **1600 × 900 px** |

> Si una carrera tiene campo `image` en Supabase, ese valor sobreescribe la imagen de área. Puedes subir imágenes específicas por carrera desde el Admin.

---

## 📋 Resumen de archivos a generar

| # | Archivo | Tamaño | Secciones donde se usa |
|---|---|---|---|
| 1 | `hero-background.jpg` | 1600×900 | Inicio → Hero fondo |
| 2 | `cta-background.jpg` | 1600×700 | Inicio → Bloque CTA |
| 3 | `areas/area-derecho.jpg` | 1600×900 | Inicio (card 4:3) · Carreras (fullscreen) · CarreraDetalle (hero) |
| 4 | `areas/area-salud.jpg` | 1600×900 | Inicio (card 4:3) · Carreras (fullscreen) · CarreraDetalle (hero) |
| 5 | `areas/area-negocios.jpg` | 1600×900 | Inicio (card 4:3) · Carreras (fullscreen) · CarreraDetalle (hero) |
| 6 | `areas/area-gastronomia.jpg` | 1600×900 | Inicio (card 4:3) · Carreras (fullscreen) · CarreraDetalle (hero) |
| 7 | `areas/area-tecnologia.jpg` | 1600×900 | Inicio (card 4:3) · Carreras (fullscreen) · CarreraDetalle (hero) |
| 8 | `benefits/benefit-sep.jpg` | 600×450 | Inicio → Benefit card |
| 9 | `benefits/benefit-flexibilidad.jpg` | 600×450 | Inicio → Benefit card |
| 10 | `benefits/benefit-empleabilidad.jpg` | 600×450 | Inicio → Benefit card |
| 11 | `benefits/benefit-practicas.jpg` | 600×450 | Inicio → Benefit card |
| 12 | `benefits/benefit-internacional.jpg` | 600×450 | Inicio → Benefit card |
| 13 | `benefits/benefit-tecnologia.jpg` | 600×450 | Inicio → Benefit card |

**Total: 13 imágenes nuevas**

---

## 🔧 Dónde cambiar las rutas en el código

Una vez generadas las imágenes y copiadas a `/public/`:

| Archivo | Variable/Línea | Qué cambiar |
|---|---|---|
| `src/pages/Inicio.tsx` | `AREA_META` (líneas 42–48) | URLs de Unsplash → `/areas/area-[nombre].jpg` |
| `src/pages/Inicio.tsx` | `BENEFITS` (líneas 51–58) | URLs de Unsplash → `/benefits/benefit-[nombre].jpg` |
| `src/pages/Inicio.tsx` | Hero `<img src=...>` (línea 116) | URL → `/hero-background.jpg` |
| `src/pages/Inicio.tsx` | CTA `<img src=...>` (línea 245) | URL → `/cta-background.jpg` |
| `src/pages/Carreras.tsx` | `AREA_IMG` (líneas 25–31) | URLs de Unsplash → `/areas/area-[nombre].jpg` |
| `src/pages/CarreraDetalle.tsx` | `AREA_IMG` (líneas 27–33) | URLs de Unsplash → `/areas/area-[nombre].jpg` |
