# Fuente de verdad — Datos institucionales Universidad Latino

> Este archivo es la referencia única para precios, becas, documentos y
> proceso de admisión. Antes de editar `STATIC_FAQS` (responseBuilder.ts),
> la tabla `careers` en Supabase, o cualquier seed `.sql`, consulta esta
> tabla primero. **Si algo en el código difiere de este archivo, este
> archivo manda — corrige el código, no al revés.**

Origen: documentos oficiales de la universidad (CSV de carreras + FAQs
optimizadas), verificados línea por línea contra el código en junio 2026.

---

## 1. Costos por carrera

| Carrera | Modalidad | Mensualidad | Inscripción | Duración | RVOE |
|---|---|---|---|---|---|
| Derecho | Presencial | $4,650 | $8,000 | 4 años | 1275 |
| Derecho Online | En línea | $1,980 | $3,600 | 3 años | 20251419 |
| Psicología | Presencial | $4,650 | $8,000 | 4 años + S.S. | 994 Estatal / 20251033 Federal |
| Enfermería | Presencial | $4,650 | $8,000 | 4 años + S.S. | 2048 Estatal / 20250816 Federal |
| Nutrición | Presencial | $4,650 | $8,000 | 4 años + S.S. | 1155 |
| Ingeniería en Sistemas Computacionales | Presencial | $4,650 | $8,000 | 3 años 8 meses | 143 |
| Administración Sabatina | Sabatina | $3,960 | $3,600 | 3 años | 20121885 |
| Administración y Desarrollo Empresarial Online | En línea | $1,980 | $3,600 | 3 años | 20253750 |
| Ventas y Mercadotecnia | Presencial | $4,650 | $8,000 | 3 años 4 meses | 1828 |
| Ventas y Mercadotecnia Online | En línea | $1,980 | $3,600 | 3 años | 20251420 |
| Negocios Internacionales | Presencial | $4,650 | $8,000 | 3 años 4 meses | 809 |
| Gastronomía | Presencial | $4,650 | $8,000 | 4 años | 1507 |

**Regla rápida:** toda modalidad **Presencial** = inscripción $8,000.
Toda modalidad **En línea o Sabatina** = inscripción $3,600. No hay
excepciones a esta regla en ninguna carrera actual.

---

## 2. Becas — campaña vigente

Esquema de 4 tramos según promedio de bachillerato. Durante la campaña
vigente, **todos los niveles elegibles** reciben 50% de descuento en
inscripción. La beca en colegiatura varía según el promedio:

| Promedio | Beca en colegiatura | Descuento en inscripción |
|---|---|---|
| 9.60 – 10.00 | 50% | 50% |
| 9.00 – 9.59 | 40% | 50% |
| 8.50 – 8.99 | 30% | 50% |
| 7.00 – 8.49 | Sin beca | 50% |
| Menor a 7.00 | Canalizar con asesor | — |

La beca en colegiatura está **sujeta a validación**. El 50% de descuento
en inscripción aplica para nuevos ingresos durante la campaña vigente.

Requisitos para mantener la beca: promedio mínimo, estar al corriente
con pagos, sin sanciones disciplinarias.

---

## 3. Formas de pago

Documentadas: mensualidades, o pago anual/semestral con descuento.

**No existe ninguna opción de "meses sin intereses" (MSI) con tarjeta de
crédito.** Ningún documento oficial la menciona. Si aparece en código,
Supabase, o un seed, es un dato inventado y debe eliminarse.

---

## 4. Costos adicionales (no incluidos en mensualidad/inscripción)

| Concepto | Monto | Aplica a |
|---|---|---|
| Seguro de estudiante | $400/año | Solo carreras presenciales |
| Campos clínicos | $2,300 – $3,000 | Solo Enfermería y Nutrición |

**Incluido sin costo adicional** en todas las modalidades: Google
Workspace for Education, biblioteca digital (122,000 títulos), plataforma
Moodle, convenios de prácticas (50 convenios).

---

## 5. Documentos para inscripción

- Acta de nacimiento
- Certificado de bachillerato (original + copia)
- CURP
- Comprobante de domicilio (copia)

Flexibilidad: se puede iniciar con constancia de estudios si el
certificado está en trámite, siempre que se entregue antes de iniciar
clases en septiembre.

No se requiere examen de admisión para ninguna carrera.

---

## 6. Proceso de admisión (5 pasos)

1. Orientación sobre la carrera de interés
2. Revisión de requisitos y documentación
3. Llenado del formato de inscripción
4. Elección del tipo de pago (anual o por periodo)
5. Realización del pago y entrega de documentos

---

## 7. Modalidades y horarios

| Modalidad | Horario |
|---|---|
| Presencial | Lunes a viernes, Campus Central |
| En línea | 100% flexible; clases en vivo martes y jueves 20:00–22:00 hrs + plataforma 24/7 |
| Sabatina | Solo sábados, 8:00–13:00 hrs |

---

## 8. Conteo de carreras

El catálogo tiene 12 filas (carrera × modalidad), pero 3 programas
existen en doble modalidad:

- Derecho (Presencial + Online)
- Ventas y Mercadotecnia (Presencial + Online)
- Administración (Sabatina + Online)

Esto da **9 programas académicos únicos**, ofrecidos en **12
combinaciones de carrera+modalidad**. Usar "12 opciones" en contexto de
marketing es válido; si se pregunta específicamente "cuántas carreras
distintas", aclarar la agrupación en vez de repetir un solo número.

---

## 9. Dónde debe vivir esta información en el código

- **Eva (conversación):** `STATIC_FAQS` en `src/lib/eva/responseBuilder.ts`
  debe coincidir exactamente con este archivo. Es la única fuente que Eva
  usa hoy — no lee FAQs desde Supabase (ver `docs/eva-arquitectura.md`
  sección 6, corregida).
- **Catálogo y fichas de carrera:** tabla `careers` en Supabase, consumida
  por `Carreras.tsx` y `CarreraDetalle.tsx`. Debe tener los mismos
  `monthly_price` / `enrollment_price` que la tabla de la sección 1.
- **Fallback de esas páginas:** `AdminContext.tsx`, debe coincidir también.

Si se actualiza un precio o regla de negocio, hay que tocar este archivo
primero y luego replicar el cambio en los tres lugares de arriba.