# Eva IA — Estado actual: SUSPENDIDA

> **Última actualización:** junio 2026
>
> Eva IA está **suspendida hasta nuevo aviso**. Este documento describe qué
> significa eso, qué límites tiene, y en qué estado queda su conocimiento
> y código.

---

## 1. Estado de la funcionalidad

| Aspecto | Estado |
|---|---|
| Chat rule-based en `/eva-ia` | **Conservado** (ruta accesible por URL directa) |
| Botón flotante EvaFAB | **Oculto** (código comentado en `App.tsx`) |
| Navegación (BottomBar) | **Oculto** (código comentado) |
| Navegación (NavBar) | **Oculto** (código comentado) |
| Enlace en footer (Inicio) | **Oculto** (código comentado) |
| Motor rule-based (`src/lib/eva/`) | **Intacto** — sin modificar |
| Página `EvaIA.tsx` | **Conservada** — import y ruta activos en router |
| Widget `EvaCareerWidget.tsx` | **Intacto** — sigue operativo en páginas de detalle de carrera |
| Ruta `/eva-ia` en router | **Activa** — accesible escribiendo la URL directamente |
| WhatsAppFAB | **Operativo** — es el CTA principal actual (no relacionado con Eva IA) |

### Resumen visual

Un usuario puede llegar a `/eva-ia` si:
1. **Tiene la URL guardada** (marcador, historial, enlace directo)
2. **Alguien le comparte el enlace**

No puede llegar a `/eva-ia` desde:
- La navegación inferior (BottomBar)
- La barra superior (NavBar)
- El footer de Inicio
- Ningún botón o CTA en la app

---

## 2. Límites y delimitaciones

### 2.1. Eva IA NO está reemplazada

El motor rule-based sigue siendo el mismo que antes de la suspensión. No
hay un nuevo sistema ocupando su lugar. El plan de "Eva Admisiones" (agente
LLM + WhatsApp) es un **proyecto futuro no iniciado** — no hay código, ni
infraestructura, ni configuración al respecto.

### 2.2. Lo que Eva IA SÍ sigue haciendo

Si alguien accede a `/eva-ia` por URL directa, el chat:
- Sigue funcionando con su motor rule-based completo (14 intents)
- Sigue respondiendo con `STATIC_FAQS` y `DEFAULT_CAREERS` hardcodeados
- Sigue manteniendo `ConversationState` entre mensajes
- Sigue usando la lógica de `pendingAction` y confirmaciones
- Sigue los mismos flujos documentados en `docs/eva-arquitectura.md`

### 2.3. Lo que Eva IA NO tiene

- No usa LLM (OpenAI, Anthropic, ningún provider)
- No está integrada con WhatsApp (ni Business API, ni webhook)
- No lee FAQs desde Supabase (ver sección 6 de `eva-arquitectura.md`)
- No tiene capacidad de aprender ni adaptarse
- No tiene mantenimiento activo de respuestas

---

## 3. Estado del conocimiento

El conocimiento de Eva IA es el que tenía en el momento de la suspensión.
No se actualizará hasta que se reactive o sea reemplazado.

### 3.1. Datos actualmente cargados

| Fuente | Contenido | Archivo |
|---|---|---|
| `STATIC_FAQS` | Becas, documentos, admisión, horarios, costos, contacto, revalidación | `src/lib/eva/responseBuilder.ts` |
| `DEFAULT_CAREERS` | 12 carreras con precios, modalidades, duración, RVOE | `src/lib/eva/supabaseResolver.ts` |
| `PENDING_ACTIONS` | 3 handlers: horarios sabatinos, requisitos de admisión, detalle de becas | `src/lib/eva/responseBuilder.ts` |

### 3.2. Fuente de verdad de referencia

Los datos institucionales correctos están documentados en:

- **`docs/fuente-de-verdad.md`** — datos vigentes de la universidad
  (precios, becas, documentos, proceso de admisión, modalidades)
- **`docs/manual-actualizaciones.md`** — procedimiento para actualizar
  datos cuando cambien

Si en el futuro se reactiva Eva IA o se construye "Eva Admisiones", el
conocimiento debe partir de `fuente-de-verdad.md` y no de lo que hoy
tiene hardcodeado Eva IA (que puede estar desactualizado).

### 3.3. Bugs conocidos al momento de la suspensión

1. **Bucle de confirmación en becas**: Cuando Eva pregunta "¿Quieres que
   te dé más detalles?" y el usuario responde "sí", el `pendingAction`
   no siempre se ejecuta correctamente. El usuario puede quedar atrapado
   en un ciclo donde Eva vuelve a preguntar lo mismo una y otra vez.
   - Afecta a: `show_scholarship_detail`, y potencialmente a los otros
     dos `PENDING_ACTIONS`
   - Causa probable: problema de estado/cierre en React (`EvaIA.tsx`)
   - No se investigó a fondo porque se decidió suspender antes

---

## 4. Archivos tocados por la suspensión

| Archivo | Cambio |
|---|---|
| `src/App.tsx:9` | `import EvaFAB` → comentado |
| `src/App.tsx:25` | `<EvaFAB />` → comentado |
| `src/components/layout/NavBar.tsx:9` | Entrada `{ to: '/eva-ia', label: 'Eva IA' }` → comentada |
| `src/components/layout/BottomBar.tsx:64-71` | Tab de Eva IA → comentado completo (to, label, icon) |
| `src/pages/Inicio.tsx:390` | Enlace `{ label: 'Eva IA', to: '/eva-ia' }` → comentado |

Ningún archivo de `src/lib/eva/` fue modificado. El motor sigue intacto.

---

## 5. ¿Qué se necesita para reactivar?

### Mínimo para volver a mostrar Eva IA en la navegación

1. Descomentar las 5 secciones indicadas en la tabla de arriba
2. Verificar que el bug de confirmación/bucle no sea blocker
3. Build exitoso y deploy

### Para reemplazar con "Eva Admisiones" (LLM + WhatsApp)

Este es un proyecto **completamente nuevo** que requiere:

1. **Decisión de arquitectura**:
   - ¿Supabase Edge Function?
   - ¿GoHighLevel AI Agent?
   - ¿Backend propio?

2. **Configuración de WhatsApp Business API** (cuenta, webhook, número)

3. **Selección de LLM provider** (OpenAI, Anthropic Claude, otro)

4. **Construcción del system prompt** con datos desde `fuente-de-verdad.md`

5. **Integración con el frontend**: el WhatsAppFAB actual solo es un
   enlace `wa.me` estático. Habría que convertirlo en algo que
   comunique el estado de la sesión o redirija al agente.

6. **Eliminación del código legacy**:
   - Página `src/pages/EvaIA.tsx`
   - Motor `src/lib/eva/` (o parte de él, si se reusa la data)
   - Componente `src/components/EvaFAB.tsx`
   - Widget `src/components/EvaCareerWidget.tsx` (decidir)
   - Rutas en `App.tsx`

---

## 6. Documentación relacionada

| Archivo | Propósito |
|---|---|
| `docs/eva-arquitectura.md` | Arquitectura detallada del motor rule-based |
| `docs/fuente-de-verdad.md` | Datos institucionales vigentes (precios, becas, etc.) |
| `docs/manual-actualizaciones.md` | Procedimiento para cambiar datos en las 3+ fuentes |
| `docs/README-EVA.md` | **(este archivo)** — Estado de suspensión y línea base |

---

## 7. Notas para el equipo

- **No reabrir el bug de confirmación**: El bucle de becas no vale la
  pena arreglarlo si el plan es migrar a LLM. Si se decide mantener Eva
  IA a largo plazo, ese bug debe priorizarse.
- **No crear nuevos seeds SQL**: Ya hay manual de actualizaciones.
- **No modificar `src/lib/eva/` por ahora**: Si se necesita un cambio
  de datos urgente (precio, beca), actualizar solo `fuente-de-verdad.md`
  y los lugares que correspondan según `manual-actualizaciones.md`, sin
  tocar el motor de Eva a menos que se reactive oficialmente.
- **WhatsAppFAB es independiente**: El botón de WhatsApp actual no es
  parte de Eva IA. Sigue siendo el CTA principal para contacto con
  asesores humanos. Cualquier plan de "Eva Admisiones" integraría este
  botón o lo reemplazaría.