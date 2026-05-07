# Universidad Latino — PWA Institucional

Aplicación web progresiva (PWA) para **Universidad Latino**, Mérida, Yucatán. Construida con React + Vite, Supabase como backend y Eva IA como asesora académica conversacional.

---

## Tabla de contenidos

- [Demo](#demo)
- [Tecnologías](#tecnologías)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Páginas y funcionalidades](#páginas-y-funcionalidades)
- [Eva IA — Motor conversacional](#eva-ia--motor-conversacional)
- [Panel de administración](#panel-de-administración)
- [Base de datos (Supabase)](#base-de-datos-supabase)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y desarrollo](#instalación-y-desarrollo)
- [Build y despliegue](#build-y-despliegue)
- [Estructura de carpetas](#estructura-de-carpetas)

---

## Demo

> Servidor de desarrollo: `http://localhost:5173`

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Tipado estático |
| Vite | 5.4 | Build tool + HMR |
| vite-plugin-pwa | 0.21 | Service Worker + PWA manifest |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| Framer Motion | 12 | Animaciones y parallax |
| React Router DOM | 6.27 | Routing SPA |
| Supabase JS | 2.45 | Base de datos + auth |

---

## Arquitectura del proyecto

```
Browser (PWA)
    │
    ├── React SPA (Vite)
    │       ├── Pages        → Inicio, Carreras, CarreraDetalle, Universidad, EvaIA, MiBeca, Admin
    │       ├── Components   → NavBar, BottomBar, EvaFAB, WhatsAppFAB, TestVocacionalModal
    │       └── Context      → AdminContext (configuración global), TestModalContext
    │
    └── Supabase
            ├── careers      → Catálogo de carreras
            └── faqs         → Base de conocimiento para Eva IA
```

---

## Páginas y funcionalidades

### `/` — Inicio
Página principal con hero cinematográfico, secciones de valor institucional, galería de carreras, sección de becas, ubicación con Google Maps embebido y footer con navegación completa.

**Características destacadas:**
- Badge "Zona de alta plusvalía" en la sección de ubicación
- Título aspiracional: *"Ubicación privilegiada en el norte de Mérida"*
- Botón de scroll-to-top al final de la página

### `/carreras` — Catálogo de Carreras
Listado dinámico de carreras cargadas desde Supabase. Filtrado por área (Derecho, Salud, Negocios, Gastronomía, Tecnología) y modalidad. Cada tarjeta muestra precio con beca, duración y enlace a detalle.

### `/carrera/:id` — Detalle de Carrera
Página completa por carrera con:
- **Hero** con imagen de área, badges de modalidad/duración, trust badges RVOE SEP
- **Sticky bar** con precio, inscripción y duración
- **Acerca del programa** con intro aspiracional + sidebar de Modalidad/Duración/Área
- **¿Esta carrera es para ti?** — perfil ideal con checkmarks
- **Perfil del egresado** — competencias numeradas
- **Campo laboral** — sectores con íconos
- **Malla curricular** — acordeón por semestre (8 semestres)
- **Becas disponibles** — tabla por promedio (50%, 40%, 30%, 10%)
- **CTA final** — WhatsApp + Calcular beca
- Contexto guardado en `localStorage` para saludo contextual de Eva IA

### `/universidad` — La Universidad
Página institucional con:
1. Hero principal con video de fondo y parallax
2. Sección "Orgullo UNILATINO" — 6 bloques identitarios
3. Nuestra Historia — storytelling scroll (componente `HistoryStorySection`)
4. Directivos — Liderazgo académico (4 tarjetas con fotos reales)
5. Comunidad UNILATINO — video + galería fotográfica
6. Búhos Parallax — sección identidad deportiva
7. Títulos Búhos — palmarés deportivo con mascota "Milo"
8. Galería UNILATINO — 4 fotos + 1 video real del equipo
9. Infraestructura — instalaciones del campus
10. Ubicación — mapa + card premium con 2 CTAs

### `/eva-ia` — Eva IA (Asesora Académica)
Chat conversacional completo conectado a Supabase. Interface tipo app móvil (390px mockup en desktop).

Ver sección [Eva IA — Motor conversacional](#eva-ia--motor-conversacional).

### `/mi-beca` — Calculadora de Beca
Formulario interactivo que calcula el descuento de beca según promedio académico del usuario. Preselecciona la carrera si proviene de una página de detalle.

### `/admin` — Panel de Administración
Panel protegido para configurar la app en tiempo real. Ver sección [Panel de administración](#panel-de-administración).

---

## Eva IA — Motor conversacional

Motor NLP local ubicado en `src/lib/eva/`:

```
src/lib/eva/
├── index.ts              → Punto de entrada: resolveEvaMessage()
├── types.ts              → Interfaces: ConversationState, EvaResult
├── intentEngine.ts       → Clasificación de intención del mensaje
├── entityExtractor.ts    → Extracción de entidades (carrera, área, modalidad)
├── normalizer.ts         → Normalización de texto (sin acentos, minúsculas)
├── stateManager.ts       → Gestión de estado de la conversación
├── responseBuilder.ts    → Construcción de respuestas en lenguaje natural
└── supabaseResolver.ts   → fetchAllData() — carga carreras y FAQs con cache 2s
```

**Flujo de procesamiento:**
```
Mensaje usuario
    → normalizer (limpia texto)
    → intentEngine (clasifica: career_detail | admission | scholarship | general | greeting)
    → entityExtractor (detecta carrera/área mencionada)
    → supabaseResolver (busca datos reales en Supabase)
    → responseBuilder (genera respuesta contextual)
    → stateManager (actualiza estado: carrera activa, turno de conversación)
```

**Intenciones reconocidas:**
- `greeting` — Saludos
- `career_detail` — Información sobre una carrera específica
- `admission` — Proceso de admisión y requisitos
- `scholarship` — Becas y descuentos
- `general` — Preguntas generales sobre la universidad

**Saludo contextual:** Si el usuario llega desde `/carrera/:id`, Eva lee `localStorage.evaCareerContext` y personaliza el mensaje de bienvenida con el nombre de la carrera.

---

## Panel de administración

Ruta: `/admin`

Permite configurar en tiempo real (sin redespliegue):

| Campo | Descripción |
|---|---|
| Nombre de la app | Aparece en navbar y footer |
| Tagline | Slogan institucional |
| Teléfono de contacto | FAB de WhatsApp y sección de ubicación |
| Email de contacto | Footer y sección de ubicación |
| Número de WhatsApp | Links de WhatsApp en toda la app |
| Dirección | Sección de ubicación |
| Becas activas | Mostrar/ocultar sección de becas |
| Lista de carreras | Nombre, área, modalidad, precio, inscripción, duración, highlights |

Los valores se almacenan en `localStorage` y se inyectan globalmente vía `AdminContext`.

---

## Base de datos (Supabase)

### Tabla `careers`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Identificador único |
| `name` | text | Nombre de la carrera |
| `area` | text | Área: Derecho, Salud, Negocios, Gastronomía, Tecnología |
| `modality` | text | Presencial, En línea, Sabatina |
| `duration` | text | Ej: "4 años" |
| `description` | text | Descripción del programa |
| `monthly_price` | numeric | Colegiatura mensual |
| `enrollment_price` | numeric | Costo de inscripción |
| `highlights` | text[] | Puntos destacados |
| `active` | boolean | Visible en catálogo |

### Tabla `faqs`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Identificador único |
| `question` | text | Pregunta frecuente |
| `answer` | text | Respuesta de Eva IA |
| `category` | text | Categoría temática |
| `active` | boolean | Activa en el motor |

> Para poblar la base de datos inicial, ejecuta `supabase-seed-faqs.sql` en el SQL editor de tu proyecto Supabase.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

> **Importante:** El archivo `.env` está excluido del repositorio por `.gitignore`. Nunca subas tus claves a Git.

---

## Instalación y desarrollo

### Requisitos
- Node.js >= 18
- npm >= 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/LEANDRO140514/universidad-latino-pwa.git
cd universidad-latino-pwa

# 2. Instalar dependencias
npm install

# 3. Crear variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

---

## Build y despliegue

```bash
# Generar build de producción
npm run build

# Preview del build local
npm run preview
```

Los archivos de salida se generan en `/dist`. Compatible con cualquier hosting estático:
- **Vercel** — conectar repositorio GitHub, deploy automático
- **Netlify** — drag & drop de `/dist` o deploy desde Git
- **GitHub Pages** — configurar workflow CI/CD

### Configuración PWA

La app incluye Service Worker y Web App Manifest vía `vite-plugin-pwa`:
- Instalable en dispositivos móviles y desktop
- Caché offline de assets estáticos
- Icono adaptativo para pantalla de inicio

---

## Estructura de carpetas

```
universidad-latino-pwa/
├── public/
│   ├── buho-mascota.png              # Mascota "Milo" (búho UNILATINO)
│   ├── comunidad-video.mp4           # Video sección Comunidad
│   ├── rector-hugo-pacheco.webp      # Foto rector
│   ├── secretario-ariel-ceballos.webp
│   ├── postgrados-gertrudis-rodriguez.webp
│   ├── director-derecho-mario-sanchez.webp
│   ├── logo-escudo.png
│   ├── logo-header.png
│   ├── logo-horizontal.png
│   └── galeria/
│       ├── buhos-1.jpg               # Fotos equipo Búhos
│       ├── buhos-2.jpg
│       ├── buhos-3.jpg
│       ├── buhos-4.jpg
│       └── buhos-video-1.mp4
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── NavBar.tsx            # Barra de navegación desktop
│   │   │   ├── BottomBar.tsx         # Navegación inferior mobile
│   │   │   ├── TopBar.tsx            # Barra superior con back button
│   │   │   └── PageLayout.tsx        # Wrapper de layout general
│   │   ├── EvaFAB.tsx                # Botón flotante Eva IA (global)
│   │   ├── EvaCareerWidget.tsx       # Widget chat por carrera (standalone)
│   │   ├── WhatsAppFAB.tsx           # Botón flotante WhatsApp
│   │   ├── HistoryStorySection.tsx   # Sección storytelling historia UNI
│   │   └── TestVocacionalModal.tsx   # Modal test vocacional
│   │
│   ├── context/
│   │   ├── AdminContext.tsx          # Estado global de configuración
│   │   └── TestModalContext.tsx      # Estado del modal vocacional
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Cliente Supabase
│   │   ├── ghl.ts                    # GoHighLevel integration
│   │   └── eva/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── intentEngine.ts
│   │       ├── entityExtractor.ts
│   │       ├── normalizer.ts
│   │       ├── stateManager.ts
│   │       ├── responseBuilder.ts
│   │       └── supabaseResolver.ts
│   │
│   ├── pages/
│   │   ├── Intro.tsx                 # Splash screen inicial
│   │   ├── Inicio.tsx                # Página principal
│   │   ├── Carreras.tsx              # Catálogo de carreras
│   │   ├── CarreraDetalle.tsx        # Detalle de carrera individual
│   │   ├── Universidad.tsx           # Página institucional
│   │   ├── EvaIA.tsx                 # Chat completo Eva IA
│   │   ├── MiBeca.tsx                # Calculadora de beca
│   │   └── Admin.tsx                 # Panel de administración
│   │
│   ├── App.tsx                       # Router principal + providers
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Estilos globales + Tailwind
│
├── .env                              # Variables de entorno (NO en Git)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── supabase-seed-faqs.sql            # Script de seed para FAQs
```

---

## Contacto

**Universidad Latino — Mérida, Yucatán**
- Dirección: Calle 7 Tablaje 15542 x 4 y 6, Santa Rita Cholul
- Teléfono: 999-943-5386 ext. 201, 204, 206
- Email: informes@universidadlatino.edu.mx
- WhatsApp: [Contactar](https://maps.app.goo.gl/YpPXjPWbZ8nQd71DA)

---

*Desarrollado con Orchids · 2026*
