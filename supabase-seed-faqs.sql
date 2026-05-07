-- ─────────────────────────────────────────────────────────────────────────────
-- Seed FAQs para Eva IA — Universidad Latino
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Asegurar que la tabla existe con la estructura correcta
CREATE TABLE IF NOT EXISTS faqs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic       text NOT NULL,
  question    text NOT NULL,
  answer      text NOT NULL,
  career_id   uuid REFERENCES careers(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- 2. Habilitar lectura pública
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read faqs" ON faqs;
CREATE POLICY "public read faqs" ON faqs FOR SELECT USING (true);

-- 3. Insertar FAQs base
INSERT INTO faqs (topic, question, answer) VALUES

-- Inscripción / proceso
('inscripcion', '¿Cómo me inscribo?',
'El proceso de inscripción es sencillo y no requiere examen de admisión. Solo 5 pasos:
1. Solicitar información
2. Entrevista con un asesor
3. Entrega de documentos
4. Pago de inscripción
5. ¡Inicio de clases!'),

-- Documentos / requisitos
('documentos,requisitos', '¿Qué documentos necesito para inscribirme?',
'Los documentos requeridos son:
• Certificado de bachillerato (original + copia)
• Identificación oficial vigente (INE/pasaporte)
• CURP
• Acta de nacimiento
• 2 fotografías tamaño título
• Carta de no antecedentes penales (para carreras de salud)'),

-- Becas
('becas,descuento,apoyo', '¿Tienen becas disponibles?',
'Contamos con becas del 30%, 40% y 50% según tu promedio y situación socioeconómica. También ofrecemos plan a 12 meses sin intereses.

• Beca de Excelencia — hasta 80% (promedio 9.0+)
• Beca Social — hasta 60% (análisis socioeconómico)
• Beca de Continuidad — hasta 50% (alumnos actuales)

La mayoría de nuestros alumnos reciben algún tipo de apoyo.'),

-- Modalidades
('modalidad,horarios', '¿Qué modalidades ofrecen?',
'Ofrecemos 3 modalidades:
• Presencial — lunes a viernes
• En Línea — clases en vivo mar/jue 20–22 hrs + grabaciones
• Sabatina — solo sábados 8–13 hrs

Todas tienen el mismo título con validez SEP.'),

-- Costos / precios
('precios,costo,colegiatura', '¿Cuánto cuesta estudiar?',
'Colegiaturas mensuales:
• Presencial: $4,650/mes | Inscripción: $7,000
• Sabatina (Admón.): $3,960/mes | Inscripción: $3,600
• En Línea: $1,980/mes | Inscripción: $3,600

La modalidad en línea es 57% más económica que la presencial, con el mismo título y validez SEP.'),

-- Revalidación
('revalidacion,equivalencia,cambio', '¿Puedo revalidar materias de otra universidad?',
'Sí contamos con proceso de equivalencias y revalidación de materias para alumnos que vienen de otras instituciones. El proceso lo gestiona el área de Control Escolar.

Te recomendamos traer tu historial académico oficial para que un asesor evalúe qué materias aplican.'),

-- RVOE / validez SEP
('rvoe,sep,validez,oficial', '¿Los títulos tienen validez oficial?',
'Sí, todos nuestros programas cuentan con RVOE (Reconocimiento de Validez Oficial de Estudios) otorgado por la SEP. Algunos programas tienen doble RVOE: estatal + federal (Psicología). Tu título tiene validez oficial en toda la República Mexicana.'),

-- Examen de admisión
('examen,admision,ingreso', '¿Hay examen de admisión?',
'No hay examen de admisión. El proceso es sencillo en 5 pasos:
1. Solicitar información (con Eva o por WhatsApp)
2. Entrevista con un asesor
3. Entrega de documentos
4. Pago de inscripción
5. ¡Inicio de clases!'),

-- Próxima fecha de inicio
('fecha,inicio,generacion', '¿Cuándo inician las clases?',
'La próxima fecha de inicio es el 1 de septiembre de 2026.

Las inscripciones están abiertas ahora. Te recomendamos apartar tu lugar lo antes posible para asegurar tu beca.'),

-- Qué incluye la colegiatura
('incluye,plataforma,moodle', '¿Qué incluye la colegiatura?',
'La colegiatura incluye:
• Acceso a plataforma Moodle
• Google Workspace (correo y herramientas institucionales)
• Biblioteca digital eLibro
• Clases grabadas (modalidad en línea)

Costos adicionales:
• Seguro estudiantil: $400/año
• Campos clínicos (carreras de salud): cargo variable'),

-- No sé qué estudiar / test vocacional
('orientacion,vocacional,carrera,indeciso', '¿Cómo sé qué carrera elegir?',
'Es totalmente normal tener dudas al elegir carrera 😊

Para ayudarte, te recomendamos nuestro test vocacional EVA. En menos de 2 minutos te sugiere las carreras ideales según tu perfil.

👉 https://testunilatino.algorithmus.io/

Cuando lo termines, dile a Eva qué resultado te dio y te ayuda a explorar esa opción.')

ON CONFLICT DO NOTHING;

-- Verificar
SELECT topic, left(question, 50) as question_preview FROM faqs ORDER BY created_at;
