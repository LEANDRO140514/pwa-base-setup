# GHL Webhook Payload — Carreras Landing

> **Propósito:** Documentar el payload JSON enviado al webhook de GoHighLevel desde la landing de carreras (`MiBeca.tsx`).

---

## Endpoint

- **URL:** `VITE_GHL_WEBHOOK_URL` (variable de entorno — no hardcodear)
- **Método:** `POST`
- **Content-Type:** `application/json`

---

## Payload completo (sanitizado)

```json
{
  "firstName": "Juan",
  "lastName": "García",
  "email": "juan@email.com",
  "phone": "+52 55 1234 5678",
  "career": "Ingeniería en Sistemas",
  "source": "pwa-mi-beca",
  "tags": ["pwa", "beca-solicitada", "sobresaliente"],

  "origen": "carreras-landing",
  "lead_type": "beca_carreras",
  "funnel": "admisiones_2026",
  "interest": "beca",
  "career_name": "Ingeniería en Sistemas",
  "career_id": "abc-123",
  "modality": "En línea",
  "average_range": "9.60-10.00",
  "scholarship_level": "Sobresaliente",
  "scholarship_percent": 50,
  "enrollment_discount_percent": 50,
  "tuition_base": 3200,
  "enrollment_base": 1800,
  "tuition_final": 1600,
  "enrollment_final": 900,
  "wa_stage": "interes_beca",
  "tags_string": "pwa,beca-solicitada,sobresaliente",

  "utmSource": "facebook",
  "utmMedium": "cpc",
  "utmCampaign": "carreras_2026",
  "utmContent": "hero_banner",
  "utmTerm": "ingenieria",
  "fbclid": "abc.123",
  "gclid": "xyz.789",
  "landingSource": "facebook",
  "firstPageSeen": "/",
  "lastPageSeen": "/mi-beca",

  "timestamp": "2026-06-24T12:00:00.000Z"
}
```

---

## Campos enviados

### Datos del prospecto (legacy — camelCase)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `firstName` | string | ✅ | Nombre del prospecto |
| `lastName` | string | ❌ | Apellido del prospecto |
| `email` | string | ✅ | Correo electrónico |
| `phone` | string | ❌ | Teléfono (formato libre) |
| `career` | string | ❌ | Nombre de la carrera de interés |
| `source` | string | ✅ | Identificador de origen: `"pwa-mi-beca"` |
| `tags` | string[] | ✅ | Tags: `["pwa", "beca-solicitada", "<level_id>"]` |

### Campos planos para segmentación en GHL (snake_case)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `origen` | string | ✅ | `"carreras-landing"` — identifica el origen del lead |
| `lead_type` | string | ✅ | `"beca_carreras"` — tipo de lead para rutear en GHL |
| `funnel` | string | ✅ | `"admisiones_2026"` — embudo de campaña |
| `interest` | string | ✅ | `"beca"` — interés principal |
| `career_name` | string | ❌ | Nombre completo de la carrera |
| `career_id` | string | ❌ | ID de la carrera en la base de datos |
| `modality` | string\|null | ❌ | Modalidad: `"En línea"` / `"Presencial"` / `null` |
| `average_range` | string | ❌ | Rango de promedio seleccionado, ej. `"9.60-10.00"` |
| `scholarship_level` | string | ❌ | Nivel de beca, ej. `"Sobresaliente"` |
| `scholarship_percent` | number | ❌ | Descuento en colegiatura: `50`, `40`, `30`, `0` |
| `enrollment_discount_percent` | number | ❌ | Descuento en inscripción: siempre `50` |
| `tuition_base` | number | ❌ | Colegiatura mensual base (antes del descuento) |
| `enrollment_base` | number | ❌ | Inscripción base (antes del descuento) |
| `tuition_final` | number | ❌ | Colegiatura mensual final (con descuento aplicado) |
| `enrollment_final` | number | ❌ | Inscripción final (con descuento aplicado) |
| `wa_stage` | string | ✅ | `"interes_beca"` — etapa para automatización WhatsApp |
| `tags_string` | string | ✅ | Tags como string separado por comas |

### Atribución UTM (camelCase — legacy)

| Campo | Tipo | Descripción |
|---|---|---|
| `utmSource` | string | `utm_source` capturado del URL |
| `utmMedium` | string | `utm_medium` |
| `utmCampaign` | string | `utm_campaign` |
| `utmContent` | string | `utm_content` |
| `utmTerm` | string | `utm_term` |
| `fbclid` | string | Click ID de Facebook |
| `gclid` | string | Click ID de Google Ads |
| `landingSource` | string | `document.referrer` o parámetro `landing_source` |
| `firstPageSeen` | string | Primera página visitada en la sesión |
| `lastPageSeen` | string | Última página antes del envío |

---

## Uso de `source` vs `origen` vs `lead_type`

| Campo | Valor | Propósito |
|---|---|---|
| `source` | `"pwa-mi-beca"` | Identifica técnicamente la procedencia del payload |
| `origen` | `"carreras-landing"` | Identifica el proyecto/aplicación emisora |
| `lead_type` | `"beca_carreras"` | Clasifica el tipo de lead para el workflow de GHL |
| `funnel` | `"admisiones_2026"` | Agrupa leads por campaña/embudo |
| `interest` | `"beca"` | Indica el interés principal del prospecto |

> ⚠️ `origen` permite filtrar leads entre apps que usen el mismo webhook (ej. testunilatino) sin colisionar. Configurar reglas en GHL según este campo.

---

## Reglas de beca reflejadas en el payload

| Promedio | `scholarship_level` | `scholarship_percent` | `enrollment_discount_percent` |
|---|---|---|---|
| 9.60 – 10.00 | Sobresaliente | 50 | 50 |
| 9.00 – 9.59 | Muy alto | 40 | 50 |
| 8.50 – 8.99 | Alto | 30 | 50 |
| 7.00 – 8.49 | *(nivel base)* | 0 | 50 |
| < 7.00 | *(canalizar con asesor)* | — | — |

---

## Consideraciones técnicas

- **Payload plano (flat JSON):** Todos los campos están en la raíz del objeto. Sin objetos anidados. Esto permite mapeo directo en GHL.
- **Tags duplicados:** `tags` (array) y `tags_string` (string) se envían ambos para compatibilidad con workflows que esperen uno u otro formato.
- **Valores opcionales:** Si no hay carrera seleccionada, los campos de precios y modalidad se omiten (`undefined` no se serializa). Si el promedio es < 7.00, el nivel no se asigna y los campos de beca se omiten.
- **Timestamp:** Se agrega automáticamente al serializar.

---

## ⚠️ Seguridad

- **NO** comitear el valor real de `VITE_GHL_WEBHOOK_URL` al repositorio.
- **NO** incluir tokens, API keys ni datos sensibles en el payload.
- El payload solo contiene datos de prospecto ingresados por el usuario más metadatos de sesión (UTM, páginas visitadas).
- Usar `.env` o variables de entorno en producción. Mantener `.env.example` sin valores reales.