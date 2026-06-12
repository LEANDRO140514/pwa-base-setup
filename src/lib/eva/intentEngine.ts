// ─── Eva Engine — Intent detection ───────────────────────────────────────────

import type { Intent, Entities, ConversationState } from './types'
import { CONFIRMATION_YES, CONFIRMATION_NO } from './normalizer'

// ── Keyword lists per intent ──────────────────────────────────────────────────

const INTENT_KEYWORDS: Partial<Record<Intent, string[]>> = {
  scholarship:  ['beca', 'becas', 'descuento', 'apoyo economico', 'financiamiento', 'precio especial'],
  payment:      ['pagos', 'pago', 'mensualidades', 'meses sin intereses', 'forma de pago', 'pago anual', 'tarjeta', 'credito', 'meses', 'intereses', 'plazos'],
  documents:    ['documento', 'documentos', 'requisito', 'requisitos', 'papeles', 'certificado', 'curp', 'acta'],
  admission:    ['inscripcion', 'inscribirme', 'admision', 'ingreso', 'como me inscribo', 'como entro'],
  schedule:     ['horario', 'horarios', 'dias de clase', 'cuando son las clases', 'turno'],
  revalidation: ['revalidacion', 'equivalencia', 'equivalencias', 'cambio de universidad', 'creditos'],
  faq:          ['cuanto cuesta', 'cuanto es', 'precio', 'costo', 'colegiatura', 'mensualidad', 'incluye', 'rvoe', 'validez', 'reconocida', 'oficial'],
  greeting:     ['hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches', 'saludos'],
}

const CAREER_LIST_KEYWORDS = [
  'carreras', 'programas', 'que tienen', 'que ofrecen', 'opciones', 'oferta academica',
]

// Words that indicate the user has career-specific context (suppress generic greeting FAQ)
const CAREER_CONTEXT_WORDS = [
  'carrera', 'carreras', 'programa', 'programas', 'licenciatura', 'ingenieria',
  'modalidad', 'precio', 'precios', 'costo', 'costos', 'beca', 'inscripcion',
]

/**
 * Determine the single primary intent of a normalized user message.
 * Priority: confirmation > careerName > specific FAQ > modality > area > list > greeting > fallback
 */
export function detectIntent(
  normalizedInput: string,
  entities: Entities,
  _state: ConversationState,
): Intent {
  const n = normalizedInput.trim()

  // 1. Confirmation signals
  if (CONFIRMATION_YES.some((c) => n === c || n.startsWith(c + ' '))) return 'confirmation_yes'
  if (CONFIRMATION_NO.some((c) => n === c || n.startsWith(c + ' '))) return 'confirmation_no'

  // 2. Explicit career name → career_detail (highest data priority)
  if (entities.careerName) return 'career_detail'

  // 3. Specific FAQ intents (topic keywords)
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'greeting') continue  // handled last
    if (keywords?.some((k) => n.includes(k))) return intent as Intent
  }

  // 4. Modality filter
  if (entities.modality) return 'modality_filter'

  // 5. Area → filtered career list
  if (entities.area) return 'career_list'

  // 6. General career listing
  if (CAREER_LIST_KEYWORDS.some((k) => n.includes(k))) return 'career_list'

  // 7. Greeting — ONLY for short/generic messages without career context
  const isShort = n.split(' ').length <= 4
  const hasCareerContext = CAREER_CONTEXT_WORDS.some((w) => n.includes(w))
  if (isShort && !hasCareerContext && INTENT_KEYWORDS.greeting?.some((k) => n.includes(k))) return 'greeting'
  if (n === 'informacion' || n === 'info' || n === 'hola quiero info') return 'greeting'

  return 'fallback'
}
