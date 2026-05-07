// ─── Eva Engine — Response builder ───────────────────────────────────────────

import type { Intent, Entities, ConversationState, Career, FAQ, MatchedSource, Modality } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === '') return ''
  const str = String(price)
  if (str.includes('$')) return str
  const num = parseFloat(str.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return str
  return `$${num.toLocaleString('es-MX')}/mes`
}

function n(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

// ── Career renderers ──────────────────────────────────────────────────────────

function renderCareersByArea(careers: Career[]): string {
  if (!careers.length) return 'No encontré carreras disponibles en este momento.'
  const grouped = careers.reduce<Record<string, Career[]>>((acc, c) => {
    const area = c.area || 'General'
    if (!acc[area]) acc[area] = []
    acc[area].push(c)
    return acc
  }, {})
  const lines = ['Estas son las carreras disponibles:\n']
  for (const [area, items] of Object.entries(grouped)) {
    lines.push(`${area}:`)
    items.forEach((c) => lines.push(`• ${c.name}`))
    lines.push('')
  }
  lines.push('¿Te interesa alguna en particular?')
  return lines.join('\n')
}

function renderOnlineCareers(careers: Career[]): string {
  if (!careers.length) return 'No contamos con carreras en línea en este momento.'
  const lines = ['Tenemos estas opciones en línea:\n']
  careers.forEach((c) => lines.push(`• ${c.name} — ${formatPrice(c.monthly_price) || 'Precio por confirmar'}`))
  lines.push('')
  lines.push('Clases en vivo en horario nocturno + grabaciones. Mismo título con validez SEP.')
  lines.push('\n¿Te interesa alguna o quieres iniciar tu proceso?')
  return lines.join('\n')
}

function renderPresentialCareers(careers: Career[]): string {
  if (!careers.length) return 'No encontré carreras presenciales en este momento.'
  const lines = ['Estas son nuestras carreras presenciales:\n']
  careers.forEach((c) => lines.push(`• ${c.name} — ${formatPrice(c.monthly_price) || 'Precio por confirmar'}`))
  lines.push('\n¿Te interesa alguna?')
  return lines.join('\n')
}

function renderSaturdayCareers(careers: Career[]): string {
  if (!careers.length) return 'No tenemos carreras sabatinas en este momento.'
  const lines = ['Estas son nuestras opciones sabatinas:\n']
  careers.forEach((c) => lines.push(`• ${c.name} — ${formatPrice(c.monthly_price) || 'Precio por confirmar'}`))
  lines.push('\n¿Quieres que te explique cómo funcionan los horarios?')
  return lines.join('\n')
}

function renderAreaCareers(area: string, careers: Career[]): string {
  if (!careers.length) return `No encontré carreras del área de ${area} en este momento.`
  const lines = [`Carreras del área de ${area}:\n`]
  careers.forEach((c) => lines.push(`• ${c.name} — ${c.modality}`))
  lines.push('\n¿Te gustaría conocer precios o el proceso de inscripción?')
  return lines.join('\n')
}

function renderCareerDetail(
  careerFragment: string,
  careers: Career[],
  effectiveModality: string | null,
): string {
  const frag = n(careerFragment)

  // Find all careers matching the fragment
  let matched = careers.filter(
    (c) => n(c.name).includes(frag) || frag.includes(n(c.name)),
  )

  // Narrow by modality if we have context and multiple results
  if (effectiveModality && matched.length > 1) {
    const filtered = matched.filter((c) => n(c.modality) === n(effectiveModality))
    if (filtered.length > 0) matched = filtered
  }

  if (!matched.length) {
    return 'No encontré esa carrera en este momento. ¿Puedes indicarme el nombre completo?'
  }

  // Multiple modalities for same career → show options
  if (matched.length > 1) {
    const baseName = matched[0].name.replace(/ Online$/, '').replace(/ Sabatina$/, '').replace(/ Presencial$/, '')
    const lines = [`${baseName} está disponible en estas modalidades:\n`]
    matched.forEach((c) => {
      const price = formatPrice(c.monthly_price)
      const dur = c.duration ? ` | ${c.duration}` : ''
      lines.push(`• ${c.modality} — ${price}${dur}`)
    })
    lines.push('\n¿Cuál modalidad te interesa o quieres conocer las becas disponibles?')
    return lines.join('\n')
  }

  const c = matched[0]
  const parts: string[] = [c.name]
  parts.push(`• Modalidad: ${c.modality}`)
  if (c.duration) parts.push(`• Duración: ${c.duration}`)
  parts.push(`• Colegiatura: ${formatPrice(c.monthly_price) || 'Precio por confirmar'}`)
  if (c.enrollment_price) parts.push(`• Inscripción: ${formatPrice(c.enrollment_price)}`)
  if (c.description) parts.push(`\n${c.description}`)
  if (c.job_field) parts.push(`\nCampo laboral: ${c.job_field}`)
  parts.push('\n¿Te gustaría conocer las becas disponibles o iniciar tu proceso de inscripción?')
  return parts.join('\n')
}

// ── FAQ utilities ─────────────────────────────────────────────────────────────

function findFAQByTriggers(faqs: FAQ[], ...keywords: string[]): FAQ | null {
  return faqs.find((faq) => faq.triggers.some((t) => keywords.includes(n(t)))) ?? null
}

// ── Pending action handlers ───────────────────────────────────────────────────

export const PENDING_ACTIONS: Record<string, (careers: Career[]) => string> = {
  show_saturday_schedules: (careers) => {
    const sat = careers.filter((c) => n(c.modality) === 'sabatina')
    const list = sat.length
      ? sat.map((c) => `• ${c.name} — ${formatPrice(c.monthly_price)}`).join('\n')
      : '• Administración Sabatina — $3,960/mes'
    return `Las clases sabatinas son los sábados de 8:00 a 13:00 hrs.\n\nIdeal para personas que trabajan de lunes a viernes.\n\n${list}\n\nMismo título y validez SEP. ¿Te interesa iniciar tu proceso de inscripción?`
  },
  show_admission_requirements: () =>
    'El proceso de inscripción tiene 5 pasos:\n\n1. Solicitar información ✓\n2. Entrevista con un asesor\n3. Entrega de documentos\n4. Pago de inscripción\n5. Inicio de clases\n\nNo se requiere examen de admisión. ¿Te gustaría agendar tu entrevista?',
  show_scholarship_detail: () =>
    'Contamos con las siguientes becas:\n\n• Beca de Excelencia — hasta 80% (promedio 9.0+)\n• Beca Social — hasta 60% (análisis socioeconómico)\n• Beca de Continuidad — hasta 50% (alumnos actuales)\n• Plan a 12 meses sin intereses\n\nPuedes solicitarla desde la sección "Mi Beca" en la app. ¿Necesitas más información?',
}

// ── Static FAQ fallbacks ──────────────────────────────────────────────────────

const STATIC_FAQS: Partial<Record<Intent, { response: string; pendingAction?: string }>> = {
  scholarship: {
    response: 'Contamos con becas del 30% al 80% según promedio y situación socioeconómica, además de plan a 12 meses sin intereses.',
    pendingAction: 'show_scholarship_detail',
  },
  documents: {
    response: 'Documentos requeridos: certificado de bachillerato, identificación oficial (INE/pasaporte), CURP, acta de nacimiento y 2 fotografías. Carreras de salud requieren adicionalmente carta de no antecedentes penales.',
  },
  admission: {
    response: 'El proceso de admisión no requiere examen. Incluye: solicitud de información, entrevista con asesor, entrega de documentos, pago de inscripción e inicio de clases.',
    pendingAction: 'show_admission_requirements',
  },
  schedule: {
    response: 'Ofrecemos 3 modalidades:\n\n• Presencial (lun–vie)\n• En Línea (mar/jue 20–22 hrs + grabaciones)\n• Sabatina (solo sábados 8–13 hrs)\n\nTodas con el mismo título y validez SEP.',
  },
  revalidation: {
    response: 'Sí contamos con proceso de equivalencias. El área de Control Escolar evalúa tu historial académico para determinar qué materias aplican. ¿Quieres que te pongamos en contacto?',
  },
  faq: {
    response: 'Colegiaturas mensuales:\n\n• Presencial: $4,650/mes | Inscripción: $7,000\n• Sabatina: $3,960/mes | Inscripción: $3,600\n• En Línea: $1,980/mes | Inscripción: $3,600',
  },
}

// ── Build result type ─────────────────────────────────────────────────────────

export interface BuildResult {
  text: string
  source: MatchedSource
  pendingAction: string | null
  confidence: number
}

// ── Main buildResponse ────────────────────────────────────────────────────────

export function buildResponse(
  intent: Intent,
  entities: Entities,
  state: ConversationState,
  careers: Career[],
  faqs: FAQ[],
): BuildResult {
  const effectiveModality: Modality | null = entities.modality ?? (state.currentModality as Modality | null)

  switch (intent) {
    case 'greeting':
      return {
        text: 'Hola, soy Eva, asesora académica de Universidad Latino. Puedo orientarte sobre nuestras carreras, precios, becas y proceso de admisión. ¿En qué puedo ayudarte?',
        source: 'fallback', pendingAction: null, confidence: 1,
      }

    case 'career_detail': {
      const text = renderCareerDetail(entities.careerName!, careers, effectiveModality)
      return { text, source: 'careers', pendingAction: null, confidence: 1 }
    }

    case 'scholarship': {
      const faq = findFAQByTriggers(faqs, 'beca', 'becas', 'descuento')
      return {
        text: faq?.response ?? STATIC_FAQS.scholarship!.response,
        source: faq ? 'faq' : 'fallback',
        pendingAction: 'show_scholarship_detail',
        confidence: 1,
      }
    }

    case 'documents': {
      const faq = findFAQByTriggers(faqs, 'documentos', 'requisitos', 'papeles')
      return {
        text: faq?.response ?? STATIC_FAQS.documents!.response,
        source: faq ? 'faq' : 'fallback',
        pendingAction: null,
        confidence: 1,
      }
    }

    case 'admission': {
      const faq = findFAQByTriggers(faqs, 'inscripcion', 'admision')
      return {
        text: faq?.response ?? STATIC_FAQS.admission!.response,
        source: faq ? 'faq' : 'fallback',
        pendingAction: 'show_admission_requirements',
        confidence: 1,
      }
    }

    case 'schedule':
      return { text: STATIC_FAQS.schedule!.response, source: 'faq', pendingAction: null, confidence: 1 }

    case 'revalidation':
      return { text: STATIC_FAQS.revalidation!.response, source: 'faq', pendingAction: null, confidence: 1 }

    case 'faq':
      return { text: STATIC_FAQS.faq!.response, source: 'faq', pendingAction: null, confidence: 0.8 }

    case 'modality_filter': {
      if (effectiveModality === 'En línea') {
        const online = careers.filter((c) => n(c.modality) === 'en linea')
        return { text: renderOnlineCareers(online), source: 'careers', pendingAction: null, confidence: 1 }
      }
      if (effectiveModality === 'Presencial') {
        const presential = careers.filter((c) => n(c.modality) === 'presencial')
        return { text: renderPresentialCareers(presential), source: 'careers', pendingAction: null, confidence: 1 }
      }
      if (effectiveModality === 'Sabatina') {
        const sat = careers.filter((c) => n(c.modality) === 'sabatina')
        return { text: renderSaturdayCareers(sat), source: 'careers', pendingAction: 'show_saturday_schedules', confidence: 1 }
      }
      return { text: renderCareersByArea(careers), source: 'careers', pendingAction: null, confidence: 0.5 }
    }

    case 'career_list': {
      if (entities.area) {
        const areaCareers = careers.filter((c) => n(c.area) === n(entities.area!))
        return { text: renderAreaCareers(entities.area, areaCareers), source: 'careers', pendingAction: null, confidence: 1 }
      }
      return { text: renderCareersByArea(careers), source: 'careers', pendingAction: null, confidence: 1 }
    }

    case 'confirmation_yes':
      return {
        text: 'Claro, con gusto. ¿Sobre qué te gustaría más información: costos, becas, proceso de inscripción o carreras disponibles?',
        source: 'fallback', pendingAction: null, confidence: 0.5,
      }

    case 'confirmation_no':
      return {
        text: 'Entendido. ¿Hay algo más en lo que pueda ayudarte?',
        source: 'fallback', pendingAction: null, confidence: 1,
      }

    default:
      return {
        text: 'Puedo ayudarte con:\n\n• Carreras disponibles\n• Costos y becas\n• Requisitos de inscripción\n• Modalidades\n\n¿Qué te gustaría saber?',
        source: 'fallback', pendingAction: null, confidence: 0,
      }
  }
}
