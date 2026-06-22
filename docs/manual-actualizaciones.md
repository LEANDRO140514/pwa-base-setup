# Manual de actualizaciones — Datos institucionales

> Guía para cuando la universidad cambie un precio, una beca, un requisito,
> o cualquier otro dato institucional. Sigue estos pasos en orden — no
> editar código directamente sin antes actualizar la fuente de verdad.

---

## Paso 1 — Actualiza `docs/fuente-de-verdad.md` primero

Este archivo es el único lugar donde se edita un dato institucional por
primera vez. Nunca edites un precio o regla directamente en código o en
Supabase sin haberlo cambiado aquí primero.

Ejemplo: si la inscripción presencial sube de $8,000 a $8,500, edita la
tabla de la sección 1 de `fuente-de-verdad.md` para que diga $8,500.

---

## Paso 2 — Replica el cambio en los 3 lugares que usa el sistema

Cada dato institucional vive en **tres** lugares de código que deben
coincidir entre sí. Edítalos en este orden:

### 2.1. `src/lib/eva/responseBuilder.ts` — constante `STATIC_FAQS`

Esto es lo que responde Eva en el chat conversacional. Busca el texto
del dato que cambió (precio, beca, documento, etc.) dentro de
`STATIC_FAQS` y actualízalo manualmente.

> Nota: Eva no lee Supabase para esto — el texto está escrito directo en
> este archivo. Si no lo cambias aquí, Eva seguirá diciendo el dato viejo
> aunque Supabase y la documentación ya estén actualizados.

### 2.2. `src/lib/eva/supabaseResolver.ts` — constante `DEFAULT_CAREERS`

Mismo principio, pero para precios/datos de carreras específicas que usa
Eva al responder sobre una carrera (`career_detail`). Esta constante
también ignora Supabase por diseño actual — edítala a mano.

### 2.3. Tabla `careers` en Supabase (Dashboard → SQL Editor)

Esta tabla la consultan **directamente** las páginas `Carreras.tsx` y
`CarreraDetalle.tsx` (catálogo y fichas de carrera en la app). Es la
única de las tres fuentes que vive fuera del código, en la base de
datos.

Plantilla de SQL para un cambio de precio:

```sql
-- Verifica antes de cambiar
SELECT name, modality, monthly_price, enrollment_price
FROM careers
ORDER BY modality, name;

-- Aplica el cambio (ejemplo: subir inscripción presencial)
UPDATE careers
SET enrollment_price = 8500
WHERE modality = 'Presencial';

-- Confirma después del cambio
SELECT name, modality, monthly_price, enrollment_price
FROM careers
ORDER BY modality, name;
```

Si el cambio es solo para una carrera puntual (no toda una modalidad),
filtra por `name` en vez de `modality`:

```sql
UPDATE careers
SET enrollment_price = 8500
WHERE name = 'Psicología';
```

### 2.4. (Solo si aplica) `src/context/AdminContext.tsx`

Este archivo es el **fallback** que usan `Carreras.tsx` y
`CarreraDetalle.tsx` cuando falla el fetch a Supabase, y también el que
usan las rutas con ID numérico (`/carrera/2`, `/carrera/4`, etc.) en
lugar de UUID. Si no lo actualizas, esas rutas seguirán mostrando el
dato viejo aunque Supabase ya esté corregido.

---

## Paso 3 — Verifica que las 3 (o 4) fuentes coincidan

Antes de dar por cerrado el cambio, valida cada fuente por separado:

| Fuente | Cómo verificar |
|---|---|
| Eva (chat) | Preguntarle directamente el dato en el chat de la app |
| `DEFAULT_CAREERS` | Preguntarle a Eva sobre la carrera específica ("¿cuánto cuesta Psicología?") |
| Tabla `careers` (Supabase) | Visitar `/carreras` o una ficha con **UUID real** en la URL (no ID numérico) |
| `AdminContext` (fallback) | Visitar una ruta con **ID numérico** (`/carrera/2`) |

⚠️ No valides el cambio de Supabase usando rutas numéricas como
`/carrera/2` — esas rutas no consultan Supabase, leen `AdminContext`. Si
solo corriges Supabase y pruebas con una ruta numérica, vas a seguir
viendo el dato viejo y vas a pensar que el cambio no funcionó cuando en
realidad sí funcionó, solo que estás mirando la fuente equivocada.

---

## Paso 4 — Actualiza la documentación de arquitectura si el flujo cambió

Si el cambio no es solo un dato (precio, beca) sino que afecta **cómo**
funciona el sistema — por ejemplo, si en el futuro decides que Eva sí
debe leer la tabla `careers` de Supabase en vez de usar
`DEFAULT_CAREERS` hardcodeado — entonces además de los pasos anteriores
hay que actualizar `docs/eva-arquitectura.md` para que la sección 6
("Fuentes de datos") siga reflejando la realidad del código. Documentación
desactualizada sobre el flujo de datos fue la causa raíz de la confusión
que motivó este manual — no dejar que vuelva a pasar.

---

## Resumen rápido — qué tocar según qué cambió

| Si cambió... | Archivos a tocar |
|---|---|
| Un precio (mensualidad/inscripción) de una carrera existente | `fuente-de-verdad.md` → `STATIC_FAQS` → `DEFAULT_CAREERS` → tabla `careers` (Supabase) → `AdminContext.tsx` si aplica |
| El esquema de becas | `fuente-de-verdad.md` → `STATIC_FAQS` (sección scholarship) |
| Documentos requeridos para admisión | `fuente-de-verdad.md` → `STATIC_FAQS` (sección documents) |
| El proceso de admisión (pasos) | `fuente-de-verdad.md` → `STATIC_FAQS` (sección admission) |
| Costos adicionales (seguro, campos clínicos) | `fuente-de-verdad.md` → `STATIC_FAQS` (sección faq) |
| Una carrera nueva se agrega al catálogo | `fuente-de-verdad.md` (nueva fila) → `DEFAULT_CAREERS` (nueva entrada) → tabla `careers` (Supabase, nueva fila) → `AdminContext.tsx` si aplica |
| Cómo funciona el motor de Eva (no un dato, sino lógica) | `docs/eva-arquitectura.md` |

---

## Qué NO hacer

- No editar un precio solo en Supabase y asumir que Eva lo va a reflejar
  — Eva no lee Supabase para esto (ver `docs/eva-arquitectura.md`
  sección 6).
- No volver a crear archivos seed `.sql` sueltos en la raíz del repo
  para "corregir" un dato puntual. Si necesitas un SQL de corrección,
  ejecútalo directo en el SQL Editor de Supabase y bórralo después de
  usarlo (no lo dejes commiteado).
- No asumir que un cambio en `careers` de Supabase se ve en todas las
  rutas de la app — las rutas numéricas usan `AdminContext`, no Supabase.
- No dejar `fuente-de-verdad.md` desactualizado mientras se corrige el
  código. Si por alguna razón se hace el cambio primero en código, hay
  que regresar a actualizar este archivo en la misma sesión, no
  "después".