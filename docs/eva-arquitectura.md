# Arquitectura de Eva IA

> **Eva** es el agente conversacional de Universidad Latino. No usa LLM — es un motor rule-based de detección de intenciones y construcción de respuestas.

---

## Índice

1. [Pipeline de procesamiento](#1-pipeline-de-procesamiento)
2. [Módulos del engine](#2-módulos-del-engine)
3. [Sistema de intenciones](#3-sistema-de-intenciones)
4. [Extracción de entidades](#4-extracción-de-entidades)
5. [Máquina de estados](#5-máquina-de-estados)
6. [Fuentes de datos](#6-fuentes-de-datos)
7. [Componentes frontend](#7-componentes-frontend)
8. [Flujo de ejemplo](#8-flujo-de-ejemplo)

---

## 1. Pipeline de procesamiento

```
Input raw → normalizeInput() → extractEntities() → detectIntent() → buildResponse() → updateState()
```

### Orden de ejecución (`src/lib/eva/index.ts`)

1. **Normalizar** — limpiar el input del usuario
2. **Fetch** — cargar datos desde Supabase (cacheados)
3. **Pending action** — si el estado anterior tiene una acción pendiente y el usuario confirma, ejecutar handler
4. **Extraer entidades** — detectar carrera, área, modalidad
5. **Detectar intención** — `detectIntent()` prioriza 14 intents
6. **Construir respuesta** — `buildResponse()` genera texto coherente
7. **Actualizar estado** — persistir contexto de conversación

---

## 2. Módulos del engine

### 2.1. `normalizer.ts` — Normalización de input

```typescript
normalizeInput(input: string): string
```

Operaciones:
- `toLowerCase()` — todo a minúsculas
- `normalize('NFD') + replace(/[\u0300-\u036f]/g, '')` — eliminar acentos
- `replace(/[¿¡]/g, '')` — puntuación inversa española
- `replace(/[.,!?;:()]/g, ' ')` — signos → espacios
- `replace(/\s+/g, ' ')` — colapsar espacios

Constantes exportadas:
- `ONLINE_SYNONYMS` — `['online', 'on line', 'en linea', 'virtual', ...]`
- `PRESENTIAL_SYNONYMS` — `['presencial', 'en campus', ...]`
- `SATURDAY_SYNONYMS` — `['sabatina', 'sabados', ...]`
- `CONFIRMATION_YES` — `['si', 'claro', 'ok', 'adelante', ...]`
- `CONFIRMATION_NO` — `['no', 'no gracias', ...]`

### 2.2. `types.ts` — Definiciones de tipos

| Tipo | Descripción |
|---|---|
| `Intent` | 14 valores: `greeting`, `faq`, `career_list`, `career_detail`, `modality_filter`, `scholarship`, `payment`, `admission`, `documents`, `schedule`, `revalidation`, `confirmation_yes`, `confirmation_no`, `fallback` |
| `Modality` | `'En línea' \| 'Presencial' \| 'Sabatina'` |
| `Entities` | `{ careerName, area, modality }` |
| `ConversationState` | Estado entre mensajes: intent actual, carrera, área, modalidad, acción pendiente, resultados |
| `Career` | Datos de carrera desde Supabase (name, slug, area, modality, prices, etc.) |
| `FAQ` | FAQ desde Supabase con `triggers[]` y `response` |
| `EngineResponse` | Respuesta completa: intent, entities, state, response text, source, confidence |
| `MatchedSource` | `'faq' \| 'careers' \| 'schedules' \| 'content' \| 'fallback'` |

### 2.3. `entityExtractor.ts` — Extracción de entidades

Tres detectores independientes:

- **`detectModality(n)`**: busca coincidencias con `ONLINE_SYNONYMS`, `PRESENTIAL_SYNONYMS`, `SATURDAY_SYNONYMS`. Retorna `'En línea'`, `'Presencial'`, `'Sabatina'` o `null`.
- **`detectArea(n)`**: busca en `AREA_MAP` (5 áreas con ~5 sinónimos cada una). Retorna nombre del área o `null`.
- **`detectCareerName(n)`**: busca en `CAREER_KEYWORD_MAP` (14 entradas, ordenadas de más específica a menos). Retorna nombre exacto de Supabase o `null`.

**AREA_MAP**:
| Área | Sinónimos |
|---|---|
| Salud | salud, medicina, nutricion, psicologia, enfermeria, clinica, clinico |
| Derecho | derecho, legal, abogado, abogacia, juridico |
| Negocios | negocios, empresa, administracion, mercadotecnia, ventas, marketing, internacionales, comercio |
| Gastronomía | gastronomia, cocina, chef, culinaria, alimentos |
| Tecnología | tecnologia, sistemas, computacion, ingenieria, programacion, software, informatica |

**CAREER_KEYWORD_MAP** (fragmento normalizado → nombre Supabase):
- `'sistemas computacionales'` → `'Ingeniería en Sistemas Computacionales'`
- `'ventas y mercadotecnia'` → `'Ventas y Mercadotecnia'`
- `'negocios internacionales'` → `'Negocios Internacionales'`
- `'administracion y desarrollo'` → `'Administración y Desarrollo Empresarial Online'`
- `'administracion sabatina'` → `'Administración Sabatina'`
- `'nutricion'` → `'Nutrición'`
- etc.

### 2.4. `intentEngine.ts` — Detección de intención

Jerarquía estricta de 8 pasos:

```
confirmation > careerName > FAQ keywords > modality > area > career_list > greeting > fallback
```

**INTENT_KEYWORDS** por intención:

| Intento | Keywords |
|---|---|
| `scholarship` | beca, descuento, apoyo economico, financiamiento, precio especial |
| `payment` | pago, mensualidades, meses sin intereses, forma de pago, tarjeta, credito, plazos |
| `documents` | documento, requisitos, papeles, certificado, curp, acta |
| `admission` | inscripcion, inscribirme, admision, ingreso, como me inscribo |
| `schedule` | horario, horarios, dias de clase, cuando son las clases, turno |
| `revalidation` | revalidacion, equivalencia, cambio de universidad, creditos |
| `faq` | cuanto cuesta, precio, costo, colegiatura, mensualidad, rvoe, validez, oficial |
| `greeting` | hola, buenas, buen dia, saludos |

Notas:
- `greeting` solo se activa si el mensaje tiene ≤4 palabras y **no** contiene palabras de contexto de carrera (carrera, programa, precio, beca, etc.)
- `CAREER_LIST_KEYWORDS`: carreras, programas, que tienen, que ofrecen, opciones, oferta academica
- `CAREER_CONTEXT_WORDS`: palabras que suprimen el saludo genérico

### 2.5. `responseBuilder.ts` — Generación de respuestas

**Funciones renderizadoras**:

| Función | Propósito |
|---|---|
| `renderCareersByArea()` | Lista todas las carreras agrupadas por área |
| `renderOnlineCareers()` | Solo carreras con modalidad "En línea" |
| `renderPresentialCareers()` | Solo carreras presenciales |
| `renderSaturdayCareers()` | Solo carreras sabatinas |
| `renderAreaCareers()` | Carreras filtradas por área |
| `renderCareerDetail()` | Información detallada de una carrera específica |
| `findFAQByTriggers()` | Busca FAQ en Supabase por palabras clave |

**PENDING_ACTIONS** — Handlers ejecutados cuando el usuario confirma una acción:

| Acción | Handler |
|---|---|
| `show_saturday_schedules` | Muestra horarios sabatinos y carreras disponibles |
| `show_admission_requirements` | Muestra los 5 pasos del proceso de inscripción |
| `show_scholarship_detail` | Muestra los tipos de beca (Excelencia, Social, Continuidad) |

**STATIC_FAQS** — Fallbacks hardcodeados para 7 intenciones cuando Supabase no tiene FAQs:
- `scholarship`, `documents`, `admission`, `schedule`, `revalidation`, `faq`

**Helper de normalización** usado internamente para comparaciones:
```typescript
// Elimina acentos y reemplaza guiones por espacios
function n(text: string): string
```

### 2.6. `stateManager.ts` — Gestión de estado

```typescript
EMPTY_STATE = {
  currentIntent: null,
  currentCareer: null,
  currentArea: null,
  currentModality: null,
  pendingAction: null,
  lastResults: null,
}
```

`updateConversationState()` actualiza el estado con reglas:
- Si el mensaje menciona una carrera **sin** modalidad/área → resetea el contexto de área y modalidad
- Si no, preserva el contexto anterior y lo sobreescribe con lo nuevo

### 2.7. `supabaseResolver.ts` — Resolución de datos

Cache con promesa deduplicada para evitar fetching duplicado:

- `fetchCareers()` — tabla `careers` de Supabase (timeout 2s)
- `fetchFAQs()` — tabla `faqs` de Supabase (timeout 2s)
- `fetchAllData()` — ambas en paralelo

Estrategia de caché:
1. Si hay datos en caché → retornar inmediatamente
2. Si hay una promesa en curso → unirse a ella
3. Si no → crear nueva promesa, cachearla, ejecutar fetch
4. Timeout de 2s → si falla, retorna arreglo vacío

---

## 3. Sistema de intenciones

### 3.1. Prioridad completa

| Prioridad | Intento | Condición de activación |
|---|---|---|
| 1 | `confirmation_yes/no` | Palabras de confirmación/negación |
| 2 | `career_detail` | Se detectó `careerName` en entities |
| 3 | FAQ intents | Keywords específicas por tema |
| 4 | `modality_filter` | Se detectó modalidad (online/presencial/sabatina) |
| 5 | `career_list` (con área) | Se detectó área |
| 6 | `career_list` | Keywords de listado de carreras |
| 7 | `greeting` | Solo mensajes cortos sin contexto de carrera |
| 8 | `fallback` | Ninguna condición anterior |

### 3.2. Manejo de confirmed actions

Si `prevState.pendingAction` existe y el input es afirmativo:
1. Se ejecuta el handler correspondiente de `PENDING_ACTIONS`
2. Se limpia `pendingAction` del estado
3. Se devuelve respuesta con `intent: 'confirmation_yes'`

---

## 4. Extracción de entidades

Las 3 entidades se extraen de forma **independiente**:

```
Input: "derecho en línea"
→ careerName: "Derecho"
→ area: "Derecho"
→ modality: "En línea"
```

**Caso especial**: La modalidad en Supabase se almacena como `'en-linea'` (con guión).
El helper `n()` en `responseBuilder.ts` hace `.replace(/-/g, ' ')` para normalizar antes de comparar.

---

## 5. Máquina de estados

La conversación mantiene contexto entre mensajes:

```
Input 1: "derecho"
→ state.currentCareer = "Derecho"
→ state.currentArea = "Derecho"

Input 2: "cuanto cuesta"
→ state.currentCareer = "Derecho" (preservado)
→ response usa contexto para detalle de carrera
```

**Reset de contexto**: Si el usuario nombra una carrera específica sin modalidad/área, se resetea `currentArea` y `currentModality` a `null`.

---

## 6. Fuentes de datos

> ⚠️ Sección corregida (jun 2026) tras verificar el código real en
> `index.ts` y `responseBuilder.ts`. Ver también
> `docs/fuente-de-verdad.md` para los datos institucionales vigentes.

### 6.1. STATIC_FAQS (fuente real de las respuestas de Eva)

`STATIC_FAQS` en `responseBuilder.ts` es la **única** fuente que Eva usa
para responder preguntas de becas, documentos, admisión, costos, etc. No
es un fallback — es lo que siempre se ejecuta.

### 6.2. Tabla `faqs` en Supabase — no usada

`fetchAllData()` en `index.ts` trae `{ careers, faqs }` de
`supabaseResolver.ts`, pero solo `careers` se pasa a `buildResponse()`.
El valor `faqs` se descarta y nunca llega a generar una respuesta. Editar
esta tabla desde el dashboard de Supabase **no tiene ningún efecto** en
lo que Eva responde. Si se quiere que Eva sí use FAQs dinámicas desde
Supabase, hace falta cambiar `buildResponse()` para que las consuma —
hoy no lo hace.

### 6.3. Tabla `careers` en Supabase

`fetchCareers()` en `supabaseResolver.ts` **no consulta Supabase** — está
forzado a devolver siempre `DEFAULT_CAREERS` (hardcodeado en el mismo
archivo), por un mismatch de formato de modalidad documentado en un
comentario del código. Es decir: Eva tampoco usa la tabla `careers` de
Supabase, usa su propia copia hardcodeada en TS.

La tabla `careers` de Supabase sí se usa, pero **fuera de Eva**: la
consultan directamente `Carreras.tsx` y `CarreraDetalle.tsx` para el
catálogo y las fichas de carrera.

### 6.4. AdminContext (frontend)

Fallback de `Carreras.tsx` / `CarreraDetalle.tsx` cuando falla el fetch a
Supabase. No es usado por Eva engine.

### 6.5. Resumen — quién usa qué

| Fuente | ¿La usa Eva? | ¿La usan las páginas de catálogo? |
|---|---|---|
| `STATIC_FAQS` (TS) | ✅ Sí, siempre | No |
| Tabla `faqs` (Supabase) | ❌ No (se descarta) | No |
| `DEFAULT_CAREERS` (TS) | ✅ Sí, siempre | No |
| Tabla `careers` (Supabase) | ❌ No | ✅ Sí |
| `AdminContext` (TS) | No | ✅ Solo si falla Supabase |

---

## 7. Componentes frontend

### 7.1. `EvaIA.tsx` — Página completa `/eva-ia`

- Chat de pantalla completa con diseño tipo mobile
- Usa `resolveEvaMessage()` para todas las respuestas
- Welcome message contextual: si hay `evaCareerContext` en localStorage → personalizado
- CTA de WhatsApp para intenciones de alta conversión (`career_detail`, `admission`, `scholarship`)
- Botón "Empezar de nuevo" que resetea `ConversationState` a `EMPTY_STATE`

### 7.2. `EvaFAB.tsx` — Botón flotante global

- Visible en todas las páginas excepto `/eva-ia`
- Navega a `/eva-ia` al hacer clic
- Animación de pulso

### 7.3. `EvaCareerWidget.tsx` — Widget por carrera

- Aparece como FAB en páginas de detalle de carrera
- Sistema **independiente**: NO usa `resolveEvaMessage()` sino su propio `buildFreeTextResponse()`
- Tiene `QUICK_ACTIONS` (campo, becas, plan, requisitos, asesor)
- Auto-bubble que aparece 3-5s después del mount
- Respuestas hardcodeadas con becas, campo laboral, duración por área
- Desacoplado del engine central — comparte datos de AdminContext

---

## 8. Flujo de ejemplo

### Usuario pregunta por carrera online

```
Input: "qué carreras tienen en línea?"

1. normalizeInput() → "que carreras tienen en linea"
2. extractEntities():
   - careerName: null
   - area: null
   - modality: "En línea" (coincide con ONLINE_SYNONYMS)
3. detectIntent():
   - No es confirmación
   - No tiene careerName
   - No tiene keywords FAQ
   - Tiene modality → "modality_filter"
4. buildResponse("modality_filter", { modality: "En línea" }, ...):
   - Filtra careers donde n(c.modality) === "en linea"
   - renderOnlineCareers() → lista de carreras online
5. updateState() → currentModality = "En línea"
```

### Usuario confirma acción pendiente

```
Input anterior: "quiero saber sobre horarios"
→ response incluye horarios + pendingAction = "show_saturday_schedules"

Input actual: "sí, cuéntame"

1. normalizeInput() → "si cuentame"
2. prevState.pendingAction = "show_saturday_schedules"
3. CONFIRMATION_YES incluye "si" → match!
4. Ejecuta PENDING_ACTIONS["show_saturday_schedules"](careers)
5. Retorna respuesta con horarios sabatinos
6. Limpia pendingAction del estado
```

---

## Notas importantes

- **No usa LLM**: Eva es 100% rule-based. No hay llamadas a OpenAI/Anthropic.
- **Comparación de modalidad**: Supabase almacena `'en-linea'` (con guión). El helper `n()` normaliza guiones a espacios.
- **Widget vs Engine**: `EvaCareerWidget.tsx` tiene su propio sistema de respuestas independiente del engine central. No está sincronizado con `resolveEvaMessage()`.
- **Cache simple**: Los datos de Supabase se cachean en memoria por sesión (sin persistencia). Timeout de 2s por tabla.
- **Estado efímero**: `ConversationState` se mantiene en React state y se pierde al recargar. Solo `evaCareerContext` persiste en localStorage.
- **14 intents**: cubren casos de uso comunes de consulta universitaria.