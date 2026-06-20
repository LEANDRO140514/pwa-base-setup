-- Run this in Supabase Dashboard > SQL Editor
-- This inserts the official FAQs matching the knowledge base

-- First, clear old ones
DELETE FROM faqs;

-- Insert official FAQs
INSERT INTO faqs (type, triggers, response) VALUES

('conversational', ARRAY['hola', 'buenas', 'informacion', 'info', 'ayuda'],
'¡Hola! Soy Eva, asesora académica de Universidad Latino. Puedo orientarte sobre nuestras carreras, precios, becas y proceso de admisión. ¿En qué puedo ayudarte?'),

('informational', ARRAY['beca', 'becas', 'descuento', 'apoyo economico'],
'Contamos con becas por aprovechamiento académico:

• Sobresaliente (9.60–10.00) — 50% colegiatura + 50% inscripción
• Muy alto (9.00–9.59) — 40% colegiatura + 50% inscripción
• Alto (8.5–8.99) — 30% colegiatura + 50% inscripción
• Base (7.0–8.49) — 50% descuento en inscripción

También tenemos plan de pagos a 12 meses sin intereses. ¿Te gustaría calcular tu beca desde la app?'),

('informational', ARRAY['documentos', 'requisitos', 'papeles', 'necesito'],
'Documentos requeridos para inscripción:

• Certificado de bachillerato
• Identificación oficial (INE o pasaporte)
• CURP
• Acta de nacimiento
• 2 fotografías tamaño infantil

Carreras del área de Salud requieren adicionalmente carta de no antecedentes penales.'),

('informational', ARRAY['inscripcion', 'admision', 'inscribirme', 'ingreso', 'proceso'],
'El proceso de admisión no requiere examen. Son 5 pasos:

1. Solicitar información
2. Entrevista con un asesor
3. Entrega de documentos
4. Pago de inscripción
5. Inicio de clases

Próximas fechas de inicio: enero, mayo y septiembre. ¿Te gustaría agendar tu entrevista?'),

('informational', ARRAY['inicio', 'clases', 'cuando empiezan', 'fecha', 'calendario'],
'Las clases inician en enero, mayo y septiembre del 2026. Tenemos inscripciones abiertas todo el año. El proceso es rápido y sin examen de admisión. ¿Te gustaría apartar tu lugar?'),

('informational', ARRAY['modalidad', 'horarios', 'tiempos', 'como son las clases'],
'Tenemos 3 modalidades:

• Presencial (lunes a viernes, horario matutino)
• En Línea (clases en vivo martes y jueves 20:00–22:00 hrs + grabaciones disponibles)
• Sabatina (solo sábados 8:00–13:00 hrs, ideal si trabajas entre semana)

Todas con el mismo título con validez SEP.'),

('informational', ARRAY['precio', 'costo', 'colegiatura', 'cuanto cuesta', 'mensualidad'],
'Colegiaturas mensuales:

• Presencial: $4,650/mes | Inscripción: $8,000
• Sabatina: $3,960/mes | Inscripción: $3,600
• En Línea: $1,980/mes | Inscripción: $3,600

Todas incluyen acceso a instalaciones, plataforma Moodle y materiales digitales. ¿Te gustaría conocer las becas disponibles?'),

('informational', ARRAY['revalidacion', 'equivalencia', 'equivalencias', 'cambio', 'transferencia'],
'Sí contamos con proceso de equivalencias y revalidación de estudios. El área de Control Escolar evalúa tu historial académico para determinar qué materias aplican. ¿Quieres que te pongamos en contacto con un asesor?'),

('informational', ARRAY['rvoe', 'validez', 'reconocida', 'oficial', 'sep'],
'Todas nuestras carreras cuentan con RVOE (Reconocimiento de Validez Oficial de Estudios) otorgado por la SEP Estatal y Federal. Misma validez oficial que cualquier universidad pública. ¿Te gustaría conocer más sobre alguna carrera en particular?'),

('conversational', ARRAY['gracias', 'muchas gracias', 'thanks'],
'¡De nada! Recuerda que puedes calcular tu beca desde la sección "Mi Beca" en la app o agendar una asesoría personalizada con un coordinador académico. ¿Hay algo más en lo que pueda ayudarte?');